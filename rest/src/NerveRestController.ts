import { Express, Request, Response } from 'express';

import { ENerveRestContentType, ENerveRestHTTPMethod, ENerveRestHTTPStatus, ENerveRestStandartAction } from './enums';

import { Log } from './utils';

import { Logger } from './decorators';

import { NerveRestApp } from './NerveRestApp';
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

	protected options: INerveRestControllerOptions;

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
				url: (action.isAbsoluteUrl ? action.url : `${routeUrl}${action.url ? `/${action.url}` : ''}`).replace(/\/+/g, '/'),
			}));

			customActions.forEach((action) => {
				switch (action.method) {
					case ENerveRestHTTPMethod.GET:
						express.get(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
					case ENerveRestHTTPMethod.POST:
						express.post(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
					case ENerveRestHTTPMethod.PUT:
						express.put(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
					case ENerveRestHTTPMethod.DELETE:
						express.delete(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						express.options(action.url, async (req: Request, res: Response) => this.wrapper(action.action, req, res));
						break;
				}
			});
		}

		if (this.prototype.hasOwnProperty('index')) {
			express.get(routeUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.INDEX, req, res));
			express.options(routeUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.INDEX, req, res));
			routeActions.push({ method: ENerveRestHTTPMethod.GET, url: routeUrl, action: ENerveRestStandartAction.INDEX });
		}

		if (this.prototype.hasOwnProperty('view')) {
			express.get(viewUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.VIEW, req, res));
			express.options(viewUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.VIEW, req, res));
			routeActions.push({ method: ENerveRestHTTPMethod.GET, url: viewUrl, action: ENerveRestStandartAction.VIEW });
		}

		if (this.prototype.hasOwnProperty('create')) {
			express.post(routeUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.CREATE, req, res));
			express.options(routeUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.CREATE, req, res));
			routeActions.push({ method: ENerveRestHTTPMethod.POST, url: routeUrl, action: ENerveRestStandartAction.CREATE });
		}

		if (this.prototype.hasOwnProperty('update')) {
			express.put(updateUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.UPDATE, req, res));
			express.options(updateUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.UPDATE, req, res));
			routeActions.push({ method: ENerveRestHTTPMethod.PUT, url: updateUrl, action: ENerveRestStandartAction.UPDATE });
		}

		if (this.prototype.hasOwnProperty('delete')) {
			express.delete(deleteUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.DELETE, req, res));
			express.options(deleteUrl, async (req: Request, res: Response) => this.wrapper(ENerveRestStandartAction.DELETE, req, res));
			routeActions.push({ method: ENerveRestHTTPMethod.DELETE, url: deleteUrl, action: ENerveRestStandartAction.DELETE });
		}

		return routeActions.concat(customActions);
	}

	static async wrapper(actionName: string, req: Request, res: Response) {
		try {
			const controller = new this();
			let result: INerveRestControllerResult;

			controller.setOptions(this.app.getControllerOptions());

			const beforeResult = await controller.beforeAction(actionName, req, res);

			Log.info(`WRAP REQUEST (CONTROLLER: ${this.name}; ACTION: ${actionName})`);

			if (beforeResult.isAbort) {
				Log.info(`(CONTROLLER: ${this.name}; ACTION: ${actionName}) ABORTED BY BEFORE ACTION`);

				res.status(beforeResult.status || ENerveRestHTTPStatus.OK);
				res.end(JSON.stringify(beforeResult.data || {}));
			} else {
				if (this.prototype.hasOwnProperty(actionName)) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					result = await (controller as any)[actionName](req, res);
				}

				res.status(result.status || ENerveRestHTTPStatus.OK);
				if (!result.contentType || result.contentType === ENerveRestContentType.JSON) {
					res.setHeader('Content-Type', `${ENerveRestContentType.JSON}; charset=utf-8`);
					res.end(JSON.stringify(result.data || {}));
				} else {
					res.setHeader('Content-Type', `${result.contentType || 'application/octet-stream'}; charset=utf-8`);
					res.end(result.data);
				}
			}
		} catch (err) {
			Log.error(`Error on ${req.method.toUpperCase()} ${req.url}`, err);

			res.status(ENerveRestHTTPStatus.INTERNAL_ERROR);
			res.end();
		}
	}

	setOptions(options: INerveRestControllerOptions) {
		this.options = options;
	}

	async index(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveRestHTTPStatus.NOT_FOUND,
		};
	}

	async view(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveRestHTTPStatus.NOT_FOUND,
		};
	}

	async create(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveRestHTTPStatus.NOT_FOUND,
		};
	}

	async update(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveRestHTTPStatus.NOT_FOUND,
		};
	}

	async delete(req: NerveRestRequest, res: NerveRestResponse): Promise<INerveRestControllerResult> {
		return {
			status: ENerveRestHTTPStatus.NOT_FOUND,
		};
	}

	protected async beforeAction(method: string, req: Request, res: Response): Promise<INerveRestControllerBeforeActionResult> {
		return { isAbort: false };
	}

}
