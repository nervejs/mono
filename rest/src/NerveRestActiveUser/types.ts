import { INerveNodeActiveUserOptions } from '@node/NerveNodeActiveUser';

import { NerveRestApp } from '../NerveRestApp';

export interface INerveServerActiveUserOptions extends INerveNodeActiveUserOptions {
	app: NerveRestApp;
}
