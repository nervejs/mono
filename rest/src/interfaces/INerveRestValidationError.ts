import { ENerveHTTPStatus } from '@enums';

export interface INerveRestValidationError {
	type: string;
	errors: string[];
	status?: ENerveHTTPStatus;
}
