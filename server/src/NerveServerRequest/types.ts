import { ENerveHTTPMethod } from '@enums';

import { NerveServerActiveUser } from '../NerveServerActiveUser';
import { NerveServerApp } from '../NerveServerApp';

import { NerveNodeRequest } from '@types';

export interface INerveServerRequestOptions {
	app: NerveServerApp;
	activeUser: NerveServerActiveUser;
	req: NerveNodeRequest;
	requestId: string;
	timeout?: number;
	isIgnoreSourceHeaders?: boolean;
	log?: {
		url?: boolean;
		request?: {
			headers?: boolean;
			body?: boolean;
		};
		response?: {
			headers?: boolean;
			body?: boolean;
			status?: boolean;
		};
		duration?: boolean;
		summary?: boolean;
	};
}

export interface INerveServerRequestParams {
	upstream: string;
	method?: ENerveHTTPMethod;
	url: string;
	headers?: Record<string, string>;
	body?: unknown;
}

export interface INerveServerRequestDirectOptions extends Omit<INerveServerRequestOptions, 'activeUser' | 'req' | 'requestId'> {}

export interface INerveServerRequestDirectParams extends Omit<INerveServerRequestParams, 'upstream'> {
	host: string;
	protocol: string;
}

export interface INerveServerRequestResponse<R = unknown> {
	data: R;
	raw: string;
	headers: Record<string, string>;
	status: number;

	statusText: string;
}
