import { Response } from 'express';

import { ENerveContentType, ENerveHTTPStatus } from '@enums';

import { NerveServerApp } from '../NerveServerApp';

import { NerveServerRequest } from '@types';

import {
	INerveCommonTemplateVars,
	INerveContentTemplateVars,
	INerveFooterTemplateVars,
	INerveHeadTemplateVars,
	INerveSimpleTemplate,
	INerveTemplate,
} from '@interfaces';

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
	fetchData?: INerveServerPageTemplateConfig;
}

export interface INerveServerPageIncludedTemplate {
	path: string;
	module: INerveTemplate | INerveSimpleTemplate;
}

export interface INerveServerPageIncludedTemplatesMap {
	head: INerveServerPageIncludedTemplate;
	content: INerveServerPageIncludedTemplate;
	footer: INerveServerPageIncludedTemplate;
	fetchData?: INerveServerPageIncludedTemplate;
}

export interface INerveServerPageBeforeProcessingResult {
	isAbort: boolean;
}

export interface INerveServerPageHeadTemplateVars extends Omit<INerveHeadTemplateVars, keyof INerveCommonTemplateVars> {}

export interface INerveServerPageContentTemplateVars extends Omit<INerveContentTemplateVars, keyof INerveCommonTemplateVars> {}

export interface INerveServerPageFooterTemplateVars extends Omit<INerveFooterTemplateVars, keyof INerveCommonTemplateVars> {}

export interface INerveServerPageTemplateVarsMap {
	common: INerveCommonTemplateVars;
	head: INerveServerPageHeadTemplateVars;
	content: INerveServerPageContentTemplateVars;
	footer: INerveServerPageFooterTemplateVars;
}

export interface INerveServerPageTimings {
	start: number;
	end: number;
	duration: number;
	initActiveUser: number;
	beforeProcessing: number;
	processing: number;
	templateVars: {
		common: number;
		head: number;
		content: number;
		footer: number;
		all: number;
	};
	postProcessedVarsAfterFetchData: number;
	includeTemplates: {
		head: number;
		content: number;
		footer: number;
		fetchData: number;
	};
	renderTemplates: {
		head: number;
		content: number;
		footer: number;
		all: number;
	};
	fetchData: number;
	sendResponse: number;
}
