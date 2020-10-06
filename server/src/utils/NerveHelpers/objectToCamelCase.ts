/**
 * Преобразование атрибутов объекта к camelCase
 */
export const objectToCamelCase = (object: { [key: string]: unknown }): { [key: string]: unknown } => {
	let obj: { [key: string]: unknown } = {};

	Object.keys(object).forEach((key) => {
		let k;

		if (key === 'ID') {
			k = key.toLowerCase();
		} else {
			k = key.charAt(0).toLowerCase() + key.substr(1);
		}

		obj[k] = object[key];
	});

	return obj;
};
