import { Request } from 'express';

import {
	INerveNodeRequestBody,
	INerveNodeRequestCookies,
	INerveNodeRequestHeaders,
	INerveNodeRequestParams,
	INerveNodeRequestQueryString,
} from '@interfaces';

export type NerveNodeRequest = Omit<Request, 'body' | 'cookies' | 'headers' | 'params' | 'query' | 'route'> &
	INerveNodeRequestBody &
	INerveNodeRequestCookies &
	INerveNodeRequestHeaders &
	INerveNodeRequestParams &
	INerveNodeRequestQueryString & {
		route: {
			path: string;
		};
	}
