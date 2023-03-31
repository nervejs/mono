import { INerveHttpTransportRequestParams, INerveHttpTransportResponse } from '@interfaces';

export interface INerveRequestErrorOptions {
	request: INerveHttpTransportRequestParams;
	response: INerveHttpTransportResponse;
}
