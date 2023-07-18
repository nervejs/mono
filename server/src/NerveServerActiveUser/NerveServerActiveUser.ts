import { Logger } from '@decorators';

import { NerveNodeActiveUser } from '@node/NerveNodeActiveUser';

import { NerveServerApp } from '../NerveServerApp';

import { INerveServerActiveUserOptions } from './types';

@Logger({ prefix: 'ActiveUser' })
export class NerveServerActiveUser extends NerveNodeActiveUser {

	protected options: INerveServerActiveUserOptions;

	protected app: NerveServerApp;

}
