import * as express from 'express';

import { TestApp } from './TestApp';
import { TestRouter } from './TestRouter';

describe('Router', () => {
	it('init', async () => {
		const app = new TestApp();
		const router = new TestRouter();

		router.setExpress(express());

		await router.init(app);
	});
});
