import { INerveNodeRouterOptions } from '@node/NerveNodeRouter';

import { NerveServerApp } from '../NerveServerApp';

export interface INerveServerRouterOptions extends INerveNodeRouterOptions {
	app: NerveServerApp;
}
