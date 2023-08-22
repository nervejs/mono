import { Logger } from '@decorators';

import { NerveNodeActiveUser } from '@node/NerveNodeActiveUser';

import { NerveRestApp } from '../NerveRestApp';

import { INerveServerActiveUserOptions } from './types';

@Logger({ prefix: 'ActiveUser' })
export class NerveRestActiveUser extends NerveNodeActiveUser {

	protected options: INerveServerActiveUserOptions;

	protected app: NerveRestApp;

}
