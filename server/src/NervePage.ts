import * as url from 'url';
import * as path from 'path';

import { NerveDebug } from './utils/NerveDebug';
import { INerveModuleOptions, NerveModule } from './NerveModule';
import { NerveApp } from './NerveApp';
import { NerveActiveUser } from './NerveActiveUser';
import { NerveApi } from './NerveApi'

import { NerveHelpers } from './utils/NerveHelpers';

import { INerveRequest, INerveResponse } from './interfaces';

export interface INervePageTemplateVars {

}

export interface INervePageOptions extends INerveModuleOptions {
	isNeedActiveUser: boolean;
	isShowErrorPage: boolean;
	isForceShowErrorPage: boolean;
	type: string;
	name: string;

	request: INerveRequest;
	response: INerveResponse;
}

export class NervePage extends NerveModule {

	protected options: INervePageOptions;

	protected frontEndDir: string;
	protected httpStatus: number;

	protected baseTmplPath: string = '';
	protected pagesTmplPath: string = '';

	protected templateHead: string = '';
	protected template: string = '';
	protected templateFooter: string = '';

	protected templateError404: string = '';
	protected templateError403: string = '';
	protected templateError500: string = '';

	protected tmplHead: Function;
	protected tmplFooter: Function;
	protected tmpl: Function;

	protected tmplError403: Function;
	protected tmplError404: Function;
	protected tmplError500: Function;

	protected startTime: number;
	protected startProcessingTime: number;
	protected processingTime: number;
	protected fullTime: number;

	protected Api: typeof NerveApi;
	protected api: NerveApi;

	protected activeUser: NerveActiveUser;

	protected storeState: any = {};

	protected isFirstContentRender = false;

	constructor(app: NerveApp, options?: INervePageOptions) {
		super(app, options);

		this.init();

		let templateHeadPath: string,
			templateFooterPath: string,
			templatePath: string;

		try {
			this.options = {
				isNeedActiveUser: true,
				isShowErrorPage: true,
				isForceShowErrorPage: false,
				type: null,
				name: null,

				...options,
			};

			this.startTime = Date.now();
			this.time('FULL PAGE TIME');
			this.log(`${this.getRequestMethod()} ${this.getLogUrl()}`);

			const templatesDir = this.getTemplatesDir();

			if (!templatesDir) {
				this.errorLog('TEMPLATES DIR IS EMPTY, SET TEMPLATES DIR TO APP CONFIG (paths.templates)');
			}

			if (this.templateHead) {
				templateHeadPath = path.resolve(templatesDir, this.baseTmplPath, this.templateHead);
				this.tmplHead = this.getTemplate(templateHeadPath);
			}

			if (this.templateFooter) {
				templateFooterPath = path.resolve(templatesDir, this.baseTmplPath, this.templateFooter);
				this.tmplFooter = this.getTemplate(templateFooterPath);
			}

			if (this.template) {
				templatePath = path.resolve(templatesDir, this.pagesTmplPath, this.template);
				this.tmpl = this.getTemplate(templatePath);
			}

			[403, 404, 500].forEach((errorCode: number) => {
				const errorTemplatePath = this.getErrorTemplatePath(errorCode);

				switch (errorCode) {
					case 403:
						if (errorTemplatePath) {
							this.tmplError403 = this.getTemplate(errorTemplatePath);
						}
						break;
					case 404:
						if (errorTemplatePath) {
							this.tmplError404 = this.getTemplate(errorTemplatePath);
						}
						break;
					case 500:
						if (errorTemplatePath) {
							this.tmplError500 = this.getTemplate(errorTemplatePath);
						}
						break;
				}
			});

			this.initActiveUser();

			this.time('GET API RESPONSE');

			if (this.Api) {
				this.api = new this.Api(this, {
					request: this.options.request,
					response: this.options.response
				});
				this.api.setActiveUser(this.activeUser);
			} else {
				this.debug('API IS EMPTY');
			}

			this.getResponsePromises()
				.then((response: any) => {
					this.startProcessingTime = Date.now();
					this.timeEnd('GET API RESPONSE');
					this.time('PAGE PROCESSING');
					this.time('GET LOCALES');

					this.getLocalesVars()
						.then((localesVars: any) => {
							this.timeEnd('GET LOCALES');
							this.time('TEMPLATE VARS');
							this.getTemplateVars()
								.then((vars: any) => {
									this.timeEnd('TEMPLATE VARS');

									this.sendResponse({
										activeUser: this.activeUser.toJSON(),
										...response,
										...localesVars,
										...vars,
									});
								})
								.catch((err: Error) => this.errorHandler(err));
						})
						.catch((err: Error) => this.errorHandler(err));
				})
				.catch((err: Error) => this.errorHandler(err));
		} catch (err) {
			this.errorHandler(err);
		}
	}

