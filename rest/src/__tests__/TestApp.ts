import { ENerveRestLogLevel, INerveRestAuthLoginParams, INerveRestAuthOptions, NerveRestApp } from '..';

import { TestRouter } from './TestRouter';

export class TestApp extends NerveRestApp {

	protected port = 15000;

	protected router: TestRouter = new TestRouter();

	async run() {
		this.setLogLevel(ENerveRestLogLevel.DEBUG);

		return super.run();
	}

	getAuthOptions(): INerveRestAuthOptions {
		return {
			secret: '12345',
			async login(params: INerveRestAuthLoginParams) {
				return true;
			},
			async getCurrentUser(params: INerveRestAuthLoginParams) {
				return null;
			},
		};
	}

}
