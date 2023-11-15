import { Upstream } from 'balancer-round-robin';
import fetch, { BodyInit, Response } from 'node-fetch';
import { v4 as uuid } from 'uuid';

import { getDefaultLogPrefix } from '@utils';

import { Logger } from '@decorators';

import { NerveNodeObject } from '@node/NerveNodeObject';

import { INerveServerUpstreamsConfigPoolItemExtra } from '@interfaces';

import {
	INerveServerRequestOptions,
	INerveServerRequestParams,
	INerveServerRequestResponse,
	INerveServerRequestDirectParams,
	INerveServerRequestDirectOptions,
} from './types';

@Logger({ prefix: 'Request' })
export class NerveServerRequest extends NerveNodeObject {

	protected options: INerveServerRequestOptions | INerveServerRequestDirectOptions;

	protected id = uuid();

	protected params: INerveServerRequestParams | INerveServerRequestDirectParams;

	protected upstream: Upstream<INerveServerUpstreamsConfigPoolItemExtra>;

	protected requestHeaders: Record<string, string>;

	protected response: INerveServerRequestResponse<unknown>;

	protected startTimestamp: number;

	protected endTimestamp: number;

	constructor(options: INerveServerRequestOptions | INerveServerRequestDirectOptions) {
		super();

		this.options = {
			timeout: options.timeout || options.app.config.request.timeout || 5000,
			...options,
			log: {
				url: true,
				request: {
					headers: true,
					body: true,
					...options?.log?.request,
				},
				response: {
					headers: true,
					body: true,
					status: true,
					...options?.log?.response,
				},
				duration: true,
				summary: true,
				...options?.log,
			},
		};
	}

	protected getLogPrefix() {
		return `${getDefaultLogPrefix({ requestId: (this.options as INerveServerRequestOptions).requestId })} [${this.id}]`;
	}

	protected initUpstream() {
		const { upstream } = this.params as INerveServerRequestParams;
		const { host, protocol } = this.params as INerveServerRequestDirectParams;

		if (!upstream && host) {
			this.upstream = new Upstream({
				server: host,
				extra: { protocol },
			});
		} else {
			this.upstream = this.options.app.upstreamBalancer.get(upstream);
		}

		if (!this.upstream) {
			throw Error('UPSTREAM_NOT_FOUND');
		}
	}

	protected getRequestUrl() {
		return `${this.upstream.extra.protocol}://${this.upstream.server}${this.params.url}`;
	}

	protected getRequestHeaders(): Record<string, string> {
		const { headers = {}, body, method } = this.params;
		const { isIgnoreSourceHeaders } = this.options;
		const hasBody = Boolean(body) && !['get', 'delete'].includes(String(method).toLocaleLowerCase());
		const hasContentTypeHeader = Object.keys(headers)
			.map((header) => header.toLowerCase())
			.includes('content-type');

		const requestHeaders: Record<string, string> = {
			...(isIgnoreSourceHeaders ? {} : (this.options as INerveServerRequestOptions).req?.headers || {}),
			...headers,
			...this.upstream.extra.headers,
			...(
				hasContentTypeHeader || !hasBody
					? {}
					: {
						'Content-Type': 'application/x-www-form-urlencoded',
					}
			),
		};

		if (!hasBody) {
			delete requestHeaders['content-length'];
			delete requestHeaders['Content-Length'];
		}

		return requestHeaders;
	}

	protected beforeFetch() {
		this.startTimestamp = Date.now();

		const method = String(this.params.method || 'GET').toUpperCase();

		if (this.options.log.url) {
			this.logInfo(`URL: ${method} ${this.getRequestUrl()}`);
		}

		if (this.options.log.request.headers) {
			this.logInfo(`Request Headers: ${JSON.stringify(this.requestHeaders)}`);
		}

		if (this.options.log.request.body) {
			this.logInfo(`Request Body: ${JSON.stringify(this.params.body)}`);
		}
	}

	protected afterFetch() {
		this.endTimestamp = Date.now();

		const method = String(this.params.method || 'GET').toUpperCase();
		const duration = this.endTimestamp - this.startTimestamp;

		if (this.options.log.response.status) {
			this.logInfo(`Response Status: ${this.response.status}`);
		}

		if (this.options.log.response.headers) {
			this.logInfo(`Response Headers: ${JSON.stringify(this.response.headers)}`);
		}

		if (this.options.log.response.body) {
			this.logInfo(`Response Body: ${this.response.raw}`);
		}

		if (this.options.log.duration) {
			this.logDebug(`Duration: ${duration}ms`);
		}

		if (this.options.log.summary) {
			this.logInfo(`${method} ${this.getRequestUrl()} ${this.response.status} ${duration}ms`);
		}
	}

	protected async send<R = unknown>(): Promise<INerveServerRequestResponse<R>> {
		const {
			method,
			body,
		} = this.params;
		const isContentTypeFormUrlEncoded = Object.keys(this.requestHeaders)
			.map((header) => ({ key: header.toLowerCase(), value: this.requestHeaders[header] }))
			.some(({ key, value }) => key === 'content-type' && value === 'application/x-www-form-urlencoded');
		const controller = new AbortController();
		let response: Response;
		let isTimeout = false;

		const timer = setTimeout(
			() => {
				isTimeout = true;
				controller.abort();
			},
			this.options.timeout,
		);

		try {
			response = await fetch(
				this.getRequestUrl(),
				{
					headers: this.requestHeaders,
					method,
					body: (
						isContentTypeFormUrlEncoded && Boolean(body)
							? Object.keys(body)
								.map((key) => `${key}=${encodeURIComponent((body as Record<string, string>)[key])}`)
								.join('&')
							: body
					) as BodyInit,
					signal: controller.signal,
				});
		} catch (err) {
			if (isTimeout) {
				this.logError('Aborted by timeout');
			}

			this.logError(`Failed ${response?.status || ''}`, err as Error);

			throw err;
		} finally {
			clearTimeout(timer);
		}

		const raw = await response.text();
		let data = {} as R;

		try {
			data = JSON.parse(raw) as R;
		} catch (err) {}

		return {
			status: response.status,
			statusText: response.statusText,
			raw,
			data,
			headers: response.headers.raw() as unknown as Record<string, string>,
		};
	}

	async fetch<R = unknown>(params: INerveServerRequestParams | INerveServerRequestDirectParams): Promise<INerveServerRequestResponse<R>> {
		let error: unknown = null;

		this.params = params;

		this.initUpstream();
		this.requestHeaders = this.getRequestHeaders();

		this.beforeFetch();

		try {
			this.response = await this.send<R>();
		} catch (err) {
			error = err;
		} finally {
			this.afterFetch();
		}

		if (error) {
			throw error;
		} else {
			return this.response as INerveServerRequestResponse<R>;
		}
	}

	static async fetch<R = unknown>(options: INerveServerRequestOptions, params: INerveServerRequestParams) {
		const instance = new this(options);

		return instance.fetch<R>(params);
	}

	static async fetchDirect<R = unknown>(options: INerveServerRequestDirectOptions, params: INerveServerRequestDirectParams) {
		return this.fetch<R>(
			options as INerveServerRequestOptions,
			params as unknown as INerveServerRequestParams,
		);
	}

}
