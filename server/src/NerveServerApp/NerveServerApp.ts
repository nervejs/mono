import { existsSync, promises as fs } from 'fs';
import * as path from 'path';

import { ENerveLocale, ENerveLogLevel } from '@enums';

import { Logger } from '@decorators';

import { NerveServerHTTPServer } from '../NerveServerHTTPServer';
import { NerveServerLocalesManager } from '../NerveServerLocalesManager';
import { NerveServerObject } from '../NerveServerObject';
import { NerveServerRouter } from '../NerveServerRouter';
import { NerveServerStaticManager } from '../NerveServerStaticManager';
import { NerveServerUpstreamBalancer } from '../NerveServerUpstreamBalancer';

import { INerveServerConfig } from '@interfaces';

import { INerveServerAppOptions } from './types';

const DEFAULT_HTTP_HOST = '0.0.0.0';
const DEFAULT_HTTP_PORT = 3000;

@Logger({ prefix: 'App' })
export class NerveServerApp extends NerveServerObject {

	protected workerIndex: number;

	public config: INerveServerConfig = {
		isLocalServer: false,
		http: {
			host: null,
			port: null,
		},
		paths: {
			templates: null,
			locales: null,
		},
		logLevel: ENerveLogLevel.ERROR,
		static: {
			isMultiVersions: false,
			versionsFiles: {
				js: 'common/js-versions.json',
				css: 'common/css-versions.json',
			},
			currentVersion: null,
		},
		locales: {
			source: ENerveLocale.EN_US,
			list: [],
			isEnabled: false,
			isFallbackToSource: true,
		},
		render: {
			isCacheEnabled: true,
			isServerEnabled: false,
		},
		hosts: {
			main: '',
			api: '',
			js: '',
			css: '',
			static: '',
		},
		upstreams: {},
		defaultUpstream: null,
		request: {
			timeout: 5000,
		},
	};
	public staticManager: NerveServerStaticManager;
	public localesManager: NerveServerLocalesManager;
	public upstreamBalancer: NerveServerUpstreamBalancer;

	protected options: INerveServerAppOptions;
	protected httpServer: NerveServerHTTPServer;
	protected router: NerveServerRouter;

	protected isInitialConfigLoaded = false;

	protected instanceId: string = null;

	constructor(options: INerveServerAppOptions) {
		super();

		this.options = options;
	}

	public async init() {
		await this.readConfig();
		this.onInitialConfigLoaded();

		this.initHttpServer();
		this.initRouter();
		await this.initStaticManager();
		await this.initLocalesManager();
		await this.initUpstreamBalancer();
	}

	public async run() {
		await this.httpServer.run();
	}

	public async stop() {
		return this.httpServer.stop();
	}

	public setWorkerIndex(workerIndex: number) {
		this.workerIndex = workerIndex;
	}

	public getWorkerIndex() {
		return this.workerIndex;
	}

	public getTemplatesDir() {
		return this.config.paths.templates.dir;
	}

	public getLocalesDir() {
		return this.config.paths.locales.dir;
	}

	public setInstanceId(instanceId: string) {
		this.instanceId = instanceId;
	}

	protected async readConfig() {
		try {
			const configFilePath = path.resolve(this.options.workDir, 'nerverc.json');

			if (existsSync(configFilePath)) {
				const content = await fs.readFile(configFilePath, { encoding: 'utf-8' });
				const config = JSON.parse(content) as Partial<INerveServerConfig>;

				this.setConfig(config);

				this.setLogLevel(this.config.logLevel);
			}
		} catch (err) {
			this.log.error(`Failed read or parse config file: `, err as Error);
		}
	}

	protected setConfig(config: Partial<INerveServerConfig>) {
		const oldConfig = { ...this.config };

		this.config = {
			...this.config,
			...config,
		};

		if (this.isInitialConfigLoaded) {
			void this.onConfigChange(oldConfig, this.config);
		}
	}

	protected initHttpServer() {
		this.httpServer = new NerveServerHTTPServer({
			host: this.config.http.host || this.options.http?.host || DEFAULT_HTTP_HOST,
			port: this.config.http.port || this.options.http?.port || DEFAULT_HTTP_PORT,
		});
		this.httpServer.initMiddlewares();
	}

	protected initRouter() {
		this.router = new NerveServerRouter({
			app: this,
			workDir: this.options.workDir,
		});
		this.router.setHTTPServer(this.httpServer);
		this.router.init();
	}

	protected async initStaticManager() {
		this.staticManager = new NerveServerStaticManager({
			app: this,
		});

		await this.staticManager.init();
	}

	protected async initLocalesManager() {
		this.localesManager = new NerveServerLocalesManager({
			app: this,
		});

		await this.localesManager.init();
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async initUpstreamBalancer() {
		this.upstreamBalancer = new NerveServerUpstreamBalancer({
			app: this,
		});

		this.upstreamBalancer.readUpstreamsFromConfig();
	}

	protected onInitialConfigLoaded() {
		this.isInitialConfigLoaded = true;
		this.setLogLevel(this.config.logLevel);
	}

	protected async onConfigChange(oldConfig: INerveServerConfig, newConfig: INerveServerConfig) {
		const isHttpConfigHostChanged = oldConfig.http.host !== newConfig.http.host;
		const isHttpConfigPortChanged = oldConfig.http.port !== newConfig.http.port && !isNaN(oldConfig.http.port) && !isNaN(newConfig.http.port);
		const isHttpConfigChanged = isHttpConfigPortChanged || isHttpConfigHostChanged;

		this.setLogLevel(this.config.logLevel);

		if (this.httpServer && isHttpConfigChanged) {
			await this.httpServer.stop();

			this.initHttpServer();
			await this.httpServer.run();

			this.initRouter();
		}

		if (this.upstreamBalancer) {
			this.upstreamBalancer.readUpstreamsFromConfig();
		}
	}

	protected setLogLevel(logLevel: ENerveLogLevel) {
		this.log.setLevel(this.config.logLevel);
	}

}
