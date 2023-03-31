import { NerveObject } from '../../NerveObject';

import { INerveHttpTransportRequestParams, INerveHttpTransportResponse } from '@interfaces';

import { INerveRequestErrorOptions } from './types';

export class NerveRequestError extends NerveObject {

	request: INerveHttpTransportRequestParams;
	response: INerveHttpTransportResponse;

	constructor(options: INerveRequestErrorOptions) {
		super();
		const {
			request,
			response,
		} = options;

		this.request = request;
		this.response = response;
	}

}
