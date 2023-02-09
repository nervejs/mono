import { Request } from 'express';

import { INerveServerCookies, INerveServerHeaders, INerveServerQueryString } from '@interfaces';

export type NerveServerRequest = Omit<Request, 'headers' | 'query' | 'cookies' | 'route'> & INerveServerHeaders & INerveServerQueryString & INerveServerCookies & {
	route: {
		path: string;
	};
}
