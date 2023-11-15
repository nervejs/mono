import { GetTextTranslations } from 'gettext-parser';

import { ENerveLocale } from '@common/enums';

import { NerveServerApp } from '../NerveServerApp';

export interface INerveServerLocalesManagerNewOptions {
	app: NerveServerApp;
}

export type TNerveServerLocalesList = {
	[key in ENerveLocale]: GetTextTranslations['translations'];
}

export interface INerveLocaleComponentItem {
	id: string;
	items: Record<string, unknown>;
}

export interface INerveServerLocaleFromServerItem {
	componentName: string;
	text: string;
	translated: string;
}

export interface INerveServerLocaleResponseFromServer {
	texts: INerveServerLocaleFromServerItem[];
}
