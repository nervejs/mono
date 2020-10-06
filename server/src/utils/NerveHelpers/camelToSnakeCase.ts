/**
 * Преобразование строки camelCase к snake_case
 */
export const camelToSnakeCase = (s: string): string => {
	return s
		.replace(/(?:^|\.?)([A-Z])/g, (x, y) => '_' + y.toLowerCase())
		.replace(/^_/, '');
};