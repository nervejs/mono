import { v4 as uuid } from 'uuid';

import { ENerveContentType, ENerveHTTPStatus, ENerveLocale } from '@enums';

import { getDefaultLogPrefix } from '@utils';

import { NerveNodeActiveUser } from '../NerveNodeActiveUser';
import { NerveNodeApp } from '../NerveNodeApp';
import { NerveNodeObject } from '../NerveNodeObject';

import {
	INerveNodeRouteHandlerBeforeProcessingResult,
	INerveNodeRouteHandlerOptions,
	INerveNodeRouteHandlerSendResponseParams,
	INerveNodeRouteHandlerTimings,
} from './types';

export class NerveNodeRouteHandler extends NerveNodeObject {

	protected options: INerveNodeRouteHandlerOptions;

	protected app: NerveNodeApp;
	protected httpStatus: ENerveHTTPStatus = null;
	protected fetchedData: unknown = {};
	protected activeUser: NerveNodeActiveUser;
	protected requestId = uuid();
	protected defaultContentType = ENerveContentType.TEXT_HTML;

	protected processingResponseDuration = 1;

	protected timings: INerveNodeRouteHandlerTimings = {
		start: 0,
		end: 0,
		duration: 0,
		initActiveUser: 0,
		beforeProcessing: 0,
		processing: 0,
		sendResponse: 0,
	};

	protected renderResultExtra: unknown = null;

	protected onResponseFinishHandler: () => void;

	constructor(options: INerveNodeRouteHandlerOptions) {
		super();

		this.timings.start = Date.now();

		this.options = options;
		this.app = options.app;

		this.onResponseFinishHandler = () => this.onResponseFinish();
		this.options.res.on('finish', this.onResponseFinishHandler);
	}

	protected async initActiveUserWrapper() {
		const startInitActiveUserTimestamp = Date.now();

		await this.initActiveUser();

		this.timings.initActiveUser = Date.now() - startInitActiveUserTimestamp;
		this.logDebug(`Init active user: ${this.timings.initActiveUser}ms`);
	}

	protected async initActiveUser() {
		const {
			app,
			req,
			res,
		} = this.options;

		this.activeUser = new NerveNodeActiveUser({
			app,
			req,
			res,
			requestId: this.requestId,
		});

		await this.activeUser.init();
	}

	protected setHeaders(headers: Record<string, string>) {
		Object.entries(headers).forEach(
			([key, value]) => this.options.res.header(key, value),
		);
	}

	protected setHttpStatus(status: ENerveHTTPStatus) {
		this.options.res.status(status);
		this.httpStatus = status;
	}

	protected getLogPrefix() {
		const routePath = this.options.req.route.path;
		const user = this.activeUser && this.activeUser.getUniqIdentifier();

		return `${getDefaultLogPrefix({ requestId: this.requestId })} [${routePath}] [${user}]`;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async sendResponse(params: INerveNodeRouteHandlerSendResponseParams) {
		const startTimeStamp = Date.now();
		const {
			content,
			contentType,
			status,
		} = params;

		this.setHttpStatus(status || ENerveHTTPStatus.OK);
		this.setHeaders({
			'Content-Type': contentType || this.defaultContentType,
		});
		this.options.res.send(content);

		this.timings.sendResponse = Date.now() - startTimeStamp;
		this.logDebug(`Send Response ${this.timings.sendResponse}ms`);
	}

	protected redirect(location: string, status?: ENerveHTTPStatus) {
		this.setHttpStatus(status || ENerveHTTPStatus.FOUND);
		this.setHeaders({ location });

		this.options.res.send('');
	}

	protected getCurrentLocale(): ENerveLocale {
		return ENerveLocale.EN_US;
	}

	protected async beforeProcessingWrapper() {
		const startBeforeProcessingTimestamp = Date.now();

		const result = await this.beforeProcessing();

		this.timings.beforeProcessing = Date.now() - startBeforeProcessingTimestamp;
		this.logDebug(`Before processing (isAbort=${String(result.isAbort)}): ${this.timings.beforeProcessing}ms`);

		return result;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async beforeProcessing(): Promise<INerveNodeRouteHandlerBeforeProcessingResult> {
		return { isAbort: false };
	}

	protected async processingWrapper() {
		const startProcessingTimestamp = Date.now();

		await this.processing();

		this.timings.processing = Date.now() - startProcessingTimestamp;
		this.logDebug(`Processing ${this.timings.processing}ms`);
	}

	protected async processing() {
		try {
			const content = await this.getResponse();

			await this.sendResponse({
				content,
				contentType: this.isResponseAsJson() ? ENerveContentType.JSON : this.defaultContentType,
			});
		} catch (err) {
			this.errorLog('Failed processing page', err as Error);

			await this.sendResponse({
				status: ENerveHTTPStatus.INTERNAL_ERROR,
				content: '',
			});
		}
	}

	protected isResponseAsJson() {
		return false;
	}

	protected onResponseFinish() {
		this.timings.end = Date.now();
		this.timings.duration = this.timings.end - this.timings.start;

		this.options.res.off('finish', this.onResponseFinishHandler);

		this.logInfo(`Finish response [status=${this.options.res.statusCode}]`);
	}

	async run() {
		try {
			await this.initActiveUserWrapper();

			const { isAbort } = await this.beforeProcessingWrapper();

			if (isAbort) {
				this.logDebug(`Processing skipped`);
			} else {
				await this.processingWrapper();
			}
		} catch (err) {
			this.errorLog('Failed processing page', err as Error);

			await this.sendResponse({
				status: ENerveHTTPStatus.INTERNAL_ERROR,
				content: '',
			});
		}
	}

	protected async getResponse(): Promise<string> {
		return '';
	}

	getRequestUrl(): string {
		return this.options.req.url;
	}

	getUserAgent() {
		return this.options.req.headers['user-agent'] || '';
	}

	getReq() {
		return this.options.req;
	}

	getRes() {
		return this.options.res;
	}

	getFullProcessingTime() {
		const { start, end } = this.timings;

		return end - start;
	}

	getProcessingResponseDuration() {
		const { initActiveUser } = this.timings;
		const fullTime = this.getFullProcessingTime();

		return fullTime - initActiveUser;
	}

}
