import { INerveNodeRouteHandlerOptions } from '@node/NerveNodeRouteHandler';

import { NerveRestApp } from '../NerveRestApp';
import { INerveRestContextOptions } from '../NerveRestContext';

export interface INerveRestActionOptions extends INerveNodeRouteHandlerOptions {
	app: NerveRestApp;
}

export interface INerveRestActionScheme {
	request: INerveRestContextOptions['scheme'];
}
