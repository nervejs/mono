import { Request, Response } from 'express';
import * as path from 'path';

import { Logger } from '@decorators';

import { NerveNodeRouter } from '@node/NerveNodeRouter';

import { NerveServerHTTPServer } from '../NerveServerHTTPServer';

import { NerveNodeRequest } from '@types';

import { INerveServerRoute } from '@interfaces';

import { INerveServerRouterOptions } from './types';

@Logger({ prefix: 'Router' })
export class NerveServerRouter extends NerveNodeRouter {

	protected options: INerveServerRouterOptions;
	protected httpServer: NerveServerHTTPServer;

	constructor(options: INerveServerRouterOptions) {
		super(options);
	}

	init() {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { routes } = require(path.resolve(this.options.workDir, 'routes')) as { routes: INerveServerRoute[] };

		routes.forEach((route) => this.addRoute(route));
	}

	protected getRouteHandler(route: INerveServerRoute) {
		const { page: Page } = route;

		return (req: Request, res: Response) => {
			const page = new Page({
				app: this.options.app,
				req: req as NerveNodeRequest,
				res,
			});

			void page.run();
		};
	}

}
