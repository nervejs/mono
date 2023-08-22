import { Logger } from '@decorators';

import { NerveNodeActiveUser } from '@node/NerveNodeActiveUser';

import { NerveRestApp } from '../NerveRestApp';

import { INerveRestActiveUserOptions } from './types';

@Logger({ prefix: 'ActiveUser' })
export class NerveRestActiveUser extends NerveNodeActiveUser {

	protected options: INerveRestActiveUserOptions;

	protected app: NerveRestApp;

}
