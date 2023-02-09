/* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */

import fetch from 'node-fetch';

import { Logger } from '@decorators';

import { INerveApiResponse, INerveHttpTransportRequestParams } from '@interfaces';

@Logger({ prefix: 'HttpTransport' })
export class NerveHttpTransport {

	static async http<R>(params: INerveHttpTransportRequestParams): Promise<INerveApiResponse<R>> {
		const {
			url,
			method,
			data,
			headers,
		} = params;

		const response = await fetch(
			url,
			{
				method,
				body: data as any,
				headers: headers as any,
			},
		);

		const content = await response.text();

		return {
			data: content as unknown as R,
			status: response.status,
			statusText: response.statusText,
			headers: response.headers.raw() as any,
		};
	}

}
