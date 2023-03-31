import { ENerveHTTPMethod } from '@enums';

import { NerveServerActiveUser } from '../NerveServerActiveUser';
import { NerveServerApp } from '../NerveServerApp';

import { NerveServerRequest } from '@types';

export interface INerveServerRequestOptions {
	app: NerveServerApp;
	activeUser: NerveServerActiveUser;
	req: NerveServerRequest;
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

export interface INerveServerRequestResponse<R = unknown> {
	data: R;
	raw: string;
	headers: Record<string, string>;
	status: number;

	statusText: string;
}
