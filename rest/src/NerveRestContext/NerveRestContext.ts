import { INerveRestValidationError } from 'interfaces';
import { TNerveRestParamPlacement } from 'types';
import { ValidationError } from 'yup';

import { ENerveHTTPStatus } from '@enums';

import { NerveNodeObject } from '@node/NerveNodeObject';
import { getDefaultLogPrefix } from '@node/utils';

import { CtxParamsType } from '../NerveRestContextParam';
import { NerveRestValidationError } from '../NerveRestValidationError';

import { INerveRestContext, INerveRestContextOptions } from './types';

export class NerveRestContext<T extends INerveRestContext> extends NerveNodeObject {

	protected options: INerveRestContextOptions;

	constructor(options: INerveRestContextOptions) {
		super();

		this.options = options;
	}

	protected getLogPrefix() {
		const routePath = this.options.req.route.path;
		const user = this.options.activeUser && this.options.activeUser.getUniqIdentifier();

		return `${getDefaultLogPrefix({ requestId: this.options.requestId })} [${routePath}] [${user}]`;
	}

	get params() {
		return this.options.data.params as T['params'];
	}

	get query() {
		return this.options.data.query as T['query'];
	}

	get body() {
		return this.options.data.body as T['body'];
	}

	get headers() {
		return this.options.data.headers as T['headers'];
	}

	protected async validateByPlacement(placement: Exclude<TNerveRestParamPlacement, 'custom'>): Promise<NerveRestValidationError[]> {
		if (!this.options.scheme[placement]) {
			return [];
		}

		const results = await Promise.all(
			Object.keys(this.options.scheme[placement])
				.map(async (paramName) => {
					return new Promise(async (resolve) => {
						const paramScheme = this.options.scheme[placement][paramName];

						if (paramScheme.validation?.yup) {
							try {
								await paramScheme.validation.yup.validate(this.options.data[placement][paramName]);
							} catch (err) {
								const error = err as ValidationError;

								resolve(
									new NerveRestValidationError({
										placement,
										paramName,
										type: error.type,
										errors: error.errors,
									}),
								);

								return;
							}
						}

						if (paramScheme.validation?.custom) {
							try {
								const error = await paramScheme.validation.custom(this.options.data[placement][paramName]);

								if (error) {
									resolve(
										new NerveRestValidationError({
											placement,
											paramName,
											type: error.type,
											errors: error.errors,
											status: error.status,
										}),
									);

									return;
								}
							} catch (err) {
								resolve(
									new NerveRestValidationError({
										placement: 'custom',
										type: 'uncaught_error',
										errors: [(err as Error).message],
										status: ENerveHTTPStatus.INTERNAL_ERROR,
									}),
								);

								return;
							}
						}

						resolve(null);
					});
				}),
		);

		return results.filter((item) => item != null) as NerveRestValidationError[];
	}

	protected async validateCustom() {
		if (!Array.isArray(this.options.scheme.customValidations)) {
			return [];
		}

		const results = await Promise.all(
			this.options.scheme.customValidations.map(async (validation) => {
				return new Promise(async (resolve) => {
					try {
						const error = await validation(this);

						if (error) {
							resolve(
								new NerveRestValidationError({
									placement: 'custom',
									type: error.type,
									errors: error.errors,
									status: error.status,
								}),
							);

							return;
						}
					} catch (err) {
						resolve(
							new NerveRestValidationError({
								placement: 'custom',
								type: 'uncaught_error',
								errors: [(err as Error).message],
								status: ENerveHTTPStatus.INTERNAL_ERROR,
							}),
						);

						return;
					}

					resolve(null);
				});
			}),
		);

		return results.filter((item) => item != null) as NerveRestValidationError[];
	}

	async validate() {
		const errors = (
			await Promise.all([
				this.validateByPlacement('params'),
				this.validateByPlacement('query'),
				this.validateByPlacement('body'),
				this.validateByPlacement('headers'),
				this.validateCustom(),
			])
		).flat();

		if (errors.length > 0) {
			this.logInfo(`Validation errors: ${JSON.stringify(errors.map((item) => item.message), null, 4)}`);

			throw errors;
		}

		return true;
	}

}

export type CtxType<T extends INerveRestContextOptions['scheme']> = {
	params?: CtxParamsType<T['params']>;
	query?: CtxParamsType<T['query']>;
	body?: CtxParamsType<T['body']>;
	headers?: CtxParamsType<T['headers']>;
}

export const addCtxValidation = (scheme: INerveRestContextOptions['scheme'], validation: (ctx?: NerveRestContext<unknown>) => Promise<INerveRestValidationError>) => {
	if (!Array.isArray(scheme.customValidations)) {
		scheme.customValidations = [];
	}

	scheme.customValidations.push(validation);
};
