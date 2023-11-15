import { promises as fs } from 'fs';
import * as gettextParser from 'gettext-parser';
import { GetTextTranslations } from 'gettext-parser';
import * as path from 'path';

import { ENerveLocale } from '@enums';

import { Logger } from '@decorators';

import { NerveNodeObject } from '@node/NerveNodeObject';

import { INerveServerLocalesManagerOptions, TNerveServerLocalesList } from './types';

@Logger({ prefix: 'LocalesManager' })
export class NerveServerLocalesManager extends NerveNodeObject {

	protected options: INerveServerLocalesManagerOptions;
	protected locales: TNerveServerLocalesList;
	protected translations: { [key in ENerveLocale]: Record<string, string> } = {} as { [key in ENerveLocale]: Record<string, string> };
	protected localesWithoutContext: { [key in ENerveLocale]: Record<string, string> } = {} as { [key in ENerveLocale]: Record<string, string> };

	constructor(options: INerveServerLocalesManagerOptions) {
		super();

		this.options = options;
	}

	public async init() {
		const { list, source } = this.options.app.config.locales;

		await this.readLocales();
		await this.readSourceLocales(source);

		await Promise.allSettled(
			list.map(async (locale) => this.readSourceLocales(locale)),
		);
	}

	public getLocales(locale: ENerveLocale) {
		this.logDebug(`getLocales (${locale})`);

		let locales = this.translations[locale];

		if (!locales) {
			const fallbackLocale = Object.keys(this.translations)[0] as ENerveLocale;

			this.logDebug(`Locale "${locale}" is empty fallback to "${fallbackLocale}"`);
			locales = this.translations[fallbackLocale];
		}

		if (!locales) {
			this.logDebug(`All locales is empty`);

			locales = {};
		}

		return locales;
	}

	protected async readSourceLocales(locale: ENerveLocale) {
		const templatesDir = this.options.app.getTemplatesDir();
		const fileName = path.resolve(templatesDir, 'locales.json');

		this.logInfo(`Read source locales file ${fileName} for locale "${locale}"`);

		try {
			const content = await fs.readFile(fileName, { encoding: 'utf-8' });

			this.translations[locale] = this.walkLocales(locale, JSON.parse(content) as Record<string, unknown>) as Record<string, string>;
		} catch (err) {
			this.logError(`Failed read locales JSON: `, err as Error);
		}
	}

	protected walkLocales(locale: ENerveLocale, locales: Record<string, unknown>, ctx?: string): Record<string, unknown> {
		return Object.keys(locales).reduce(
			(acc, key) => {
				const item = locales[key];

				return {
					...acc,
					[key]: typeof item === 'object'
						? this.walkLocales(locale, item as Record<string, unknown>, ctx || key)
						: this.getText(locale, item as string, ctx),
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

		const translations = (
			await Promise.all(
				list
					.filter((locale) => locale !== source)
					.map(async (locale) => (
						new Promise<{ locale: ENerveLocale, translations: GetTextTranslations['translations'] }>(async (resolve, reject) => {
							const fileName = path.resolve(localesDir, locale as string, localesFileName);

							this.logInfo(`Read translation file ${fileName}`);

							try {
								const content = await fs.readFile(fileName, { encoding: 'utf-8' });
								const locales = gettextParser.po.parse(content);

								this.localesWithoutContext[locale] = {};
								Object.keys(locales.translations)
									.forEach((ctx) => {
										Object.keys(locales.translations[ctx])
											.forEach((msgId) => {
												const item = locales.translations[ctx][msgId];

												this.localesWithoutContext[locale][msgId] = item.msgstr[0];
											});
									});

								resolve({
									locale,
									translations: locales.translations,
								});
							} catch (err) {
								this.logError('Failed read locales: ', err as Error);

								resolve(null);
							}
						})
					)),
			)
		).filter((item) => Boolean(item));

		this.locales = translations.reduce(
			(acc, translation) => ({
				...acc,
				[translation.locale]: translation.translations,
			}),
			{} as TNerveServerLocalesList,
		);
	}

	protected getText(locale: ENerveLocale, textId: string, ctx = '') {
		const { source, isFallbackToSource } = this.options.app.config.locales;

		if (textId.trim().length === 0) {
			return '';
		}

		let translated = this.locales?.[locale]?.[ctx]?.[textId]?.msgstr?.[0] || this.getAlternateContextText(locale, textId);

		if (!translated && (isFallbackToSource || source === locale)) {
			translated = textId;
		}

		return translated || '';
	}

	protected getAlternateContextText(locale: ENerveLocale, textId: string) {
		return this.localesWithoutContext?.[locale]?.[textId] || '';
	}

}
