import { existsSync, promises as fs } from 'fs';
import * as path from 'path';

import { ENerveLogLevel } from '@enums';

import { Logger } from '@decorators';

import { NerveNodeHTTPServer } from '../NerveNodeHTTPServer';
import { NerveNodeObject } from '../NerveNodeObject';
import { NerveNodeRouter } from '../NerveNodeRouter';

import { INerveNodeConfig } from '@interfaces';

import { INerveNodeAppOptions } from './types';

@Logger({ prefix: 'App' })
export abstract class NerveNodeApp extends NerveNodeObject {

	protected workerIndex: number;

	public config: INerveNodeConfig = {
		isLocalServer: false,
		http: {
			host: null,
			port: null,
		},
		logLevel: ENerveLogLevel.ERROR,
	};

	protected options: INerveNodeAppOptions;
	protected httpServer: NerveNodeHTTPServer;
	protected router: NerveNodeRouter;

	protected isInitialConfigLoaded = false;

	protected instanceId: string = null;

	protected constructor(options: INerveNodeAppOptions) {
		super();

		this.options = options;
	}

	public async init() {
		await this.readConfig();
		this.onInitialConfigLoaded();

		this.initHttpServer();
		this.initRouter();
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

	public setInstanceId(instanceId: string) {
		this.instanceId = instanceId;
	}

	protected async readConfig() {
		try {
			const configFilePath = path.resolve(this.options.workDir, 'nerverc.json');

			if (existsSync(configFilePath)) {
				const content = await fs.readFile(configFilePath, { encoding: 'utf-8' });
				const config = JSON.parse(content) as Partial<INerveNodeConfig>;

				this.setConfig(config);

				this.setLogLevel(this.config.logLevel);
			}
		} catch (err) {
			this.log.error(`Failed read or parse config file: `, err as Error);
		}
	}

	protected setConfig(config: Partial<INerveNodeConfig>) {
		const oldConfig = { ...this.config };

		this.config = {
			...this.config,
			...config,
		};

		if (this.isInitialConfigLoaded) {
			void this.onConfigChange(oldConfig, this.config);
		}
	}

	protected abstract initHttpServer(): void;

	protected abstract initRouter(): void;

	protected onInitialConfigLoaded() {
		this.isInitialConfigLoaded = true;
		this.setLogLevel(this.config.logLevel);
	}

	protected async onConfigChange(oldConfig: INerveNodeConfig, newConfig: INerveNodeConfig) {
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
	}

	protected setLogLevel(logLevel: ENerveLogLevel) {
		this.log.setLevel(this.config.logLevel);
	}

}
