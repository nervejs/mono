import * as path from 'path';
// eslint-disable-next-line import/named
import { IResult as IUAParserResult, UAParser } from 'ua-parser-js';
import { v4 as uuid } from 'uuid';

import { ENerveContentType, ENerveHTTPStatus, ENerveLocale } from '@enums';

import { getDefaultLogPrefix } from '@utils';

import { Logger } from '@decorators';

import { NerveHttpTransport } from '../NerveHttpTransport';
import { NerveServerActiveUser } from '../NerveServerActiveUser';
import { NerveServerApp } from '../NerveServerApp';
import { NerveServerObject } from '../NerveServerObject';

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
export class NerveServerPage extends NerveServerObject {

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
	protected httpStatus: ENerveHTTPStatus = null;
	protected fetchedData: unknown = {};
	protected activeUser: NerveServerActiveUser;
	protected requestId = uuid();

	protected uaParserResult: IUAParserResult = null;

	protected processingResponseDuration = 1;

	protected timings: INerveServerPageTimings = {
		start: 0,
		end: 0,
		duration: 0,
		initActiveUser: 0,
		beforeProcessing: 0,
		processing: 0,
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
		sendResponse: 0,
	};

	protected renderResultExtra: unknown = null;

	protected onResponseFinishHandler: () => void;

	constructor(options: INerveServerPageOptions) {
		super();

		this.timings.start = Date.now();

		this.options = options;
		this.app = options.app;

		this.parseUserAgent();

		this.onResponseFinishHandler = () => this.onResponseFinish();
		this.options.res.on('finish', this.onResponseFinishHandler);
	}

	protected async initActiveUserWrapper() {
		const startInitActiveUserTimestamp = Date.now();

		await this.initActiveUser();

		this.timings.initActiveUser = Date.now() - startInitActiveUserTimestamp;
		this.logDebug(`Init active user: ${this.timings.initActiveUser}ms`);
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

	protected setHeaders(headers: Record<string, string>) {
		Object.entries(headers).forEach(
			([key, value]) => this.options.res.header(key, value),
		);
	}

	protected setHttpStatus(status: ENerveHTTPStatus) {
		this.options.res.status(status);
		this.httpStatus = status;
	}

	protected getLogPrefix() {
		const routePath = this.options.req.route.path;
		const user = this.activeUser && this.activeUser.getUniqIdentifier();

		return `${getDefaultLogPrefix({ requestId: this.requestId })} [${routePath}] [${user}]`;
	}

	protected parseUserAgent() {
		const parser = new UAParser(this.getUserAgent());

		this.uaParserResult = parser.getResult();
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async sendResponse(params: INerveServerPageSendResponseParams) {
		const startTimeStamp = Date.now();
		const {
			content,
			contentType,
			status,
		} = params;

		this.setHttpStatus(status || ENerveHTTPStatus.OK);
		this.setHeaders({
			'Content-Type': contentType || ENerveContentType.TEXT_HTML,
		});
		this.options.res.send(content);

		this.timings.sendResponse = Date.now() - startTimeStamp;
		this.logDebug(`Send Response ${this.timings.sendResponse}ms`);
	}

	protected redirect(location: string, status?: ENerveHTTPStatus) {
		this.setHttpStatus(status || ENerveHTTPStatus.FOUND);
		this.setHeaders({ location });

		this.options.res.send('');
	}

	protected getLocalesVars() {
		return this.options.app.localesManager.getLocales(this.getCurrentLocale());
	}

	protected getCurrentLocale(): ENerveLocale {
		return ENerveLocale.EN_US;
	}

	protected async beforeProcessingWrapper() {
		const startBeforeProcessingTimestamp = Date.now();

		const result = await this.beforeProcessing();

		this.timings.beforeProcessing = Date.now() - startBeforeProcessingTimestamp;
		this.logDebug(`Before processing (isAbort=${String(result.isAbort)}): ${this.timings.beforeProcessing}ms`);

		return result;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async beforeProcessing(): Promise<INerveServerPageBeforeProcessingResult> {
		return { isAbort: false };
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

	protected async processingWrapper() {
		const startProcessingTimestamp = Date.now();

		await this.processing();

		this.timings.processing = Date.now() - startProcessingTimestamp;
		this.logDebug(`Processing ${this.timings.processing}ms`);
	}

	protected async processing() {
		try {
			const templateVarsMap = await this.getTemplateVarsMap();

			this.prepareTemplates();
			await this.fetchDataWrapper(templateVarsMap);
			const resultTemplateVarsMap = await this.getPostProcessedVarsAfterFetchDataWrapper(templateVarsMap);
			const content = await this.getResponse(resultTemplateVarsMap);

			await this.sendResponse({
				content,
				contentType: this.isResponseAsJson() ? ENerveContentType.JSON : ENerveContentType.TEXT_HTML,
			});
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

	protected onResponseFinish() {
		this.timings.end = Date.now();
		this.timings.duration = this.timings.end - this.timings.start;

		this.options.res.off('finish', this.onResponseFinishHandler);

		this.logInfo(`Finish response [status=${this.options.res.statusCode}]`);
	}

	async run() {
		try {
			if (this.app.config.isLocalServer) {
				await this.app.localesManager.init();
				await this.app.staticManager.init();
			}

			await this.initActiveUserWrapper();

			const { isAbort } = await this.beforeProcessingWrapper();

			if (isAbort) {
				this.logDebug(`Processing skipped`);
			} else {
				await this.processingWrapper();
			}
		} catch (err) {
			this.errorLog('Failed processing page', err as Error);

			await this.sendResponse({
				status: ENerveHTTPStatus.INTERNAL_ERROR,
				content: '',
			});
		}
	}

	protected async fetchDataWrapper(templateVarsMap: INerveServerPageTemplateVarsMap) {
		const startFetchDataTimeStamp = Date.now();

		this.fetchedData = await this.fetchData(templateVarsMap);

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

	protected async getResponse(templateVarsMap: INerveServerPageTemplateVarsMap): Promise<string> {
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
			locales: this.getLocalesVars(),
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

	getRequestUrl(): string {
		return this.options.req.url;
	}

	getUserAgent() {
		return this.options.req.headers['user-agent'] || '';
	}

	getUaParserResult() {
		return this.uaParserResult;
	}

	getReq() {
		return this.options.req;
	}

	getRes() {
		return this.options.res;
	}

	getFullProcessingTime() {
		const { start, end } = this.timings;

		return end - start;
	}

	getProcessingResponseDuration() {
		const { initActiveUser, fetchData } = this.timings;
		const fullTime = this.getFullProcessingTime();

		return fullTime - initActiveUser - fetchData;
	}

}
