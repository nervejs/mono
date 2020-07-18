/**
 * Преобразование первого символа строки к верхнему регистру
 */
export const capitalize = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.substr(1);
};