import { ENerveHTTPMethod, ENerveHTTPStatus } from '../enums';

import { INerveApiResponse } from './api';

export interface INerveHttpTransport {

	http<R>(params: INerveHttpTransportRequestParams): Promise<INerveApiResponse<R>>;

}

export interface INerveHttpTransportRequestParams {
	url: string;
	method?: ENerveHTTPMethod
	data?: FormData | string | Record<string, string | number | boolean>;
	headers?: Record<string, string | number | boolean>;
}

export interface INerveHttpTransportResponse<R = unknown> {
	status: ENerveHTTPStatus;
	data: R;
	headers: Record<string, string | number | boolean>;
}

export interface INerveHttpTransportError {
	response: INerveHttpTransportResponse;
}
