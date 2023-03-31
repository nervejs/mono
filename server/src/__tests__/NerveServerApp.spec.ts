import fetch from 'node-fetch';

import { TestServerApp } from './TestServerApp';

const fetchUrl = async (url: string): Promise<{err: Error & { code?: string }}> => {
	return new Promise(async (resolve) => {
		try {
			await fetch(url);

			resolve({ err: null });
		} catch (err) {
			resolve({ err: err as Error });
		}
	});
};

describe('App', () => {
	it('run', async () => {
		const port = 4040;
		const app = new TestServerApp({
			workDir: __dirname,
			http: { port },
		});
		const url = `http://127.0.0.1:${port}`;

		await app.init();
		void app.run();

		const { err: err1 } = await fetchUrl(url);

		expect(err1).toBe(null);

		await app.stop();

		const { err: err2 } = await fetchUrl(url);

		expect(err2?.code).toBe('ECONNREFUSED');
	});
});
