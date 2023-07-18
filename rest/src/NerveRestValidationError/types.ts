import { ENerveHTTPStatus } from '@enums';

import { TNerveRestParamPlacement } from '@types';

export interface INerveRestValidationErrorOptions {
	errors: string[];
	paramName?: string;
	type: string;
	placement: TNerveRestParamPlacement;
	status?: ENerveHTTPStatus;
}
