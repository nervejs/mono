import { Logger } from '@decorators';

import { NerveServerApp } from '../NerveServerApp';
import { NerveServerObject } from '../NerveServerObject';

import { INerveActiveUserData } from '@interfaces';

import { INerveServerActiveUserOptions } from './types';

@Logger({ prefix: 'ActiveUser' })
export class NerveServerActiveUser extends NerveServerObject {

	protected options: INerveServerActiveUserOptions;

	protected app: NerveServerApp;

	data: INerveActiveUserData;

	constructor(options: INerveServerActiveUserOptions) {
		super();

		this.options = options;
		this.app = options.app;
	}

	getUniqIdentifier(): string {
		return null;
	}

	isAuthorized() {
		return this.data.isAuthorized;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async init(): Promise<void> {
		this.data = { isAuthorized: false };
	}

}
