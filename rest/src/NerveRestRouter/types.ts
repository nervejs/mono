import { INerveNodeRouterOptions } from '@node/NerveNodeRouter';

import { NerveRestApp } from '../NerveRestApp';

export interface INerveRestRouterOptions extends INerveNodeRouterOptions {
	app: NerveRestApp;
}
