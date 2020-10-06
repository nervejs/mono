import { ENerveRestContentType, ENerveRestHTTPStatus } from '../enums';

export interface INerveRestControllerResult<T = {}> {
	status?: ENerveRestHTTPStatus;
	data?: T;
	contentType?: ENerveRestContentType;
}
