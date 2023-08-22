import { Schema } from 'yup';

import { ENerveRestParamType } from '@enums';

import { INerveRestValidationError } from '@interfaces';

export interface INerveRestContextParamOptionsNonGeneric {
	validation?: {
		yup: Schema;
		custom?: (value: unknown) => Promise<INerveRestValidationError | null>;
	},
	type: ENerveRestParamType;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface INerveRestContextParamOptions<T> extends INerveRestContextParamOptionsNonGeneric {}
