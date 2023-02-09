import { promises as fs } from 'fs';
import * as gettextParser from 'gettext-parser';
import { GetTextTranslations } from 'gettext-parser';
import * as path from 'path';

import { ENerveLocale } from '@enums';

import { Logger } from '@decorators';

import { NerveServerObject } from '../NerveServerObject';

import { TNerveServerLocalesList, INerveServerLocalesManagerOptions } from './types';

@Logger({ prefix: 'LocalesManager' })
export class NerveServerLocalesManager extends NerveServerObject {

	protected options: INerveServerLocalesManagerOptions;
	protected locales: TNerveServerLocalesList;
	protected translations: { [key in ENerveLocale]: Record<string, string> } = {} as { [key in ENerveLocale]: Record<string, string> };

	constructor(options: INerveServerLocalesManagerOptions) {
		super();

		this.options = options;
	}

	public async init() {
		const { list, source } = this.options.app.config.locales;

		await this.readLocales();
		await this.readSourceLocales(source);

		await Promise.all(
			list.map(async (locale) => this.readSourceLocales(locale)),
		);
	}

	public getLocales(locale: ENerveLocale) {
		return this.translations[locale] || {};
	}

	protected async readSourceLocales(locale: ENerveLocale) {
		const templatesDir = this.options.app.getTemplatesDir();
		const fileName = path.resolve(templatesDir, 'locales.json');

		try {
			const content = await fs.readFile(fileName, { encoding: 'utf-8' });

			this.translations[locale] = this.walkLocales(locale, JSON.parse(content) as Record<string, unknown>) as Record<string, string>;
		} catch (err) {
			this.log.error(`Failed read locales JSON: `, err as Error);
		}
	}

	protected walkLocales(locale: ENerveLocale, locales: Record<string, unknown>): Record<string, unknown> {
		return Object.keys(locales).reduce(
			(acc, key) => {
				const item = locales[key];

				return {
					...acc,
					[key]: typeof item === 'object'
						? this.walkLocales(locale, item as Record<string, unknown>)
						: this.getText(locale, item as string),
				};
			},
			{} as Record<string, unknown>,
		);
	}

	protected async readLocales() {
		const {
			paths: { locales: { fileName: localesFileName } },
			locales: { source, list },
		} = this.options.app.config;
		const localesDir = this.options.app.getLocalesDir();

		const translations = await Promise.all(
			list
				.filter((locale) => locale !== source)
				.map(async (locale) => (
					new Promise<{ locale: ENerveLocale, translations: GetTextTranslations['translations'] }>(async (resolve, reject) => {
						const fileName = path.resolve(localesDir, locale as string, localesFileName);

						try {
							const content = await fs.readFile(fileName, { encoding: 'utf-8' });
							const locales = gettextParser.po.parse(content);

							resolve({
								locale,
								translations: locales.translations,
							});
						} catch (err) {
							this.log.error('Failed read locales: ', err as Error);

							reject(err);
						}
					})
				)),
		);

		this.locales = translations.reduce(
			(acc, translation) => ({
				...acc,
				[translation.locale]: translation.translations,
			}),
			{} as TNerveServerLocalesList,
		);
	}

	protected getText(locale: ENerveLocale, textId: string, ctx = '') {
		return this.locales?.[locale]?.[ctx]?.[textId]?.msgstr?.[0] || textId;
	}

}
