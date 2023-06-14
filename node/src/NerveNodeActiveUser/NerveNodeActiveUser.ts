import { Logger } from '@decorators';

import { NerveNodeObject } from '../NerveNodeObject';

import { NerveNodeApp } from '../NerveNodeApp';

import { INerveActiveUserData } from '@interfaces';

import { INerveNodeActiveUserOptions } from './types';

@Logger({ prefix: 'ActiveUser' })
export class NerveNodeActiveUser extends NerveNodeObject {

	protected options: INerveNodeActiveUserOptions;

	protected app: NerveNodeApp;

	data: INerveActiveUserData;

	constructor(options: INerveNodeActiveUserOptions) {
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
