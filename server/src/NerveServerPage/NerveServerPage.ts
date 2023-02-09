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
	INerveTemplateRenderResult,
} from '@interfaces';

import {
	INerveServerPageBeforeProcessingResult,
	INerveServerPageOptions,
	INerveServerPageSendResponseParams,
	INerveServerPageTemplateConfig,
	INerveServerPageTemplatesConfigMap,
} from './types';

@Logger({ prefix: 'Page' })
export class NerveServerPage extends NerveServerObject {

	protected options: INerveServerPageOptions;

	protected app: NerveServerApp;
	protected templates: INerveServerPageTemplatesConfigMap = {
		head: null,
		content: null,
		footer: null,
	};
	protected httpStatus: ENerveHTTPStatus = null;
	protected fetchedData: unknown = {};
	protected activeUser: NerveServerActiveUser;
	protected requestId = uuid();

	protected uaParserResult: IUAParserResult = null;

	protected processingResponseDuration = 1;

	protected onResponseFinishHandler: () => void;

	constructor(options: INerveServerPageOptions) {
		super();

		this.options = options;
		this.app = options.app;

		this.parseUserAgent();

		this.onResponseFinishHandler = () => this.onResponseFinish();
		this.options.res.on('finish', this.onResponseFinishHandler);
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

	// eslint-disable-next-line @typescript-eslint/require-await
	protected async beforeProcessing(): Promise<INerveServerPageBeforeProcessingResult> {
		return { isAbort: false };
	}

	protected async processing() {
		try {
			this.fetchedData = await this.fetchData();

			const content = await this.getResponse();

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
		this.options.res.off('finish', this.onResponseFinishHandler);

		this.logInfo(`Finish response [status=${this.options.res.statusCode}]`);
	}

	async run() {
		const startInitActiveUserTimestamp = Date.now();

		await this.initActiveUser();
		this.logDebug(`Init active user: ${Date.now() - startInitActiveUserTimestamp}ms`);

		const startBeforeProcessingTimestamp = Date.now();
		const { isAbort } = await this.beforeProcessing();

		this.logDebug(`Before processing (isAbort=${String(isAbort)}): ${Date.now() - startBeforeProcessingTimestamp}ms`);

		if (isAbort) {
			this.logDebug(`Processing skipped`);
		} else {
			const startProcessingTimestamp = Date.now();

			try {
				await this.processing();
				this.logDebug(`Processing ${Date.now() - startProcessingTimestamp}ms`);
			} catch (err) {
				this.errorLog('Failed processing page', err as Error);

				await this.sendResponse({
					status: ENerveHTTPStatus.INTERNAL_ERROR,
					content: '',
				});
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async fetchData(): Promise<unknown> {
		return {};
	}

	async getResponse() {
		const startTimestamp = Date.now();

		const [
			commonVars,
			headVars,
			footerVars,
			contentVars,
		] = await Promise.all([
			(async () => {
				const startGetVarsTimeStamp = Date.now();
				const vars = await this.getCommonVars();

				this.logDebug(`Get COMMON vars: ${Date.now() - startGetVarsTimeStamp} ms`);

				return vars;
			})(),

			(async () => {
				const startGetVarsTimeStamp = Date.now();
				const vars = await this.getHeadVars();

				this.logDebug(`Get HEAD vars: ${Date.now() - startGetVarsTimeStamp} ms`);

				return vars;
			})(),

			(async () => {
				const startGetVarsTimeStamp = Date.now();
				const vars = await this.getFooterVars();

				this.logDebug(`Get FOOTER vars: ${Date.now() - startGetVarsTimeStamp} ms`);

				return vars;
			})(),

			(async () => {
				const startGetVarsTimeStamp = Date.now();
				const vars = await this.getContentVars();

				this.logDebug(`Get CONTENT vars: ${Date.now() - startGetVarsTimeStamp} ms`);

				return vars;
			})(),
		]);

		this.logDebug(`Get all template vars: ${Date.now() - startTimestamp} ms`);

		let result = '';

		if (this.isResponseAsJson()) {
			result = JSON.stringify({ ...commonVars, ...contentVars });
		} else {
			const [
				headHTML,
				footerHTML,
				contentHTML = '',
			] = await Promise.all([
				this.renderHead({ ...commonVars, ...headVars }),
				this.renderFooter({ ...commonVars, ...footerVars }),
				this.renderContent({ ...commonVars, ...contentVars }),
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
		const startTimestamp = Date.now();
		let result = '';

		if (this.templates.head) {
			result = await this.renderTemplate(this.templates.head, vars);
		} else {
			this.logDebug('Empty head template');
		}

		this.logDebug(`Render head time: ${Date.now() - startTimestamp}ms`);

		return result;
	}

	async renderContent(vars: INerveCommonTemplateVars & INerveContentTemplateVars) {
		const startTimestamp = Date.now();
		let result = '';

		if (this.templates.content) {
			result = await this.renderTemplate(this.templates.content, vars);
		} else {
			this.logDebug('Empty content template');
		}

		this.logDebug(`Render content time: ${Date.now() - startTimestamp}ms`);

		return result;
	}

	async renderFooter(vars: INerveCommonTemplateVars & INerveFooterTemplateVars) {
		const startTimestamp = Date.now();
		let result = '';

		if (this.templates.footer) {
			result = await this.renderTemplate(this.templates.footer, vars);
		} else {
			this.logDebug('Empty footer template');
		}

		this.logDebug(`Render footer time: ${Date.now() - startTimestamp}ms`);

		return result;
	}

	async renderTemplate(tmpl: INerveServerPageTemplateConfig, vars: unknown) {
		const startTimestamp = Date.now();
		const templatesDir = this.options.app.getTemplatesDir();
		const templatePath = path.resolve(templatesDir, tmpl.path);
		let result = '';

		this.logDebug(`Start render template ${templatePath}`);

		if (!this.options.app.config.render.isCacheEnabled) {
			delete require.cache[require.resolve(templatePath)];
		}

		if (tmpl.isSimple) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const templateFn = require(templatePath) as (vars: unknown) => string;

			result = templateFn(vars);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { render: templateFn } = require(templatePath) as { render: (vars: unknown) => Promise<INerveTemplateRenderResult> };

			const { html } = await templateFn(vars);

			result = html;
		}

		this.logDebug(`Finish render template ${templatePath} ${Date.now() - startTimestamp}ms`);

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

	getProcessingResponseDuration() {
		return this.processingResponseDuration;
	}

}
