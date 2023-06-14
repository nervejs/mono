import { ENerveHTTPStatus } from '@enums';

export interface INerveRestControllerErrorResult {
	error: {
		code: ENerveHTTPStatus;
		message: string;
	};
}
