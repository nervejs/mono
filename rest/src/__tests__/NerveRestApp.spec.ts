/* tslint:disable: no-http-string */

import * as request from 'request';

import { TestApp } from './TestApp';

describe('App', () => {
	it('run', async (done) => {
		const app = new TestApp();
		const url = `http://127.0.0.1:${app.getPort()}`;

		await app.run();

		request(url, (error: Error) => {
			expect(error)
				.toBe(null);

			app.stop();

			request(url, (error: NodeJS.ErrnoException) => {
				expect(error.code)
					.toBe('ECONNREFUSED');

				done();
			});
		});
	});
});