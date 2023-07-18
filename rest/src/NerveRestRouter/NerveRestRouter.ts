import { Request, Response } from 'express';
import * as path from 'path';

import { Logger } from '@decorators';

import { NerveNodeRouter } from '@node/NerveNodeRouter';

import { NerveRestHTTPServer } from '../NerveRestHTTPServer';

// import { NerveNodeRequest } from '@types';

import { NerveNodeRequest } from '@types';

import { INerveRestRoute } from '@interfaces';

import { INerveRestRouterOptions } from './types';

@Logger({ prefix: 'Router' })
export class NerveRestRouter extends NerveNodeRouter {

	protected options: INerveRestRouterOptions;
	protected httpServer: NerveRestHTTPServer;

	constructor(options: INerveRestRouterOptions) {
		super(options);
	}

	init() {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { routes } = require(path.resolve(this.options.workDir, 'routes')) as { routes: INerveRestRoute[] };

		this.logDebug(`Routes: \n${JSON.stringify(routes, null, 4)}`);

		routes.forEach((route) => this.addRoute(route));
	}

	protected getRouteHandler(route: INerveRestRoute) {
		return (req: Request, res: Response) => {
			const { action: Action } = route;
			const action = new Action({
				app: this.options.app,
				req: req as NerveNodeRequest,
				res,
			});

			void action.run();
		};
	}

}
