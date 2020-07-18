import { ENerveRestHTTPMethod } from '../enums/ENerveRestHTTPMethod';

export interface INerveRestRouteAction {
	method: ENerveRestHTTPMethod;
	url: string;
	action: string;
	isAbsoluteUrl?: string;
}
