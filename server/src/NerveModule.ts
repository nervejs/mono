import * as fs from 'fs';

import { NerveApp } from './NerveApp';
import { NerveObject } from './NerveObject';
import { NerveLocales } from './utils/NerveLocales';
import { NerveDebug } from './utils/NerveDebug';
import { NerveActiveUser } from './NerveActiveUser';
import { NerveHelpers } from './utils/NerveHelpers';
import { TLocalesItem } from './types/TLocalesItem';

let localesCache: any = {};

export interface INerveModuleOptions {}

export class NerveModule extends NerveObject {

	protected app: NerveApp;
	protected activeUser: NerveActiveUser;
	protected options: INerveModuleOptions;

	constructor(app: NerveApp, options: INerveModuleOptions) {
		super();

		this.options = options;
		this.app = app;
	}

	getApp(): NerveApp {
		return this.app;
	}

	getActiveUser(): NerveActiveUser {
		return this.activeUser;
	}

	setActiveUser(activeUser: NerveActiveUser) {
		this.activeUser = activeUser;

		return this;
	}

	getLocales(): any {
		return null;
	}

	readLocales(pathToFile: string): Promise<any> {
		let locales;

		return new Promise((resolve, reject) => {
			fs.readFile(pathToFile, (err: Error, content: Buffer) => {
				if (err) {
					NerveDebug.error(err.toString());
					reject(err);
				} else {
					locales = JSON.parse(content.toString());
					resolve(this.walkLocales(locales));
				}
			});
		});
	}

	walkLocales(locales: any) {
		let result: any = {};

		Object.keys(locales).forEach((key: string) => {
			let item: TLocalesItem = locales[key];

			if (NerveHelpers.isString(item)) {
				result[key] = this.getTextBySource(<string>item);
			} else if (NerveHelpers.isObject(item) && item.text && (item.vars || item.ctx)) {
				result[key] = this.getTextBySource(item.text, item.ctx, item.vars);
			} else if (NerveHelpers.isObject(item)) {
				result[key] = this.walkLocales(item);
			}
		});

		return result;
	}

	getTextBySource(message: string, ctx?: string, params?: any): string {
		let localeStr: string,
			globalParams: any = this.getLocalesParams();

		if (NerveHelpers.isObject(ctx)) {
			params = ctx;
			ctx = '';
		}

		localeStr = NerveLocales.getText(message, this.activeUser.getLocale(), ctx) || message;

		if (params || globalParams) {
			params = { ...params, ...globalParams };

			Object.keys(params).forEach(function (item) {
				var reg = new RegExp('##' + item + '##', 'g');

				localeStr = localeStr.replace(reg, params[item]);
			});
		}

		return localeStr;
	}

	getText(id: string): string {
		let currentLocale: string = this.activeUser.getLocale(),
			localesObject = localesCache[this.constructor.name] && localesCache[this.constructor.name][currentLocale] ? localesCache[this.constructor.name][currentLocale] : {},
			arIds = id.split('.'),
			iteration = 0,
			localesItem = localesObject;

		while (localesItem && iteration < arIds.length) {
			if (localesItem[arIds[iteration]]) {
				localesItem = localesItem[arIds[iteration]];
			} else {
				localesItem = null;
			}

			iteration++;
		}

		return localesItem;
	}

	getLocalesParams(): any {
		return null;
	}

	getLocalesVars(): Promise<any> {
		let currentLocale = this.activeUser.getLocale(),
			localesPromise,
			localesObject = {};

		if (!localesCache[this.constructor.name] || (this.app && this.app.config.isTestServer)) {
			localesCache[this.constructor.name] = {};
		}

		return new Promise((resolve: Function) => {
			if (localesCache[this.constructor.name][currentLocale]) {
				resolve({
					locales: localesCache[this.constructor.name][currentLocale]
				});
			} else {
				localesPromise = this.getLocales();

				if (localesPromise) {
					localesPromise
						.then((locales: any[]) => {
							if (Array.isArray(locales)) {
								locales.forEach((localesItem: any) => localesObject = { ...localesObject, ...localesItem });
							} else {
								localesObject = locales;
							}

							localesCache[this.constructor.name][currentLocale] = localesObject;

							resolve({
								locales: localesObject
							});
						});
				} else {
					resolve({});
				}
			}
		});
	}

}