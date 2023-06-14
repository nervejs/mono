import {
	INerveNodeRouteHandlerBeforeProcessingResult,
	INerveNodeRouteHandlerOptions,
	INerveNodeRouteHandlerSendResponseParams,
	INerveNodeRouteHandlerTimings,
} from '@node/NerveNodeRouteHandler';

import { NerveServerApp } from '../NerveServerApp';

import {
	INerveCommonTemplateVars,
	INerveContentTemplateVars,
	INerveFooterTemplateVars,
	INerveHeadTemplateVars,
	INerveSimpleTemplate,
	INerveTemplate,
} from '@interfaces';

export interface INerveServerPageOptions extends INerveNodeRouteHandlerOptions {
	app: NerveServerApp;
}

export interface INerveServerPageSendResponseParams extends INerveNodeRouteHandlerSendResponseParams {}

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

export interface INerveServerPageBeforeProcessingResult extends INerveNodeRouteHandlerBeforeProcessingResult {}

export interface INerveServerPageHeadTemplateVars extends Omit<INerveHeadTemplateVars, keyof INerveCommonTemplateVars> {}

export interface INerveServerPageContentTemplateVars extends Omit<INerveContentTemplateVars, keyof INerveCommonTemplateVars> {}

export interface INerveServerPageFooterTemplateVars extends Omit<INerveFooterTemplateVars, keyof INerveCommonTemplateVars> {}

export interface INerveServerPageTemplateVarsMap {
	common: INerveCommonTemplateVars;
	head: INerveServerPageHeadTemplateVars;
	content: INerveServerPageContentTemplateVars;
	footer: INerveServerPageFooterTemplateVars;
}

export interface INerveServerPageTimings extends INerveNodeRouteHandlerTimings {
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
}
