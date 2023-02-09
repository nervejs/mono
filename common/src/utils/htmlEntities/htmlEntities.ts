export const htmlEntitiesEncode = (str: string) => (
	str
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
);

export const htmlEntitiesDecode = (str: string) => (
	str
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
);
