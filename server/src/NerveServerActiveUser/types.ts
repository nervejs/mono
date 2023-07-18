import { INerveNodeActiveUserOptions } from '@node/NerveNodeActiveUser';

import { NerveServerApp } from '../NerveServerApp';

export interface INerveServerActiveUserOptions extends INerveNodeActiveUserOptions {
	app: NerveServerApp;
}
