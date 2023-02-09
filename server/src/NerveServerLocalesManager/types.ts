import { GetTextTranslations } from 'gettext-parser';

import { ENerveLocale } from '@common/enums';

import { NerveServerApp } from '../NerveServerApp';

export interface INerveServerLocalesManagerOptions {
	app: NerveServerApp;
}

export type TNerveServerLocalesList = {
	[key in ENerveLocale]: GetTextTranslations['translations'];
}
