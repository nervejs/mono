import { INerveRestControllerRequestParams } from '../interfaces';

export type NerveRestRequest<RequestParams extends INerveRestControllerRequestParams = { path: {}; query: {}; body: {}; headers: {} }> = {
	params: RequestParams['path'];
	body: RequestParams['body'];
	query: RequestParams['query'];
	headers: RequestParams['headers'];
};