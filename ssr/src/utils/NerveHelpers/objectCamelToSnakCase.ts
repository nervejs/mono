import { camelToSnakeCase } from './camelToSnakeCase';

/**
 * Преобразование атрибутов объекта camelCase к snake_case
 */
export const objectCamelToSnakCase = (object: { [key: string]: unknown }): { [key: string]: unknown } => {
	const obj: any = {};

	Object.keys(object).forEach((key: string) => {
		obj[camelToSnakeCase(key)] = object[key];
	});

	return obj;
};