import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { capitalize } from '@utils';

import { Logger } from '@decorators';

import { NerveRestApp } from './NerveRestApp';
import { NerveRestController } from './NerveRestController';
import { NerveRestObject } from './NerveRestObject';

import { INerveRestRouteModule } from '@interfaces';

const nativeRequire = eval('require') as (modulePath: string) => unknown;

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
					const { Controller } = nativeRequire(path.resolve(item.module)) as { Controller: typeof NerveRestController};

					item.actions = Controller.init(this.app, this.express, item);
				});

				this.log.debug(`routes: ${JSON.stringify(routes, ' ' as unknown as string[], 4)}`);

				resolve(void 0);
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
					const fileInfoList: { file: string, isDir: boolean }[] = await Promise.all(
						files.map(async (file) => new Promise((resolveItem) => {
							fs.stat(path.resolve(this.controllersDir, file), (errStat, stats) => {
								resolveItem({
									file,
									isDir: stats.isDirectory(),
								});
							});
						})),
					);

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
		const { Controller } = nativeRequire(path.resolve(module)) as { Controller: typeof NerveRestController};
		const url = (this.app.BASE_URL + (Controller.BASE_URL || `/${dir.toLowerCase()}`)).replace(/\/+/g, '/');

		return {
			url,
			module,
			actions: [],
		};
	}

}
