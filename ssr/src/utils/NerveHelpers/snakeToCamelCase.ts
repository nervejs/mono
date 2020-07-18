/**
 * Преобразование строки snake_case к camelCase
 */
export const snakeToCamelCase = (str: string): string => {
	let s: string = str.toLowerCase();

	if (s.length > 3) {
		s = s
			.replace(/_(.)/g, $1 => $1.toUpperCase())
			.replace(/_/g, '')
			.replace(/^(.)/, $1 => $1.toLowerCase());
	}

	return s;
};