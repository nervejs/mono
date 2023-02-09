import { ENerveContentType, ENerveHTTPStatus } from '../enums';

import { INerveRestControllerErrorResult } from './INerveRestControllerErrorResult';

export interface INerveRestControllerResult<T = unknown, P = INerveRestControllerErrorResult> {
	status?: ENerveHTTPStatus;
	data?: T | P;
	contentType?: ENerveContentType;
}