	protected init(): void {
		return void (0);
	}

	protected getErrorTemplatePath(errorCode: number): string {
		const templatesDir = this.getTemplatesDir();
		let templateError;

		switch (errorCode) {
			case 403:
				templateError = this.templateError403;
				break;
			case 404:
				templateError = this.templateError404;
				break;
			case 500:
				templateError = this.templateError500;
				break;
		}

		return templateError
			? path.resolve(templatesDir, this.baseTmplPath, templateError)
			: null;
	}

	protected getErrorTmpl(errorCode: number) {
		switch (errorCode) {
			case 403:
				return this.tmplError403;
			case 404:
				return this.tmplError404;
			case 500:
				return this.tmplError500;
		}
	}

	getTemplate(templatePath: string): Function {
		let tmpl: Function;

		if (this.app.config.isClearTemplateCache && require.cache) {
			delete require.cache[require.resolve(templatePath)];
		}
		tmpl = require(templatePath);

		return tmpl;
	}

	initActiveUser() {
		this.activeUser = new NerveActiveUser(this.app, {
			request: this.options.request,
			response: this.options.response
		});
	}

	getName(): string {
		return null;
	}

	getTemplatesDir(): string {
		return this.app.config.paths.templates;
	}

	getType(): string {
		return this.options.type;
	}

	getTitle(): string {
		return 'NerveJS Application';
	}

	getScheme(): string {
		return this.options.request.protocol;
	}

	getRequestParam(paramName: string): string {
		return this.options.request.params[paramName];
	}

	getStaticHost(): string {
		return `//${this.app.config.hosts.static}`;
	}

	getJsHost(): string {
		return `//${this.app.config.hosts.js}`;
	}

	getCssHost(): string {
		return `//${this.app.config.hosts.css}`;
	}

	getStaticVersions() {
		const isTestServer = this.app.config.isTestServer;
		const templatesDir = this.getTemplatesDir();

		return {
			js: isTestServer ? this.app.parseJSVersions(path.resolve(templatesDir, this.app.config.paths.versions.js)) : this.app.getJsVersions(),
			css: isTestServer ? this.app.parseCSSVersions(path.resolve(templatesDir,this.app.config.paths.versions.css)) : this.app.getCssVersions(),
		};
	}

	getCssUrl(cssName: string): string {
		const versions = this.getStaticVersions();
		const version = versions && versions.css && versions.css[name];

		return version ? `${url.resolve(this.getCssHost(), version)}?v=${this.app.config.staticCacheVersion}` : null;
	}

	getJsUrl(jsName: string): string {
		const versions = this.getStaticVersions();
		const version = versions && versions.js && versions.js[name];

		return version ? `${url.resolve(this.getJsHost(), version)}?v=${this.app.config.staticCacheVersion}` : null;
	}

	getCss(): { url: string }[] {
		return [];
	}

	getJs(): { url: string }[] {
		return [];
	}

	getResponsePromises(): Promise<any> {
		return new Promise((resolve, reject) => {
			new Promise((userResolve: () => void, userReject: () => void) => {
				if (this.options.isNeedActiveUser) {
					this.activeUser.request()
						.then(userResolve)
						.catch(userReject);
				} else {
					userResolve();
				}
			})
				.then(() => {
					let resultBeforeFilter: any = this.beforeFilter() || {};

					if (resultBeforeFilter instanceof Promise) {
						resultBeforeFilter
							.then((result: any) => {
								if (!result.isAbort) {
									this.fetchApi()
										.then(resolve)
										.catch(reject);
								}
							})
							.catch(reject);
					} else {
						if (!resultBeforeFilter.isAbort) {
							this.fetchApi()
								.then(resolve)
								.catch(reject);
						}
					}
				})
				.catch(reject);
		});
	}

