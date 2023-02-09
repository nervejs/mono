/* eslint-disable
	@typescript-eslint/no-explicit-any,
	@typescript-eslint/no-unsafe-member-access,
	@typescript-eslint/no-unsafe-return,
	@typescript-eslint/no-unsafe-call
*/

import { snakeCase } from 'snake-case';

import { ENerveHTTPMethod } from '@enums';

export interface IActionOptions {
	url?: string;
	method?: ENerveHTTPMethod;
	isAbsoluteUrl?: boolean;
	request?: {
		path?: { [ key: string ]: { type: string } };
	};
}

export interface IAction {
	url?: string;
	method?: ENerveHTTPMethod;
	isAbsoluteUrl?: boolean;
	action: string;
}

const DEFAULT_METHOD_NAMES = [
	'index',
	'create',
	'view',
	'delete',
	'update',
];

export const Action = (options?: IActionOptions) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
		if (options?.request?.path) {
			const paramName = Object.keys(options?.request?.path)[0];

			target.constructor[`${propertyKey}PathParamName`] = paramName || 'id';
		}

		if (!DEFAULT_METHOD_NAMES.includes(propertyKey)) {
			if (!target.constructor.prototype.__customActions) {
				target.constructor.prototype.__customActions = [];
			}

			const action: IAction = {
				method: options?.method || ENerveHTTPMethod.GET,
				url: options?.url !== undefined ? options.url : snakeCase(propertyKey),
				isAbsoluteUrl: !!options?.isAbsoluteUrl,
				action: propertyKey,
			};

			target.constructor.prototype.__customActions.push(action);
			// [`${propertyKey}Url`] = options.url;
		}

		return descriptor;
	};
};
