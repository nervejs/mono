import { NerveRestValidationError } from 'NerveRestValidationError';

import { ENerveContentType, ENerveHTTPStatus } from '@enums';

import { Logger } from '@decorators';

import { NerveNodeRouteHandler } from '@node/NerveNodeRouteHandler';

import { NerveRestApp } from '../NerveRestApp';
import { NerveRestContext } from '../NerveRestContext';

import { INerveRestControllerResult } from '@interfaces';

import { INerveRestActionOptions, INerveRestActionScheme } from './types';

@Logger({ prefix: 'Action' })
export class NerveRestAction extends NerveNodeRouteHandler {

	protected app: NerveRestApp;
	protected options: INerveRestActionOptions;
	protected defaultContentType = ENerveContentType.JSON;

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async handler(ctx: NerveRestContext<unknown>): Promise<INerveRestControllerResult> {
		return {
			status: ENerveHTTPStatus.NOT_FOUND,
			data: {
				error: {
					code: ENerveHTTPStatus.NOT_FOUND,
					message: 'handler not defined',
				},
			},
		};
	}

	constructor(options: INerveRestActionOptions) {
		super(options);
	}

	protected getScheme(): INerveRestActionScheme {
		return { request: {} };
	}

	protected getContext(): NerveRestContext<unknown> {
		const { params, query, headers, body } = this.options.req;
		const { request: scheme } = this.getScheme();

		return new NerveRestContext({
			app: this.app,
			requestId: this.requestId,
			activeUser: this.activeUser,
			req: this.options.req,
			scheme,
			data: {
				params,
				query,
				headers,
				body,
			},
		});
	}

	protected isResponseAsJson() {
		return true;
	}

	protected async processing() {
		try {
			const ctx = this.getContext();
			let isValid = true;

			try {
				isValid = await ctx.validate();
			} catch (err) {
				const errors = err as NerveRestValidationError[];
				const isUncaughtError = errors.some((item) => item.type === 'uncaught_error');

				isValid = false;

				if (isUncaughtError) {
					await this.sendResponse({
						status: errors[0]?.status || ENerveHTTPStatus.INTERNAL_ERROR,
						content: JSON.stringify({
							error: 'uncaught_error',
						}),
					});
				} else {
					await this.sendResponse({
						status: errors[0]?.status || ENerveHTTPStatus.BAD_REQUEST,
						content: JSON.stringify({
							error: 'validation',
							list: errors.map((item) => ({
								message: item.message,
								placement: item.placement,
								paramName: item.paramName,
								type: item.type,
							})),
						}),
					});
				}
			}

			if (isValid) {
				const {
					status,
					contentType,
					data,
				} = await this.handler(ctx);

				await this.sendResponse({
					status,
					content: this.isResponseAsJson() ? JSON.stringify(data) : data as string,
					contentType: contentType || (this.isResponseAsJson() ? ENerveContentType.JSON : this.defaultContentType),
				});
			}
		} catch (err) {
			this.errorLog('Failed processing page', err as Error);

			await this.sendResponse({
				status: ENerveHTTPStatus.INTERNAL_ERROR,
				content: '',
			});
		}
	}

}
