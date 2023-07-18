import { ENerveLocale } from '@enums';

import { Logger } from '@decorators';

import { NerveNodeApp } from '@node/NerveNodeApp';

import { NerveServerHTTPServer } from '../NerveServerHTTPServer';
import { NerveServerLocalesManager } from '../NerveServerLocalesManager';
import { NerveServerRouter } from '../NerveServerRouter';
import { NerveServerStaticManager } from '../NerveServerStaticManager';
import { NerveServerUpstreamBalancer } from '../NerveServerUpstreamBalancer';

import { INerveServerConfig } from '@interfaces';

import { INerveServerAppOptions } from './types';

const DEFAULT_HTTP_HOST = '0.0.0.0';
const DEFAULT_HTTP_PORT = 3000;

@Logger({ prefix: 'App' })
export class NerveServerApp extends NerveNodeApp {

	protected workerIndex: number;

	public config: INerveServerConfig = {
		...this.config,
		paths: {
			templates: null,
			locales: null,
		},
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

	constructor(options: INerveServerAppOptions) {
		super(options);
	}

	public async init() {
		await super.init();

		await this.initStaticManager();
		await this.initLocalesManager();
		await this.initUpstreamBalancer();
	}

	public getTemplatesDir() {
		return this.config.paths.templates.dir;
	}

	public getLocalesDir() {
		return this.config.paths.locales.dir;
	}

	protected initHttpServer() {
		this.httpServer = new NerveServerHTTPServer({
			host: this.config.http.host || this.options.http?.host || DEFAULT_HTTP_HOST,
			port: this.config.http.port || this.options.http?.port || DEFAULT_HTTP_PORT,
			maxBodySize: this.config.http.maxBodySize,
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

		if (this.getLocalesDir()) {
			await this.localesManager.init();
		} else {
			this.log.info(`Locales dir is empty on config. Skip initialize LocalesManager`);
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async initUpstreamBalancer() {
		this.upstreamBalancer = new NerveServerUpstreamBalancer({
			app: this,
		});

		this.upstreamBalancer.readUpstreamsFromConfig();
	}

	protected async onConfigChange(oldConfig: INerveServerConfig, newConfig: INerveServerConfig) {
		await super.onConfigChange(oldConfig, newConfig);

		if (this.upstreamBalancer) {
			this.upstreamBalancer.readUpstreamsFromConfig();
		}
	}

}
