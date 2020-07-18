/* tslint:disable: non-literal-require */

import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { capitalize } from './utils/capitalize';

import { Logger } from './decorators/Logger';

import { NerveRestApp } from './NerveRestApp';
import { NerveRestController } from './NerveRestController';
import { NerveRestObject } from './NerveRestObject';

import { INerveRestRouteModule } from './interfaces';

@Logger({ prefix: 'Router' })
export class NerveRestRouter extends NerveRestObject {

	protected app: NerveRestApp;
	protected controllersDir = './controllers';
	protected express: Express;

	setExpress(express: Express) {
		this.log.debug('set express instance');

		this.express = express;
	}

	setControllersDir(controllersDir: string) {
		this.controllersDir = controllersDir;
	}

	async init(app: NerveRestApp) {
		this.log.debug('init');

		this.app = app;

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		return new Promise(async (resolve, reject) => {
			try {
				const controllersDirs = await this.getControllerDirs();
				const routes = controllersDirs.map((dir: string) => this.getRouterItemByDir(dir));

				routes.forEach((item) => {
					// eslint-disable-next-line @typescript-eslint/no-var-requires
					const { Controller }: { Controller: typeof NerveRestController} = require(path.resolve(item.module));

					item.actions = Controller.init(this.app, this.express, item);
				});

				this.log.debug(`routes: ${JSON.stringify(routes, ' ' as unknown as string[], 4)}`);

				resolve();
			} catch (err) {
				reject(err);
			}
		});
	}

	protected async getControllerDirs(): Promise<string[]> {
		this.log.debug('read controllers dir');

		return new Promise((resolve, reject) => {
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			fs.readdir(this.controllersDir, async (err: Error, files: string[]) => {
				if (err) {
					this.log.error('failed read controller dirs', err);

					reject(err);
				} else {
					const fileInfoList = await Promise.all(
						files.map(async (file) => new Promise((resolve) => {
							fs.stat(path.resolve(this.controllersDir, file), (err, stats) => {
								resolve({
									file,
									isDir: stats.isDirectory(),
								});
							});
						})),
					) as { file: string; isDir: boolean }[];

					const dirs = fileInfoList
						.filter((item) => item.isDir)
						.map((item) => item.file);

					resolve(dirs);
				}
			});
		});
	}

	protected getRouterItemByDir(dir: string): INerveRestRouteModule {
		const controllerName = `${capitalize(dir)}Controller`;
		const module = `${this.controllersDir}/${dir}/${controllerName}`;
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { Controller } = require(path.resolve(module));
		const url = Controller.BASE_URL || `/${dir}`;

		return {
			url,
			module,
			actions: [],
		};
	}

}
