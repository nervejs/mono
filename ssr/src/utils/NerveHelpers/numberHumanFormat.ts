/**
 * Преобразование числа в "человеко удобный" формат
 */
export const numberHumanFormat = (value: number, separator: string): string => {
	let humanNumber: string;

	separator = separator || '';

	if (value < 1000) {
		humanNumber = String(value);
	} else if (value < 999950) {
		humanNumber = (value / 1000).toFixed(1).replace(/\.0$/, '') + separator + 'K';
	} else {
		humanNumber = (value / 1000000).toFixed(1).replace(/\.0$/, '') + separator + 'M';
	}

	return humanNumber;
};