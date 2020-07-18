/**
 * Разделение разрядов числа пробелами
 */
export const digitFormat = (str: string | number): string => {
	return str.toString()
		.replace(/(\s)+/g, '')
		.replace(/(\d{1,3})(?=(?:\d{3})+$)/g, '$1 ');
};