	getTemplateVars(): Promise<INervePageTemplateVars> {
		return new Promise((resolve: Function, reject: () => void) => {
			this.getLocalesVars()
				.then(() => {
					resolve({
						request: {
							url: this.getRequestUrl(),
							path: this.options.request.path,
							get: this.options.request.query,
							params: this.options.request.params,
							query: this.options.request.query,
						},
						css: this.getCss(),
						js: this.getJs(),
						hosts: {
							static: this.getStaticHost(),
							staticJs: this.getJsHost(),
							staticCss: this.getCssHost()
						},
						pageTitle: this.getTitle(),
						routes: this.app.getPublicRoutes()
					});
				})
				.catch(reject);
		});
	}

	async getTemplateHeadVars() {
		return {};
	}

	async getTemplateFooterVars() {
		return {};
	}

	getErrorTemplateVars() {
		return NervePage.prototype.getTemplateVars.call(this);
	}

	getLogPrefix() {
		const date = (new Date()).toString();
		const pageName = this.getName();
		const user = this.activeUser && this.activeUser.getLogId() ? this.activeUser.getLogId() : 'unauthorized';

		return `${date}: ${pageName}: ${user}`;
	}

	getRequestId(): string {
		return this.options.request && this.options.request.id ? this.options.request.id : null;
	}

	getRequestMethod(): string {
		return this.options.request && this.options.request.method ? this.options.request.method : null;
	}

	getRequestUrl(): string {
		return this.options.request && this.options.request.url ? this.options.request.url : null;
	}

	getLogUrl(): string {
		return this.getRequestUrl();
	}

	fetchApi(): Promise<any> {
		return new Promise((resolve: () => void, reject: () => void) => {
			if (this.api) {
				this.api.fetch()
					.then(resolve)
					.catch(reject);
			} else {
				resolve();
			}
		});
	}

	beforeFilter(): any {
		return null;
	}

	errorLog(message: string) {
		NerveDebug.error(`${this.getLogPrefix()}: ${message}`);
	}

	log(message: string) {
		NerveDebug.log(`${this.getLogPrefix()}: ${message}`);
	}

	debug(message: string) {
		NerveDebug.debug(`${this.getLogPrefix()}: ${message}`);
	}

	time(message: string) {
		NerveDebug.time(this.getRequestId() + message);
	}

	timeEnd(message: string) {
		NerveDebug.timeEnd(this.getRequestId() + message, `${this.getLogPrefix()}: ${message}`);
	}

	async renderTemplate(template: Function & { default?: () => Function }, vars: any, templateId: string): Promise<string> {
		let html = '';

		if (template) {
			this.time(`RENDER ${templateId}`);

			if (template.default) {
				template = template.default;
			}

			const result = template(vars);

			if (typeof (result) === 'string') {
				html = result;
			} else if (result.then) {
				const renderResult = await result;

				html = renderResult.html;
				this.storeState = renderResult.store;
			} else {
				this.debug('Template type unknown - returning empty string');
			}

			this.timeEnd(`RENDER ${templateId}`);
		} else {
			this.debug(`EMPTY ${templateId} TEMPLATE`);
		}

		return html;
	}

	async getHtml(vars: any, contentTmpl?: Function): Promise<any> {
		this.time('RENDER');
		let head, content, footer;

		if (this.isFirstContentRender) {
			content = await this.renderTemplate(NerveHelpers.isFunction(contentTmpl) ? contentTmpl : this.tmpl, vars, 'CONTENT');

			const headVars = await this.getTemplateHeadVars();
			const footerVars = await this.getTemplateFooterVars();

			[head, footer] = await Promise.all([
				this.renderTemplate(this.tmplHead, { ...vars, ...headVars }, 'HEAD'),
				this.renderTemplate(this.tmplFooter, { ...vars, ...footerVars }, 'FOOTER'),
			]);
		} else {
			[head, content, footer] = await Promise.all([
				this.renderTemplate(this.tmplHead, vars, 'HEAD'),
				this.renderTemplate(NerveHelpers.isFunction(contentTmpl) ? contentTmpl : this.tmpl, vars, 'CONTENT'),
				this.renderTemplate(this.tmplFooter, vars, 'FOOTER'),
			]);
		}

		this.timeEnd('RENDER');
		return head + content + footer;
	}

	getUserAgent(): string {
		return this.options.request && NerveHelpers.isFunction(this.options.request.get) ? this.options.request.get('User-Agent') || '' : '';
	}

	getReferrer(): string {
		return this.options.request.headers.referer;
	}

	getContentType(): string {
		return this.isJsonAccept() ? 'application/json' : 'text/html';
	}

