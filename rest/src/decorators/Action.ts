import { ENerveRestHTTPMethod } from '../enums';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const toSnakeCase = require('to-snake-case');

export interface IActionOptions {
	url?: string;
	method?: ENerveRestHTTPMethod;
	isAbsoluteUrl?: boolean;
	request?: {
		path?: { [ key: string ]: { type: string } };
	};
}

const DEFAULT_METHOD_NAMES = [
	'index',
	'create',
	'view',
	'delete',
	'update',
];

export const Action = <T extends object>(options?: IActionOptions) => {
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

			target.constructor.prototype.__customActions.push({
				method: options?.method || ENerveRestHTTPMethod.GET,
				url: options?.url !== undefined ? options.url : toSnakeCase(propertyKey),
				isAbsoluteUrl: options.isAbsoluteUrl,
				action: propertyKey,
			});
			// [`${propertyKey}Url`] = options.url;
		}

		return descriptor;
	};
};
