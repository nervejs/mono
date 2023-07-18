import { FileArray } from 'express-fileupload';

import { ENerveHTTPMethod } from '@enums';

import { INerveRestControllerRequestParams } from '@interfaces';

export type NerveRestRequest<
	RequestParams extends INerveRestControllerRequestParams = {
		path: { [ key: string ]: string | number };
		body: { [ key: string ]: string | number | string[] | number[] };
		query: { [ key: string ]: string | number };
		headers: { [ key: string ]: string | number };
	}
> = {
	method: ENerveHTTPMethod;
	params: RequestParams['path'];
	body: RequestParams['body'];
	query: RequestParams['query'];
	headers: RequestParams['headers'];
	files: FileArray;
};