	errorHandler(err: any) {
		let statusCode = err && err.statusCode || 500;

		if (err && err.name && err.name === 'UpstreamResponseError') {
			this.api.getRequests().forEach((request) => {
				if (request.getStatusCode() !== '200') {
					statusCode = request.getStatusCode();
					this.errorLog(`${err.name} ${request.getStatusCode()} ${request.getUpstream()} (${request.getHostname()}:${request.getPort()}) ${request.getMethod()} ${request.getPath()}`);
				}
			});
		} else {
			this.errorLog(`${__filename} : ${err && err.stack ? err + err.stack : err}`);
		}

		this.options.response.status(statusCode);
		this.httpStatus = statusCode;

		if (this.isJsonAccept()) {
			this.getLocalesVars()
				.then((localesVars) => {
					this.getErrorTemplateVars()
						.then((vars: any) => {
							this.send(
								JSON.stringify({
									...vars,
									...localesVars,
									activeUser: this.activeUser.toJSON(),
									statusCode: statusCode,
								}),
								null,
								200
							);
						})
						.catch((err: Error) => {
							this.errorLog(err.toString());
							this.send('');
						});
				})
				.catch((err) => {
					this.errorLog(err);
					this.send('');
				});
		} else {
			if (this.app.config.isTestServer && !this.isForceShowErrorPage()) {
				this.send(err + '<br/>' + err ? err.stack.replace(/\n/g, '<br/>') : '', 'text/html');
			} else {
				if (this.isShowErrorPage()) {
					this.renderErrorPage(statusCode);
				} else {
					this.send('');
				}
			}
		}

		this.errorLog(`Error ${this.httpStatus} ${this.getRequestMethod()} ${this.getLogUrl()}`);

		return this;
	}

	isShowErrorPage(): boolean {
		return !!this.options.isShowErrorPage;
	}

	isForceShowErrorPage() {
		return !!this.options.isForceShowErrorPage;
	}

	isJsonAccept(): boolean {
		return this.options.request.headers && this.options.request.headers.accept && this.options.request.headers.accept.indexOf('application/json') !== -1;
	}

	renderErrorPage(status: number) {
		const errorTmpl = this.getErrorTmpl(status);

		if (errorTmpl) {
			this.getLocalesVars()
				.then((localesVars: any) => {
					this.getErrorTemplateVars()
						.then(async (vars: any) => {
							try {
								const html = await this.getHtml(
									{
										...vars,
										...localesVars,
										activeUser: this.activeUser.toJSON(),
										statusCode: status,
									},
									errorTmpl,
								);

								this.send(html)
							} catch (err) {
								NerveDebug.error(`Failed render error page: `, err);

								this.send('')
							}
						})
						.catch((err: Error) => {
							this.errorLog(`${err.toString()} ${err.stack}`);
							this.send('');
						});
				})
				.catch((err: Error) => {
					this.errorLog(err.toString());
					this.send('');
				});
		} else {
			NerveDebug.error(`Error template for status code ${status} is not defined`);

			this.send('');
		}
	}

	redirect(location: string, status: number) {
		if (this.isJsonAccept()) {
			this.httpStatus = 200;

			this.send(JSON.stringify({
				isRedirect: true,
				location: location
			}));
		} else {
			this.httpStatus = status || 301;

			this.options.response.header({
				location: location
			});

			this.send();
		}
	}

	rewrite(url: string) {
		this.app.getRouter().go(url, this.options.request, this.options.response);
	}

	sendResponse(vars: any) {
		if (this.isJsonAccept()) {
			this.send(JSON.stringify(vars));
		} else {
			this.getHtml(vars)
				.then((html: string) => this.send(html))
				.catch((err: Error) => this.errorHandler(err));
		}
	}

	send(content?: string, contentType?: string, status?: number) {
		content = String(content || '');

		this.options.response.status(status || this.httpStatus || 200);

		this.options.response.header({
			'Cache-Control': 'no-cache, no-store',
			'Content-type': (contentType || this.getContentType()) + '; charset=utf-8'
		});

		this.timeEnd('PAGE PROCESSING');
		this.timeEnd('FULL PAGE TIME');

		this.processingTime = Date.now() - this.startProcessingTime;
		this.fullTime = Date.now() - this.startTime;

		this.options.response.send(content);

		this.emit('send', {
			text: content,
			status: this.httpStatus || 200
		});
	}

}
