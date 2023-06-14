import { ENerveContentType, ENerveHTTPStatus } from '@enums';

import { NerveNodeRequest, NerveNodeResponse } from '@node/types';

import { NerveRestApp } from '../NerveRestApp';

import { INerveRestControllerResult } from '@interfaces';

export interface INerveRestControllerOptions<
	A extends NerveRestApp = NerveRestApp,
	RQ extends NerveNodeRequest = NerveNodeRequest,
	RS extends NerveNodeResponse = NerveNodeResponse,
> {
	app: A;
	req: RQ;
	res: RS;
}

export interface INerveRestControllerSendResponseParams {
	content: string;
	contentType?: ENerveContentType;
	status?: ENerveHTTPStatus;
}

export interface INerveRestControllerTimings {
	start: number;
	end: number;
	duration: number;
	initActiveUser: number;
	beforeProcessing: number;
	processing: number;
	sendResponse: number;
}

export interface INerveRestControllerRunParams {
	action: string;
}

export interface INerveRestControllerActionParams {
	req: NerveNodeRequest;
	res: NerveNodeResponse;
}

export type TNerveRestControllerAction = (params: INerveRestControllerActionParams) => Promise<INerveRestControllerResult>;
