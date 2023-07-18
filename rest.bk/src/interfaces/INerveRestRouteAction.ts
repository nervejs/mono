import { ENerveHTTPMethod } from '@common/enums/ENerveHTTPMethod';

export interface INerveRestRouteAction {
	method: ENerveHTTPMethod;
	url: string;
	action: string;
	isAbsoluteUrl?: string;
}
