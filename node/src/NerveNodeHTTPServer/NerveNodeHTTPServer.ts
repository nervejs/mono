import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import http from 'http';
import { v4 as uuid } from 'uuid';

import { getDefaultLogPrefix } from '@utils';

import { Logger } from '@decorators';

import { NerveNodeObject } from '../NerveNodeObject';

import { NerveNodeRequest } from '@types';

import { INerveServerHTTPServerOptions } from './types';

@Logger({ prefix: 'HTTPServer' })
export class NerveNodeHTTPServer extends NerveNodeObject {

	protected express: express.Express = express();
	protected server: http.Server;
	protected host = '0.0.0.0';
	protected port: number;

	constructor(options: INerveServerHTTPServerOptions) {
		super();
		const { host, port } = options;

		this.host = host;
		this.port = port;

		this.express.enable('trust proxy');
		this.express.enable('case sensitive routing');
		this.express.enable('strict routing');
		this.express.disable('x-powered-by');
		this.express.disable('etag');
	}

	getExpress() {
		return this.express;
	}

	getServer() {
		return this.server;
	}

	async run() {
		return new Promise((resolve) => {
			this.logInfo(`Listen port ${this.port} on host ${this.host}`);
			this.logInfo(`URL http://${this.host}:${this.port}`);

			this.server = this.express.listen(this.port, this.host, () => resolve(void 0));
		});
	}

	async stop(): Promise<void> {
		this.logInfo('Stop');

		return new Promise((resolve) => {
			if (this.server) {
				this.server.close(() => resolve());
			} else {
				resolve();
			}
		});
	}

	initMiddlewares() {
		this.express.use(cookieParser());
		this.express.use(bodyParser.urlencoded({ extended: false }));

		this.express.use((req: NerveNodeRequest, res, next) => {
			const method = req.method.toUpperCase();
			const startTimestamp = Date.now();
			const requestId = uuid();

			req.requestId = requestId;

			this.logInfo(`[${requestId}] Start ${method} ${req.url}`);

			res.on('finish', () => {
				const duration = Date.now() - startTimestamp;
				let log = `[${requestId}] Finish ${method} ${req.url} [status=${res.statusCode}] [duration=${duration}ms]`;

				if (res.statusCode >= 300 && res.statusCode <= 399) {
					log += ` (location: ${String(res.get('location'))})`;
				}

				this.logInfo(log);
			});

			next();
		});
	}

	protected getLogPrefix() {
		return getDefaultLogPrefix();
	}

	protected logInfo(message: string) {
		this.log.info(`${this.getLogPrefix()} ${message}`);
	}

}
