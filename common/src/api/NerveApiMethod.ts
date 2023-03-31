import { ENerveHTTPMethod } from '@enums';

import { getURIParams } from '@utils';

import { NerveApi } from './NerveApi';
import { NerveRequestError } from './NerveRequestError';

import { INerveApiRequest, INerveApiResponse, INerveHttpTransportError } from '@interfaces';

export class NerveApiMethod {

	protected api: typeof NerveApi;

	constructor(api: typeof NerveApi) {
		this.api = api;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async http<T, P>(params: INerveApiRequest): Promise<INerveApiResponse<P>> {
		const transport = this.api.getTransport();
		// const isAbsoluteUrl = /^https?/.test(params.url);
		const data = params.data && !params.isNoProcessData ? getURIParams(params.data as unknown as { [key: string]: string | number }) : params.data || null;

		// params.url = isAbsoluteUrl ? params.url : `/v1${params.url}`;

		try {
			return await transport.http({
				...params,
				data,
			});
		} catch (err) {
			const error = err as INerveHttpTransportError;

			throw new NerveRequestError({
				response: error?.response,
				request: {
					url: params.url,
					method: params.method,
					data,
					headers: error?.response?.headers,
				},
			});
		}
	}

	async get<T, P>(params: INerveApiRequest): Promise<INerveApiResponse<P>> {
		params.method = ENerveHTTPMethod.GET;

		return this.http<T, P>(params);
	}

	async post<T, P>(params: INerveApiRequest): Promise<INerveApiResponse<P>> {
		params.method = ENerveHTTPMethod.POST;

		return this.http<T, P>(params);
	}

	async put<T, P>(params: INerveApiRequest): Promise<INerveApiResponse<P>> {
		params.method = ENerveHTTPMethod.PUT;

		return this.http<T, P>(params);
	}

	async patch<T, P>(params: INerveApiRequest): Promise<INerveApiResponse<P>> {
		params.method = ENerveHTTPMethod.PATCH;

		return this.http<T, P>(params);
	}

	async delete<T, P>(params: INerveApiRequest): Promise<INerveApiResponse<P>> {
		params.method = ENerveHTTPMethod.DELETE;
		params.headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
		};

		return this.http<T, P>(params);
	}

}
