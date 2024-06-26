// eslint-disable-next-line import/named
import { mergeWith } from 'lodash';
import * as path from 'path';
// eslint-disable-next-line import/named
import { IResult as IUAParserResult, UAParser } from 'ua-parser-js';

import { ENerveContentType, ENerveHTTPStatus, ENerveLocale } from '@enums';

import { Logger } from '@decorators';

import { INerveNodeRouteHandlerBeforeProcessingResult, NerveNodeRouteHandler } from '@node/NerveNodeRouteHandler';

import { NerveHttpTransport } from '../NerveHttpTransport';
import { NerveServerActiveUser } from '../NerveServerActiveUser';
import { NerveServerApp } from '../NerveServerApp';

import {
	INerveClientConfig,
	INerveCommonTemplateVars,
	INerveContentTemplateVars,
	INerveFooterTemplateVars,
	INerveHeadTemplateVars,
	INerveHttpTransport,
	INerveSimpleTemplate,
	INerveTemplate,
} from '@interfaces';

import {
	INerveServerPageBeforeProcessingResult,
	INerveServerPageIncludedTemplate,
	INerveServerPageIncludedTemplatesMap,
	INerveServerPageOptions,
	INerveServerPageSendResponseParams,
	INerveServerPageTemplatesConfigMap,
	INerveServerPageTemplateVarsMap,
	INerveServerPageTimings,
} from './types';

@Logger({ prefix: 'Page' })
export class NerveServerPage extends NerveNodeRouteHandler {

	protected options: INerveServerPageOptions;

	protected app: NerveServerApp;
	protected templates: INerveServerPageTemplatesConfigMap = {
		head: null,
		content: null,
		footer: null,
		fetchData: null,
	};
	protected includedTemplates: INerveServerPageIncludedTemplatesMap = {
		head: null,
		content: null,
		footer: null,
		fetchData: null,
	};
	protected preFetchedData: unknown = {};
	protected fetchedData: unknown = {};
	protected activeUser: NerveServerActiveUser;
	protected defaultContentType = ENerveContentType.TEXT_HTML;

	protected uaParserResult: IUAParserResult = null;

	protected timings: INerveServerPageTimings = {
		...this.timings,
		templateVars: {
			common: 0,
			head: 0,
			content: 0,
			footer: 0,
			all: 0,
		},
		postProcessedVarsAfterFetchData: 0,
		includeTemplates: {
			head: 0,
			content: 0,
			footer: 0,
			fetchData: 0,
		},
		renderTemplates: {
			head: 0,
			content: 0,
			footer: 0,
			all: 0,
		},
		fetchData: 0,
	};

	protected renderResultExtra: unknown = null;

	constructor(options: INerveServerPageOptions) {
		super(options);

		this.parseUserAgent();
	}

	protected async initActiveUser() {
		const {
			app,
			req,
			res,
		} = this.options;

		this.activeUser = new NerveServerActiveUser({
			app,
			req,
			res,
			requestId: this.requestId,
		});

		await this.activeUser.init();
	}

	protected getHttpTransport(): INerveHttpTransport {
		return NerveHttpTransport;
	}

	protected parseUserAgent() {
		const parser = new UAParser(this.getUserAgent());

		this.uaParserResult = parser.getResult();
	}

	protected async sendResponse(params: INerveServerPageSendResponseParams) {
		return super.sendResponse(params);
	}

	protected getLocalesVars() {
		return this.options.app.localesManager.getLocales(this.getCurrentLocale());
	}

	protected getCurrentLocale(): ENerveLocale {
		return ENerveLocale.EN_US;
	}

	protected includeTemplate(tmplKey: keyof INerveServerPageTemplatesConfigMap): INerveServerPageIncludedTemplate {
		const startTimeStamp = Date.now();
		const templatesDir = this.app.getTemplatesDir();
		const tmpl = this.templates[tmplKey];
		const templatePath = path.resolve(templatesDir, tmpl.path);

		if (!this.options.app.config.render.isCacheEnabled) {
			delete require.cache[require.resolve(templatePath)];
		}

		const result = {
			path: templatePath,
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			module: require(templatePath) as INerveServerPageIncludedTemplate['module'],
		};

		this.timings.includeTemplates[tmplKey] = Date.now() - startTimeStamp;
		this.logDebug(`Include template "${tmplKey}" (${templatePath}) ${this.timings.includeTemplates[tmplKey]}ms`);

		return result;
	}

