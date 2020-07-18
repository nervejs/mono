import { ENerveRestHTTPStaus } from '../enums';

export interface INerveRestControllerBeforeActionResult {
	isAbort: boolean;
	status?: ENerveRestHTTPStaus;
	data?: unknown;
}