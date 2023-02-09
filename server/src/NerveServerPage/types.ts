import { Response } from 'express';

import { ENerveContentType, ENerveHTTPStatus } from '@enums';

import { NerveServerApp } from '../NerveServerApp';

import { NerveServerRequest } from '@types';

export interface INerveServerPageOptions {
	app: NerveServerApp;
	req: NerveServerRequest;
	res: Response;
}

export interface INerveServerPageSendResponseParams {
	content: string;
	contentType?: ENerveContentType;
	status?: ENerveHTTPStatus;
}

export interface INerveServerPageTemplateConfig {
	path: string;
	isSimple?: boolean;
}

export interface INerveServerPageTemplatesConfigMap {
	head: INerveServerPageTemplateConfig;
	content: INerveServerPageTemplateConfig;
	footer: INerveServerPageTemplateConfig;
}

export interface INerveServerPageBeforeProcessingResult {
	isAbort: boolean;
}
