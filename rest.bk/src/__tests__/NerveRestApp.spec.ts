import * as request from 'request';

import { TestApp } from './TestApp';

describe('App', () => {
	it('run', (done) => {
		const app = new TestApp();
		const url = `http://127.0.0.1:${app.getPort()}`;

		app.run()
			.then(() => {
				request(url, (error: Error) => {
					expect(error)
						.toBe(null);

					app.stop();

					request(url, (err: NodeJS.ErrnoException) => {
						expect(err.code)
							.toBe('ECONNREFUSED');

						done();
					});
				});
			})
			.catch((err) => {
				done('Failed run app');
			});
	});
});
