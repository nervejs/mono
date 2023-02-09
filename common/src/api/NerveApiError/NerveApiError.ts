import { Log } from '@utils';

import { INerveHttpTransportError, INerveHttpTransportRequestParams } from '@interfaces';

import { IMydawnFeApiErrorOptions } from './types';

export class NerveApiError {

	error: INerveHttpTransportError;
	request: INerveHttpTransportRequestParams;

	constructor(options: IMydawnFeApiErrorOptions) {
		const {
			error,
			request,
		} = options;

		this.error = error;
		this.request = request;

		this.log();
	}

	protected log() {
		Log.error(`Failed network request: ${this?.error?.status} ${(this?.request?.method as unknown as string).toUpperCase()} ${this?.request?.url}
			\nParams: ${this.request.data ? this.request.data as string : ''}
			\nResponse: ${this?.error?.response}
		`);
	}

}
