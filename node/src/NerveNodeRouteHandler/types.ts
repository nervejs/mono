import { ENerveContentType, ENerveHTTPStatus } from '@enums';

import { NerveNodeApp } from '../NerveNodeApp';

import { NerveNodeRequest, NerveNodeResponse } from '@types';

export interface INerveNodeRouteHandlerOptions {
	app: NerveNodeApp;
	req: NerveNodeRequest;
	res: NerveNodeResponse;
}

export interface INerveNodeRouteHandlerSendResponseParams {
	content: string;
	contentType?: ENerveContentType;
	status?: ENerveHTTPStatus;
}

export interface INerveNodeRouteHandlerBeforeProcessingResult {
	isAbort: boolean;
}

export interface INerveNodeRouteHandlerTimings {
	start: number;
	end: number;
	duration: number;
	initActiveUser: number;
	beforeProcessing: number;
	processing: number;
	sendResponse: number;
}
