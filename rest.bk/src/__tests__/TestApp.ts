import { ENerveLogLevel, INerveRestAuthLoginParams, INerveRestAuthOptions, NerveRestApp } from '..';

import { TestRouter } from './TestRouter';

export class TestApp extends NerveRestApp {

	protected port = 15000;

	protected router: TestRouter = new TestRouter();

	async run() {
		this.setLogLevel(ENerveLogLevel.DEBUG);

		return super.run();
	}

	getAuthOptions(): INerveRestAuthOptions {
		return {
			secret: '12345',
			// eslint-disable-next-line @typescript-eslint/require-await
			async login(params: INerveRestAuthLoginParams) {
				return true;
			},
			// eslint-disable-next-line @typescript-eslint/require-await
			async getCurrentUser(params: INerveRestAuthLoginParams) {
				return null;
			},
		};
	}

}
