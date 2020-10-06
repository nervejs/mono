import { ENerveRestHTTPStatus } from '../enums';

export interface INerveRestControllerBeforeActionResult {
	isAbort: boolean;
	status?: ENerveRestHTTPStatus;
	data?: unknown;
}
