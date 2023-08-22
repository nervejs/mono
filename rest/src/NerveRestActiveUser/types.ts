import { INerveNodeActiveUserOptions } from '@node/NerveNodeActiveUser';

import { NerveRestApp } from '../NerveRestApp';

export interface INerveRestActiveUserOptions extends INerveNodeActiveUserOptions {
	app: NerveRestApp;
}
