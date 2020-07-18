import * as express from 'express';
import * as http from 'http';

import { ENerveRestLogLevel } from './enums';

import { Logger } from './decorators';

import { NerveRestObject } from './NerveRestObject';
import { NerveRestRouter } from './NerveRestRouter';

import { INerveRestControllerOptions } from './interfaces';

@Logger({ prefix: 'App' })
export abstract class NerveRestApp extends NerveRestObject {

	protected express: express.Express = express();
	protected server: http.Server;
	protected host = '0.0.0.0';
	protected abstract port: number;
	protected abstract router: NerveRestRouter;

	async run() {
		this.initMiddlewares();

		this.router.setExpress(this.express);
		await this.router.init(this);
		await this.listen();
	}

	async listen() {
		return new Promise((resolve) => {
			this.log.info(`Listen port ${this.port} on host ${this.host}`);
			this.log.info(`URL http://${this.host}:${this.port}`);

			this.server = this.express.listen(this.port, this.host, resolve);
		});
	}

	initMiddlewares() {
		this.express.use(express.urlencoded({ extended: true }));
	}

	stop() {
		this.server.close();
	}

	getPort() {
		return this.port;
	}

	getRouter() {
		return this.router;
	}

	getControllerOptions(): INerveRestControllerOptions {
		return {};
	}

	protected setLogLevel(logLevel: ENerveRestLogLevel) {
		this.log.setLevel(logLevel);
	}

}
