import { Request, Response } from 'express';

import { ENerveHTTPMethod } from '@enums';

import { Logger } from '@decorators';

import { NerveNodeHTTPServer } from '../NerveNodeHTTPServer';
import { NerveNodeObject } from '../NerveNodeObject';

import { INerveNodeRoute } from '@interfaces';

import { INerveNodeRouterOptions } from './types';

type AddRouteFn = (path: string, handler: (req: Request, res: Response) => void) => void;
type ExpressHtttpMethod = 'get' | 'post' | 'put' | 'delete';

@Logger({ prefix: 'Router' })
export abstract class NerveNodeRouter extends NerveNodeObject {

	protected options: INerveNodeRouterOptions;
	protected httpServer: NerveNodeHTTPServer;

	protected constructor(options: INerveNodeRouterOptions) {
		super();

		this.options = options;
	}

	setHTTPServer(httpServer: NerveNodeHTTPServer) {
		this.httpServer = httpServer;
	}

	addRoute(route: INerveNodeRoute) {
		const {
			path: routePath,
			method = ENerveHTTPMethod.GET,
		} = route;

		const express = this.httpServer.getExpress();
		const handler = this.getRouteHandler(route);
		const addRoute = express[method.toLowerCase() as ExpressHtttpMethod].bind(express) as AddRouteFn;

		addRoute(routePath, handler);
	}

	protected abstract getRouteHandler(route: INerveNodeRoute): (req: Request, res: Response) => void;

}
