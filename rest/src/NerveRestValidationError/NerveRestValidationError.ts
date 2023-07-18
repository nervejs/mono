import { ENerveHTTPStatus } from '@enums';

import { INerveRestValidationErrorOptions } from './types';

export class NerveRestValidationError extends Error {

	public placement: string;
	public paramName: string;
	public type: string;
	public status: ENerveHTTPStatus;

	static getMessage(options: INerveRestValidationErrorOptions) {
		const {
			paramName,
			placement,
			errors,
		} = options;
		let message = '';

		if (paramName) {
			message = `Invalid param "${paramName}"`;
		} else {
			message = `Invalid params`;
		}

		if (placement !== 'custom') {
			message += ` in ${placement}`;
		}

		message += `: ${JSON.stringify(errors)}`;

		return message;
	}

	constructor(options: INerveRestValidationErrorOptions) {
		const {
			placement,
			paramName,
			type,
			status,
		} = options;

		super(NerveRestValidationError.getMessage(options));

		this.placement = placement;
		this.paramName = paramName;
		this.type = type;
		this.status = status;
	}

}
