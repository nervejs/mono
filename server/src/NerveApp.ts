import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as cookieParser from 'cookie-parser';
import * as Handlebars from 'handlebars';

import { NerveObject } from './NerveObject';
import { NerveRouter } from './NerveRouter';

import { NerveDebug } from './utils/NerveDebug';
import { NerveLocales } from './utils/NerveLocales';
import { initHandlebarsHelpers } from './utils/HandlebarsHelpers'

import { EEnvironment } from './enums/EEnvironment';
import { INerveRouteList } from './interfaces';
import { TNerveRoute } from './types/TNerveRoute';

initHandlebarsHelpers(Handlebars);

export interface INerveAppConfig {
	logLevel: number;

	isTestServer: boolean;
	isClearTemplateCache: boolean;

	hosts: {
		api: string;
		js: string;
		css: string;
		static: string;
	};

	paths: {
		public: string[];
		templates: string;
		locales: string;
		versions: {
			js: string;
			css: string;
		};
	};

	staticCacheVersion: number;
	localesFileName: string;
}

interface INerveAppConfigList {
	[key: string]: INerveAppConfig;
	[EEnvironment.DEV]: INerveAppConfig;
	[EEnvironment.PROD]: INerveAppConfig;
}

export class NerveApp extends NerveObject {

	protected JS_VERSIONS: { [key: string]: string } = {};
	protected CSS_VERSIONS: { [key: string]: string } = {};

	protected server: express.Express;
	protected connection: http.Server;
	protected isReady: boolean = false;
	protected routes: { [key: string]: TNerveRoute } = {};
	protected publicRoutes: { [key: string]: TNerveRoute } = {};
	protected configList: INerveAppConfigList;
	protected router: NerveRouter;
	protected environment: string;
	protected workerIndex: number;

	config: INerveAppConfig;

	constructor() {
		super();

		this.server = express();

		this.server.enable('trust proxy');
		this.server.enable('case sensitive routing');
		this.server.enable('strict routing');
		this.server.disable('x-powered-by');
		this.server.disable('etag');

		this.server.use((req: any, res: express.Response, next: express.NextFunction) => {
			req.id = uuidv4();
			next();
		});

		this.server.use(cookieParser());

		this.router = new NerveRouter(this);

		this.environment = process.env.NODE_NERVE_ENV || 'dev';

		this.ready()
			.then(() => {
				this.parseStaticVersions()
					.then(() => NerveDebug.log('Static versions parsed success'))
					.catch((err: Error) => NerveDebug.error(`Static versions parsed failed: ${err}`));
			});

		setTimeout(() => {
			this.readCfg()
				.then(() => {
					NerveDebug.setLevel(this.config.logLevel);
					NerveLocales.init(this);

					if (Array.isArray(this.config.paths.public)) {
						this.config.paths.public.forEach(dir => this.server.use(express.static(dir)));
					}

					this.isReady = true;
					this.emit('ready');
				})
				.catch((err: Error) => NerveDebug.error(err.toString()));
		});
	}

	getServer(): express.Express {
		return this.server;
	}

	getRouter(): NerveRouter {
		return this.router;
	}

	getJsVersions(): any {
		return this.JS_VERSIONS;
	}

	getCssVersions(): any {
		return this.CSS_VERSIONS;
	}

	listen(port: number, host: string, callback: () => void) {
		this.connection = this.server.listen(port, host, callback);

		return this.connection;
	}

	close() {
		this.connection.close();
	}

	route(routes: INerveRouteList) {
		if (routes.public) {
			this.routes = { ...this.routes, ...routes.public };
			this.publicRoutes = { ...this.publicRoutes, ...routes.public };
		}

		if (routes.protected) {
			this.routes = { ...this.routes, ...routes.protected };
		}

		Object.keys(this.routes).forEach((url: string) => this.router.addRoute(url, this.routes[url]));
	}

	setEnv(env: EEnvironment) {
		this.environment = env;

		if (this.configList) {
			this.config = this.configList[this.environment];
		}
	}

	async readCfg(): Promise<INerveAppConfig> {
		return new Promise((resolve: Function, reject: Function) => {
			fs.readFile('./nerve.json', (err: Error, content: Buffer) => {
				if (err) {
					NerveDebug.error(`Failed read config`);
					reject(err);
					throw err;
				}

				this.configList = JSON.parse(content.toString());
				this.config = this.configList[this.environment];

				resolve(this.config);
			});
		});
	}

	getPublicRoutes() {
		return Object.keys(this.publicRoutes)
			.map(key => ({
				key,
				route: String(this.publicRoutes[key]).replace(/^src\//, '')
			}));
	}

	setDebugLevel(level: number) {
		NerveDebug.setLevel(level);
	}

	setWorkerIndex(index: number) {
		this.workerIndex = index;
	}

	parseJSVersions(pathToJsVersions: string) {
		const JS_VERSIONS: { [key: string]: string } = {};

		try {
			if (require.cache) {
				delete require.cache[require.resolve(pathToJsVersions)];
			}

			const jsVersions = JSON.parse(require(pathToJsVersions)());

			Object.keys(jsVersions).forEach((item: string) => {
				jsVersions[item].forEach((jsVersion: any) => JS_VERSIONS[jsVersion.name] = jsVersion.path);
			});
		} catch (err) {
			NerveDebug.error('failed parse JS versions: ', err);
		}

		return JS_VERSIONS;
	}

	parseCSSVersions(pathToCssVersions: string) {
		try {
			if (require.cache) {
				delete require.cache[require.resolve(pathToCssVersions)];
			}

			return JSON.parse(require(pathToCssVersions)());
		} catch (err) {
			NerveDebug.error('Failed parse CSS versions: ', err);

			return {};
		}
	}

	parseStaticVersions(): Promise<{
		js: { [key: string]: string };
		css: { [key: string]: string };
	}> {
		const templatesDir = this.config.paths.templates;

		return new Promise((resolve, reject) => {
			if (templatesDir) {
				try {
					if (this.config.paths.versions.js) {
						this.JS_VERSIONS = this.parseJSVersions(path.resolve(templatesDir, this.config.paths.versions.js));
					}

					if (this.config.paths.versions.css) {
						this.CSS_VERSIONS = this.parseCSSVersions(path.resolve(templatesDir, this.config.paths.versions.css));
					}

					resolve({
						js: this.JS_VERSIONS,
						css: this.CSS_VERSIONS
					});
				} catch (err) {
					NerveDebug.error('Failed parse versions: ', err);
					reject(err);
				}
			} else {
				reject(new Error('Empty templates dir'));
			}
		});
	}

	ready() {
		return new Promise((resolve: (...args: any[]) => void) => {
			if (this.isReady) {
				resolve();
			} else {
				this.on('ready', resolve);
			}
		});
	}

}
