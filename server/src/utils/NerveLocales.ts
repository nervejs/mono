import * as fs from 'fs';
import * as gettextParser from 'gettext-parser';
import * as path from 'path';

import { NerveApp } from '../NerveApp';
import { NerveDebug } from './NerveDebug';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let locales: any = {};

export class NerveLocales {

	static init(app: NerveApp) {
		let localesDir = app.config.paths.locales;

		if (localesDir) {
			fs.readdir(localesDir, (err: Error, files: string[]) => {
				if (err) {
					NerveDebug.error('Failed read locales: ', err);
				} else {
					files.forEach((locale: string) => {
						const filePath: string = path.resolve(localesDir, locale, app.config.localesFileName);

						fs.readFile(filePath, (err: Error, content: Buffer) => {
							locales[locale] = gettextParser.po.parse(content.toString()).translations;
						});
					});
				}
			});
		}
	}

	static getText(message: string, locale: string, ctx: string): string {
		let result;

		ctx = ctx || '';

		result = locales[locale] && locales[locale][ctx] && locales[locale][ctx][message] && locales[locale][ctx][message].msgstr && locales[locale][ctx][message].msgstr[0];

		return result || message;
	}

}
