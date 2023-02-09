import { ENerveHTTPStatus } from '../enums';

export interface INerveRestControllerBeforeActionResult {
	isAbort: boolean;
	status?: ENerveHTTPStatus;
	data?: unknown;
}
