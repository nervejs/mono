import { Request, Response } from 'express';
import * as path from 'path';

import { ENerveHTTPMethod } from '@enums';

import { Logger } from '@decorators';

import { NerveServerHTTPServer } from '../NerveServerHTTPServer';
import { NerveServerObject } from '../NerveServerObject';
import { NerveServerPage } from '../NerveServerPage';

import { NerveServerRequest } from '@types';

import { INerveServerRoute } from '@interfaces';

import { INerveServerRouterOptions } from './types';

type AddRouteFn = (path: string, handler: (req: Request, res: Response) => void) => void;

@Logger({ prefix: 'Router' })
export class NerveServerRouter extends NerveServerObject {

	protected options: INerveServerRouterOptions;
	protected httpServer: NerveServerHTTPServer;

	constructor(options: INerveServerRouterOptions) {
		super();

		this.options = options;
	}

	init() {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { routes } = require(path.resolve(this.options.workDir, 'routes')) as { routes: INerveServerRoute[] };

		routes.forEach((route) => this.addRoute(route));
	}

	setHTTPServer(httpServer: NerveServerHTTPServer) {
		this.httpServer = httpServer;
	}

	addRoute(route: INerveServerRoute) {
		const {
			path: routePath,
			method = ENerveHTTPMethod.GET,
			page,
		} = route;

		const express = this.httpServer.getExpress();
		const handler = this.processingRequest(page);

		let addRoute: AddRouteFn;

		switch (method) {
			case ENerveHTTPMethod.GET:
				addRoute = express.get.bind(express) as AddRouteFn;
				break;
			case ENerveHTTPMethod.POST:
				addRoute = express.post.bind(express) as AddRouteFn;
				break;
		}

		addRoute(routePath, handler);
	}

	processingRequest(Page: typeof NerveServerPage) {
		return (req: Request, res: Response) => {
			const page = new Page({
				app: this.options.app,
				req: req as NerveServerRequest,
				res,
			});

			void page.run();
		};
	}

}