	protected isSimpleIncludedTemplate(tmpl: INerveTemplate | INerveSimpleTemplate): tmpl is INerveSimpleTemplate {
		const module = tmpl as INerveTemplate;

		return !Boolean(module.render || module.fetchData);
	}

	protected prepareTemplates() {
		if (this.templates.head) {
			this.includedTemplates.head = this.includeTemplate('head');
		}
		if (this.templates.content) {
			this.includedTemplates.content = this.includeTemplate('content');
		}
		if (this.templates.footer) {
			this.includedTemplates.footer = this.includeTemplate('footer');
		}
		if (this.templates.fetchData) {
			this.includedTemplates.fetchData = this.includeTemplate('fetchData');
		}
	}

	protected async getPostProcessedVarsAfterFetchDataWrapper(templateVarsMap: INerveServerPageTemplateVarsMap): Promise<INerveServerPageTemplateVarsMap> {
		const startTimestamp = Date.now();

		const result = await this.getPostProcessedVarsAfterFetchData(templateVarsMap);

		this.timings.postProcessedVarsAfterFetchData = Date.now() - startTimestamp;
		this.logDebug(`Post processed vars after fetch data ${this.timings.postProcessedVarsAfterFetchData}ms`);

		return result;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async getPostProcessedVarsAfterFetchData(templateVarsMap: INerveServerPageTemplateVarsMap): Promise<INerveServerPageTemplateVarsMap> {
		const {
			common,
			head,
			content,
			footer,
		} = templateVarsMap;
		const fetchedData = this.fetchedData;

		return {
			common: { ...common, fetchedData },
			head: { ...head, fetchedData },
			content: { ...content, fetchedData },
			footer: { ...footer, fetchedData },
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async beforeProcessing(): Promise<INerveServerPageBeforeProcessingResult> {
		return { isAbort: false };
	}

	protected async afterPrefetchDataWrapper() {
		const startAfterPrefetchDataTimestamp = Date.now();

		const result = await this.afterPrefetchData();

		this.timings.afterPrefetchData = Date.now() - startAfterPrefetchDataTimestamp;
		this.logDebug(`After prefetch data (isAbort=${String(result.isAbort)}): ${this.timings.afterPrefetchData}ms`);

		return result;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async afterPrefetchData(): Promise<INerveNodeRouteHandlerBeforeProcessingResult> {
		return { isAbort: false };
	}

	protected async processing() {
		try {
			const templateVarsMap = await this.getTemplateVarsMap();

			this.prepareTemplates();

			await this.preFetchDataWrapper(templateVarsMap);

			const { isAbort } = await this.afterPrefetchDataWrapper();

			if (isAbort) {
				this.logDebug(`Processing skipped by afterPrefetchData`);
			} else {
				await this.fetchDataWrapper(templateVarsMap);
				const resultTemplateVarsMap = await this.getPostProcessedVarsAfterFetchDataWrapper(templateVarsMap);
				const content = await this.getResponseByTemplateVars(resultTemplateVarsMap);

				await this.sendResponse({
					content,
					contentType: this.isResponseAsJson() ? ENerveContentType.JSON : ENerveContentType.TEXT_HTML,
				});
			}
		} catch (err) {
			this.errorLog('Failed processing page', err as Error);

			await this.sendResponse({
				status: ENerveHTTPStatus.INTERNAL_ERROR,
				content: '',
			});
		}
	}

	protected getClientConfig(): INerveClientConfig {
		const {
			main,
			api,
			js,
			css,
			static: staticHost,
		} = this.options.app.config.hosts;

		return {
			hosts: {
				main,
				api,
				js,
				css,
				static: staticHost,
			},
		};
	}

	protected isResponseAsJson() {
		return false;
	}

	async run() {
		if (this.app.config.isLocalServer) {
			try {
				await this.app.localesManager.init();
			} catch (err) {
				this.errorLog('Failed init locales manager', err as Error);
			}
			try {
				await this.app.staticManager.init();
			} catch (err) {
				this.errorLog('Failed init static manager', err as Error);
			}
		}

		await super.run();
	}

	protected async preFetchDataWrapper(templateVarsMap: INerveServerPageTemplateVarsMap) {
		const startFetchDataTimeStamp = Date.now();

		this.preFetchedData = await this.preFetchData(templateVarsMap);

		this.timings.preFetchData = Date.now() - startFetchDataTimeStamp;
		this.logDebug(`Fetch data: ${this.timings.preFetchData} ms`);
	}

	protected async preFetchData(templateVarsMap: INerveServerPageTemplateVarsMap) {
		if (this.includedTemplates.fetchData && !this.isSimpleIncludedTemplate(this.includedTemplates.fetchData.module)) {
			const { common, content } = templateVarsMap;
			const { preFetchData } = this.includedTemplates.fetchData.module;

			if (typeof preFetchData === 'function') {
				return preFetchData({ ...common, ...content });
			}
		}

		return {};
	}

	protected async fetchDataWrapper(templateVarsMap: INerveServerPageTemplateVarsMap) {
		const startFetchDataTimeStamp = Date.now();

		const fetchedData = await this.fetchData(templateVarsMap);

		this.fetchedData = mergeWith(
			{},
			this.preFetchedData as Record<string, unknown>,
			fetchedData as Record<string, unknown>,
			(a: unknown, b: unknown) => !b ? a : undefined,
		);

		this.timings.fetchData = Date.now() - startFetchDataTimeStamp;
		this.logDebug(`Fetch data: ${this.timings.fetchData} ms`);
	}

	protected async fetchData(templateVarsMap: INerveServerPageTemplateVarsMap) {
		if (this.includedTemplates.fetchData && !this.isSimpleIncludedTemplate(this.includedTemplates.fetchData.module)) {
			const { common, content } = templateVarsMap;
			const { fetchData } = this.includedTemplates.fetchData.module;

			if (typeof fetchData === 'function') {
				return fetchData({ ...common, ...content });
			}
		}

		return {};
	}

	protected async getTemplateVarsMap(): Promise<INerveServerPageTemplateVarsMap> {
		const startTimestamp = Date.now();

		const [
			common,
			head,
			footer,
			content,
		] = await Promise.all([
			(async () => {
				const startGetVarsTimeStamp = Date.now();
				const vars = await this.getCommonVars();

				this.timings.templateVars.common = Date.now() - startGetVarsTimeStamp;
				this.logDebug(`Get COMMON vars: ${this.timings.templateVars.common} ms`);

				return vars;
			})(),

			(async () => {
				const startGetVarsTimeStamp = Date.now();
				const vars = await this.getHeadVars();

				this.timings.templateVars.head = Date.now() - startGetVarsTimeStamp;
				this.logDebug(`Get HEAD vars: ${this.timings.templateVars.head} ms`);

				return vars;
			})(),

			(async () => {
				const startGetVarsTimeStamp = Date.now();
				const vars = await this.getFooterVars();

				this.timings.templateVars.footer = Date.now() - startGetVarsTimeStamp;
				this.logDebug(`Get FOOTER vars: ${this.timings.templateVars.footer} ms`);

				return vars;
			})(),

			(async () => {
				const startGetVarsTimeStamp = Date.now();
				const vars = await this.getContentVars();

				this.timings.templateVars.content = Date.now() - startGetVarsTimeStamp;
				this.logDebug(`Get CONTENT vars: ${this.timings.templateVars.content} ms`);

				return vars;
			})(),
		]);

		this.timings.templateVars.all = Date.now() - startTimestamp;
		this.logDebug(`Get all template vars: ${this.timings.templateVars.all} ms`);

		return {
			common,
			head,
			content,
			footer,
		};
	}

	protected async getResponseByTemplateVars(templateVarsMap: INerveServerPageTemplateVarsMap): Promise<string> {
		const startTimestamp = Date.now();
		const {
			common,
			head,
			content,
			footer,
		} = templateVarsMap;
		let result = '';

		if (this.isResponseAsJson()) {
			result = JSON.stringify({ ...common, ...content });
		} else {
			const [
				headHTML,
				footerHTML,
				contentHTML = '',
			] = await Promise.all([
				this.renderHead({ ...common, ...head }),
				this.renderFooter({ ...common, ...footer }),
				this.renderContent({ ...common, ...content }),
			]);

			result = headHTML + contentHTML + footerHTML;
		}

		this.processingResponseDuration = Date.now() - startTimestamp;

		return result;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async getCommonVars(): Promise<INerveCommonTemplateVars> {
		const staticVersion = this.options.app.staticManager.getCurrentVersion();

		return {
			staticVersion,
			locales: this.getLocalesVars() as unknown as Record<string, string>,
			req: {
				url: this.options.req.url,
				path: this.options.req.path,
				params: this.options.req.params,
				query: this.options.req.query,
				cookies: this.options.req.cookies,
			},
			clientConfig: this.getClientConfig(),
			isServerRendering: this.options.app.config.render.isServerEnabled,
			httpTransport: this.getHttpTransport(),
			activeUser: this.activeUser.data,
			fetchedData: this.fetchedData,
			logInfo: (message: string) => this.logInfo(message),
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async getHeadVars(): Promise<Omit<INerveHeadTemplateVars, keyof INerveCommonTemplateVars>> {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async getContentVars(): Promise<Omit<INerveContentTemplateVars, keyof INerveCommonTemplateVars>> {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async getFooterVars(): Promise<Omit<INerveFooterTemplateVars, keyof INerveCommonTemplateVars>> {
		return {};
	}

	async renderHead(vars: INerveCommonTemplateVars & INerveHeadTemplateVars) {
		let result = '';

		this.logDebug('Render head template');

		if (this.includedTemplates.head) {
			result = await this.renderTemplate('head', vars);
		} else {
			this.logDebug('Empty head template');
		}

		return result;
	}

	async renderContent(vars: INerveCommonTemplateVars & INerveContentTemplateVars) {
		let result = '';

		this.logDebug('Render content template');

		if (this.includedTemplates.content) {
			result = await this.renderTemplate('content', vars);
		} else {
			this.logDebug('Empty content template');
		}

		return result;
	}

	async renderFooter(vars: INerveCommonTemplateVars & INerveFooterTemplateVars) {
		let result = '';

		this.logDebug('Render footer template');

		if (this.includedTemplates.footer) {
			result = await this.renderTemplate('footer', vars);
		} else {
			this.logDebug('Empty footer template');
		}

		return result;
	}

	async renderTemplate(tmplKey: Exclude<keyof INerveServerPageIncludedTemplatesMap, 'fetchData'>, vars: unknown): Promise<string> {
		const startTimestamp = Date.now();
		const tmpl = this.includedTemplates[tmplKey];
		let result = '';

		this.logDebug(`Start render template ${tmpl.path}`);

		if (this.isSimpleIncludedTemplate(tmpl.module)) {
			result = tmpl.module(vars);
		} else {
			const { html, extra } = await tmpl.module.render(vars);

			this.renderResultExtra = extra;
			result = html;
		}

		this.timings.renderTemplates[tmplKey] = Date.now() - startTimestamp;
		this.logDebug(`Finish render template "${tmplKey}" (${tmpl.path}) ${this.timings.renderTemplates[tmplKey]}ms`);

		return result;
	}

	getUaParserResult() {
		return this.uaParserResult;
	}

	getProcessingResponseDuration() {
		const { initActiveUser, fetchData } = this.timings;
		const fullTime = this.getFullProcessingTime();

		return Math.max(fullTime - initActiveUser - fetchData, 1);
	}

}
