import { promises as fs } from 'fs';
import * as path from 'path';

import { ENerveLocale } from '@enums';

import { Logger } from '@decorators';

import { NerveNodeObject } from '@node/NerveNodeObject';

import { NerveServerLocalesSocketClient } from './NerveServerLocalesSocketClient';

import {
	INerveServerLocalesManagerNewOptions,
	INerveLocaleComponentItem,
	INerveServerLocaleFromServerItem,
	INerveServerLocaleResponseFromServer,
} from './types';

@Logger({ prefix: 'LocalesManager' })
export class NerveServerLocalesManagerNew extends NerveNodeObject {

	protected options: INerveServerLocalesManagerNewOptions;
	protected translations = {} as { [key in ENerveLocale]: Record<string, unknown> };
	protected sourceLocales: Record<string, unknown> = {};
	protected socketClient: NerveServerLocalesSocketClient;

	constructor(options: INerveServerLocalesManagerNewOptions) {
		super();

		this.options = options;
	}

	public async init() {
		const {
			list,
			source,
			socket: { isEnabled: isSocketEnabled },
		} = this.options.app.config.locales;

		await this.readSourceLocales(source);

		await Promise.all(
			list.map(async (item) => this.fetchTranslates(item)),
		);

		if (isSocketEnabled) {
			this.socketClient = new NerveServerLocalesSocketClient({
				app: this.options.app,
				onUpdate: async () => this.onSocketClientUpdate(),
			});
		}
	}

	protected async readSourceLocales(locale: ENerveLocale) {
		const templatesDir = this.options.app.getTemplatesDir();
		const fileName = path.resolve(templatesDir, 'locales-new.json');

		this.logInfo(`Read source locales file ${fileName} for locale "${locale}"`);

		try {
			const content = await fs.readFile(fileName, { encoding: 'utf-8' });
			const contentParsed = JSON.parse(content) as Record<string, INerveLocaleComponentItem>;

			this.sourceLocales = Object.entries(contentParsed).reduce(
				(acc, [key, item]) => {
					acc[key] = item.items;

					return acc;
				},
				{} as Record<string, unknown>,
			);
		} catch (err) {
			this.log.error(`Failed read locales JSON: `, err as Error);
		}
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

	protected translateSourceToLocale(componentName: string, source: Record<string, unknown>, translates: INerveServerLocaleFromServerItem[]) {
		const result: Record<string, unknown> = {};

		Object.keys(source).forEach((key) => {
			if (typeof source[key] === 'string') {
				const translatedItem = translates.find((item) => (
					item.componentName === componentName &&
						item.text === source[key]
				));
				let translated = translatedItem?.translated;

				if (!translated && this.options.app.config.locales.isFallbackToSource) {
					translated = source[key] as string;
				}

				result[key] = translated;
			} else {
				result[key] = this.translateSourceToLocale(componentName, source[key] as Record<string, unknown>, translates);
			}
		});

		return result;
	}

	protected async fetchTranslates(locale: ENerveLocale) {
		const {
			host,
			protocol,
			prefixUrl,
			projectId,
		} = this.options.app.config.locales.server;
		const branch = this.options.app.getInstanceId();
		const Request = this.options.app.getRequestModule();

		const response = await Request.fetchDirect<INerveServerLocaleResponseFromServer>({
			app: this.options.app,
		}, {
			host,
			protocol,
			url: `${prefixUrl}/external/projects/${projectId}/locales/${locale}/branches/${branch}/texts`,
		});

		this.translations[locale] = Object.keys(this.sourceLocales).reduce(
			(acc, componentName) => {
				acc[componentName] = this.translateSourceToLocale(componentName, this.sourceLocales[componentName] as Record<string, unknown>, response.data.texts);

				return acc;
			},
			{} as Record<string, unknown>,
		);
	}

	protected async onSocketClientUpdate() {
		const { list } = this.options.app.config.locales;

		await Promise.all(
			list.map(async (item) => this.fetchTranslates(item)),
		);
	}

}
