export const plural = (value: number, text5: string, text1: string, text2: string): string => {
	let text;

	if (value < 0) {
		value = value * (-1);
	}

	value = value % 100;

	if (value >= 5 && value <= 14) {
		text = text5;
	} else {
		value = value % 10;

		if (!value || value >= 5) {
			text = text5;
		} else if (value >= 2) {
			text = text2;
		} else {
			text = text1;
		}
	}

	return text;
};