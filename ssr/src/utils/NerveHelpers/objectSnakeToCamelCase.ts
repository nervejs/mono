import { snakeToCamelCase } from './snakeToCamelCase';

/**
 * Преобразование атрибутов объекта snake_case к camelCase
 */
export const objectSnakeToCamelCase = (object: { [key: string]: unknown }): { [key: string]: unknown } => {
	const obj: { [key: string]: unknown } = {};

	Object.keys(object).forEach((key: string) => {
		obj[snakeToCamelCase(key)] = object[key];
	});

	return obj;
};