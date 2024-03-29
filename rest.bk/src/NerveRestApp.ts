import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as http from 'http';

import { ENerveLogLevel } from '@enums';

import { Logger } from '@decorators';

import { NerveRestAuth } from './NerveRestAuth';
import { NerveRestObject } from './NerveRestObject';
import { NerveRestRouter } from './NerveRestRouter';

import { INerveRestAuthOptions, INerveRestControllerOptions } from './interfaces';

@Logger({ prefix: 'App' })
export abstract class NerveRestApp extends NerveRestObject {

	public BASE_URL = '';

	protected express: express.Express = express();
	protected server: http.Server;
	protected host = '0.0.0.0';
	protected abstract port: number;
	protected abstract router: NerveRestRouter;

	async run() {
		this.initMiddlewares();
		// this.initAuth();

		this.router.setExpress(this.express);
		await this.router.init(this);
		await this.listen();
	}

	async listen() {
		return new Promise((resolve) => {
			this.log.info(`Listen port ${this.port} on host ${this.host}`);
			this.log.info(`URL http://${this.host}:${this.port}`);

			this.server = this.express.listen(this.port, this.host, () => resolve(void 0));
		});
	}

	initMiddlewares() {
		this.express.use(express.urlencoded({ extended: true }));
		this.express.use(cookieParser());
		this.express.use(fileUpload({
			useTempFiles: true,
			tempFileDir: '/tmp/nerve-rest-express-fileupload',
		}));
	}

	initAuth() {
		NerveRestAuth.init(this.getAuthOptions());
	}

	getAuthOptions(): INerveRestAuthOptions {
		return {
			secret: '',
			// eslint-disable-next-line @typescript-eslint/require-await
			async login() {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
				this.log.error('Method getAuthOptions is not defined');

				return false;
			},
			// eslint-disable-next-line @typescript-eslint/require-await
			async getCurrentUser() {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
				this.log.error('Method getCurrentUser is not defined');

				return false;
			},
		};
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

	protected setLogLevel(logLevel: ENerveLogLevel) {
		this.log.setLevel(logLevel);
	}

}
