import { ENerveHTTPMethod } from '@enums';

export interface INerveNodeRoute {
	path: string;
	method?: ENerveHTTPMethod;
}
