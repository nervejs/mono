import { ENerveContentType, ENerveHTTPStatus } from '@enums';

import { NerveNodeObject } from '@node/NerveNodeObject';

import { NerveRestApp } from '../NerveRestApp';

import {
	INerveRestControllerOptions,
	INerveRestControllerRunParams,
	INerveRestControllerSendResponseParams,
	INerveRestControllerTimings,
	TNerveRestControllerAction,
} from './types';

export class NerveRestController extends NerveNodeObject {

	protected app: NerveRestApp;
	protected options: INerveRestControllerOptions;
	protected httpStatus: ENerveHTTPStatus = null;

	protected timings: INerveRestControllerTimings = {
		start: 0,
		end: 0,
		duration: 0,
		initActiveUser: 0,
		beforeProcessing: 0,
		processing: 0,
		sendResponse: 0,
	};

	constructor(options: INerveRestControllerOptions) {
		super();

		this.options = options;
		this.app = options.app;
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

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async sendResponse(params: INerveRestControllerSendResponseParams) {
		const startTimeStamp = Date.now();
		const {
			content,
			contentType,
			status,
		} = params;

		this.setHttpStatus(status || ENerveHTTPStatus.OK);
		this.setHeaders({
			'Content-Type': contentType || ENerveContentType.TEXT_HTML,
		});
		this.options.res.send(content);

		this.timings.sendResponse = Date.now() - startTimeStamp;
		this.logDebug(`Send Response ${this.timings.sendResponse}ms`);
	}

	async run(params: INerveRestControllerRunParams) {
		const {
			req,
			res,
		} = this.options;
		const { action } = params;

		try {
			const result = await (this as unknown as Record<string, TNerveRestControllerAction>)[action]({
				req,
				res,
			});
			const {
				status = ENerveHTTPStatus.OK,
				contentType = ENerveContentType.JSON,
				data,
			} = result;

			await this.sendResponse({
				status,
				contentType,
				content: contentType === ENerveContentType.JSON ? JSON.stringify(data) : data as string,
			});
		} catch (err) {
			this.errorLog('Failed processing controller', err as Error);

			await this.sendResponse({
				status: ENerveHTTPStatus.INTERNAL_ERROR,
				content: '',
			});
		}
	}

}
