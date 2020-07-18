import { ENerveRestContentType, ENerveRestHTTPStaus } from '../enums';

export interface INerveRestControllerResult<T = {}> {
	status?: ENerveRestHTTPStaus;
	data?: T;
	contentType?: ENerveRestContentType;
}