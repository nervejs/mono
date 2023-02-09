/* eslint @typescript-eslint/no-misused-promises: "off" */

import { Express, Request, Response } from 'express';

import { ENerveContentType, ENerveHTTPMethod, ENerveHTTPStatus, ENerveRestStandardAction } from './enums';

import { Log } from './utils';

import { Logger } from './decorators';

import { NerveRestApp } from './NerveRestApp';
import { NerveRestAuth } from './NerveRestAuth';
import { NerveRestObject } from './NerveRestObject';

import {
	INerveRestControllerBeforeActionResult,
	INerveRestControllerOptions,
	INerveRestControllerResult,
	INerveRestRouteAction,
	INerveRestRouteModule,
} from './interfaces';

import { NerveRestRequest, NerveRestResponse } from './types';

@Logger({ prefix: 'Controller' })
export class NerveRestController extends NerveRestObject {

	__customActions: INerveRestRouteAction[];
	__authRequired: string[];

	protected options: INerveRestControllerOptions;
	protected currentUser: unknown;

	static app: NerveRestApp;
	static viewPathParamName = 'id';
	static deletePathParamName = 'id';
	static updatePathParamName = 'id';

	static BASE_URL: string = null;

	static init(app: NerveRestApp, express: Express, route: INerveRestRouteModule): INerveRestRouteAction[] {
		const { url: routeUrl } = route;
		const viewUrl = `${routeUrl}/:${this.viewPathParamName}`.replace(/\/+/g, '/');
		const deleteUrl = `${routeUrl}/:${this.deletePathParamName}`.replace(/\/+/g, '/');
		const updateUrl = `${routeUrl}/:${this.updatePathParamName}`.replace(/\/+/g, '/');
		const routeActions: INerveRestRouteAction[] = [];
		let customActions: INerveRestRouteAction[] = [];

		this.app = app;

		if (Array.isArray(this.prototype.__customActions)) {
			customActions = this.prototype.__customActions.map((action) => ({
				...action,
				url: (action.isAbsoluteUrl ? action.url : `${routeUrl}${action.url ? '/' + action.url : ''}`).replace(/\/+/g, '/'),
			}));

			customActions.forEach((action) => {
				switch (action.method) {
					case ENerveHTTPMethod.GET:
						express.get(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
					case ENerveHTTPMethod.POST:
						express.post(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
					case ENerveHTTPMethod.PUT:
						express.put(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
					case ENerveHTTPMethod.PATCH:
						express.patch(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
					case ENerveHTTPMethod.DELETE:
						express.delete(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
				}
			});
		}

		if (this.prototype.hasOwnProperty('index')) {
			express.get(routeUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.INDEX, req, res));
			express.options(routeUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.INDEX, req, res));
			routeActions.push({ method: ENerveHTTPMethod.GET, url: routeUrl, action: ENerveRestStandardAction.INDEX });
		}

		if (this.prototype.hasOwnProperty('view')) {
			express.get(viewUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.VIEW, req, res));
			express.options(viewUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.VIEW, req, res));
			routeActions.push({ method: ENerveHTTPMethod.GET, url: viewUrl, action: ENerveRestStandardAction.VIEW });
		}

		if (this.prototype.hasOwnProperty('create')) {
			express.post(routeUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.CREATE, req, res));
			express.options(routeUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.CREATE, req, res));
			routeActions.push({ method: ENerveHTTPMethod.POST, url: routeUrl, action: ENerveRestStandardAction.CREATE });
		}

		if (this.prototype.hasOwnProperty('update')) {
			express.put(updateUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.UPDATE, req, res));
			express.options(updateUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.UPDATE, req, res));
			routeActions.push({ method: ENerveHTTPMethod.PUT, url: updateUrl, action: ENerveRestStandardAction.UPDATE });
		}

		if (this.prototype.hasOwnProperty('delete')) {
			express.delete(deleteUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.DELETE, req, res));
			express.options(deleteUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandardAction.DELETE, req, res));
			routeActions.push({ method: ENerveHTTPMethod.DELETE, url: deleteUrl, action: ENerveRestStandardAction.DELETE });
		}

		return routeActions.concat(customActions);
	}

	static async wrapper(actionName: string, req: Request, res: Response) {
		try {
			const controller = new this();
			let result: INerveRestControllerResult;

			controller.setOptions(this.app.getControllerOptions());

			const beforeResult = await controller.beforeAction(actionName, req as unknown as NerveRestRequest, res as unknown as NerveRestResponse);

			Log.info(`WRAP REQUEST (CONTROLLER: ${this.name}; ACTION: ${actionName})`);

			if (beforeResult.isAbort) {
				Log.info(`(CONTROLLER: ${this.name}; ACTION: ${actionName}) ABORTED BY BEFORE ACTION`);

				res.status(beforeResult.status || ENerveHTTPStatus.OK);
				res.end(JSON.stringify(beforeResult.data || {}));
			} else {
				const isAuthRequired = Array.isArray(this.prototype.__authRequired) && this.prototype.__authRequired.includes(actionName);
				const decodedToken = await NerveRestAuth.validateToken(req);
				const isAuthorized = !!decodedToken;

				if (isAuthRequired && !isAuthorized) {
					const error = NerveRestAuth.getError();

					// eslint-disable-next-line sonarjs/no-duplicate-string
					res.setHeader('Content-Type', `${error.contentType}; charset=utf-8`);
					res.status(error.status);
					res.end(JSON.stringify(error.data));
				} else {
					if (this.prototype.hasOwnProperty(actionName)) {
						if (isAuthorized) {
							controller.currentUser = await NerveRestAuth.getCurrentUser(decodedToken);
						}

						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						result = await (controller as unknown as Record<string, (...args: unknown[]) => Promise<INerveRestControllerResult>>)[actionName](req, res);
					}

					res.status(result.status || ENerveHTTPStatus.OK);
					if (!result.contentType || result.contentType === ENerveContentType.JSON) {
						res.setHeader('Content-Type', `${ENerveContentType.JSON}; charset=utf-8`);
						res.end(JSON.stringify(result.data || {}));
					} else {
						res.setHeader('Content-Type', `${result.contentType || 'application/octet-stream'}; charset=utf-8`);
						res.end(result.data);
					}
				}
			}
		} catch (err) {
			Log.error(`Error on ${req.method.toUpperCase()} ${req.url}`, err as Error);

			res.status(ENerveHTTPStatus.INTERNAL_ERROR);
			res.end();
		}
	}

	setOptions(options: INerveRestControllerOptions) {
		this.options = options;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async index(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveHTTPStatus.NOT_FOUND,
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await,sonarjs/no-identical-functions
	async view(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveHTTPStatus.NOT_FOUND,
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await,sonarjs/no-identical-functions
	async create(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveHTTPStatus.NOT_FOUND,
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await,sonarjs/no-identical-functions
	async update(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveHTTPStatus.NOT_FOUND,
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await,sonarjs/no-identical-functions
	async delete(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveHTTPStatus.NOT_FOUND,
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async beforeAction(method: string, req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerBeforeActionResult> {
		return { isAbort: false };
	}

}
