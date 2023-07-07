import { Logger } from '@decorators';

import { NerveNodeApp } from '@node/NerveNodeApp';

import { NerveRestHTTPServer } from '../NerveRestHTTPServer';
import { NerveRestRouter } from '../NerveRestRouter';

import { INerveRestAppOptions } from './types';

const DEFAULT_HTTP_HOST = '0.0.0.0';
const DEFAULT_HTTP_PORT = 3001;

@Logger({ prefix: 'App' })
export class NerveRestApp extends NerveNodeApp {

	protected httpServer: NerveRestHTTPServer;
	protected router: NerveRestRouter;
	protected options: INerveRestAppOptions;

	constructor(options: INerveRestAppOptions) {
		super(options);
	}

	protected initHttpServer() {
		this.httpServer = new NerveRestHTTPServer({
			host: this.config.http.host || this.options.http?.host || DEFAULT_HTTP_HOST,
			port: this.config.http.port || this.options.http?.port || DEFAULT_HTTP_PORT,
			maxBodySize: this.config.http.maxBodySize,
		});
		this.httpServer.initMiddlewares();
	}

	protected initRouter() {
		this.router = new NerveRestRouter({
			app: this,
			workDir: this.options.workDir,
		});
		this.router.setHTTPServer(this.httpServer);
		this.router.init();
	}

}
