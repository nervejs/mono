import * as merge from 'deepmerge';

import { NerveObject } from './NerveObject';
import { NerveApp } from './NerveApp';
import { NerveHelpers } from './utils/NerveHelpers';
import { NerveDebug } from './utils/NerveDebug';

import { ELocale } from './enums/ELocale';

import { INerveRequest, INerveResponse } from './interfaces';

export interface INerveActiveUserOptions {
	fields?: { [key: string]: boolean };

	request: INerveRequest;
	response: INerveResponse;
}

export interface INerveActiveUserAttrs {
	id: string | number;
	isAuthorized?: boolean;
	locale: ELocale;
}

export class NerveActiveUser extends NerveObject {

	protected options: INerveActiveUserOptions;
	protected app: NerveApp;
	protected isFetchedState: boolean = false;
	protected attrs: INerveActiveUserAttrs = {
		id: null,
		isAuthorized: false,
		locale: ELocale.EN,
	};

	constructor(app: NerveApp, options: INerveActiveUserOptions) {
		super();

		this.app = app;
		this.options = {
			fields: {},
			...options
		};
	}

	protected getRequestPromises(): Promise<INerveActiveUserAttrs>[] {
		// tslint:disable-next-line: no-any
		return Object.keys(this.options.fields)
			.filter(field => this.options.fields[field] && NerveHelpers.isFunction((<any> this)[field]))
			.map(field => (<any> this)[field]());
	}

	async request(): Promise<void> {
		const promises = this.getRequestPromises();

		try {
			const responses = await Promise.all(this.getRequestPromises());

			responses.forEach(response => {
				if (response) {
					this.attrs = merge(this.attrs, response);
				}
			});

			this.emit('fetched');
		} catch (err) {
			NerveDebug.error(`Failed ActiveUser request: ${err}`);
		}
	}

	toJSON(): INerveActiveUserAttrs {
		return this.attrs;
	}

	isAuthorized(): boolean {
		return !!this.attrs.isAuthorized;
	}

	getLocale(): ELocale {
		return this.attrs.locale;
	}

	getLogId(): string {
		return String(this.attrs.id);
	}

	fetched(callback: () => void) {
		if (this.isFetchedState) {
			callback();
		} else {
			this.on('fetched', callback);
		}
	}

}
