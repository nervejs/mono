import * as url from 'url';
import * as request from 'request';
import * as merge from 'deepmerge';

import { NerveApp } from './NerveApp';
import { NerveModule } from './NerveModule';
import { NervePage } from './NervePage';
import { NerveHelpers } from './utils/NerveHelpers';

export class NerveApi extends NerveModule {

	protected app: NerveApp;
	protected page: NervePage;
	protected response: any = null;
	protected requests: any[] = [];
	protected responses: any[] = [];

	constructor(page: NervePage, options: any) {
		super(page.getApp(), options);

		this.page = page;
		this.app = page.getApp();
		this.options = options;
	}

	getDataSources(): any[] {
		return [];
	}

	getAllDataSources(): any[] {
		let parent: any = Object.getPrototypeOf(this.constructor).prototype,
			dataSources;

		if (parent && NerveHelpers.isFunction(parent.getAllDataSources)) {
			dataSources = parent.getAllDataSources().concat(this.getDataSources());
		} else {
			dataSources = this.getDataSources();
		}

		return dataSources;
	}

	fetch(): Promise<any> {
		return new Promise((resolve: Function, reject: Function) => {
			let promises = this.getAllDataSources().map((item) => {
				let result: Promise<any>;

				if (!NerveHelpers.isFunction(item.isEnable) || item.isEnable.call(this)) {
					result = this.request(item);
				} else {
					result = Promise.resolve({
						response: {}
					});
				}

				return result;
			});

			promises.push(this.getLocalesVars());

			Promise.all(promises)
				.then((responses: any[]) => {
					let result: any;

					this.responses = responses.map((item: any) => {
						this.requests.push(item.request);

						return item.response;
					});

					try {
						result = this.adapter(this.responses);

						if (result instanceof Promise) {
							result
								.then((adapted: any) => {
									this.response = adapted;
									resolve(this.response);
								})
								.catch((err: Error) => {
									reject({
										error: err
									});
								});
						} else {
							this.response = result;
							resolve(this.response);
						}
					} catch (err) {
						reject({
							error: err
						});
					}
				})
				.catch((result: any) => {
					this.requests.push(result.request);
					reject(result.error);
				});
		});
	}

	request(options: any): Promise<any> {
		return new Promise((resolve) => {
			request({
				url: url.resolve(this.app.config.hosts.api, options.url)
			}, function (error, response, body) {
				resolve(JSON.parse(body));
			});
		});
	}

	adapter(responses: any[]): any {
		let result = {};

		if (Array.isArray(responses)) {
			responses.forEach(item =>  result = merge(result, item));
		}

		return result;
	}

	getResponse() {
		return this.response || {};
	}

	getRequests() {
		return this.requests;
	}

	getPage() {
		return this.page;
	}

	static getResponseItemByIndex(api: NerveApi, index: number) {
		let allDataSources = this.prototype.getAllDataSources() || [],
			selfDataSources = this.prototype.getDataSources() || [];

		return api.responses ? (api.responses[allDataSources.length - selfDataSources.length + index] || {}) : {};
	}

}