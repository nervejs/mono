import { TestServerApp } from './TestServerApp';

void (async () => {
	const app = new TestServerApp({
		workDir: __dirname,
	});

	await app.init();

	void app.run();
})();
