export const getURIParams = (params: { [key: string]: string | number | string[] | number[] }): string => {
	return Object.keys(params)
		.reduce(
			(prev: string, cur: string) => {
				if (params[cur] == null) {
					return prev;
				}

				if (Array.isArray(params[cur])) {
					const value = (params[cur] as string[]).map((item) => `${cur}[]=${encodeURIComponent(String(item))}`).join('&');

					return `${prev}${(prev ? '&' : '')}${value}`;
				} else {
					return `${prev}${(prev ? '&' : '')}${cur}=${encodeURIComponent(String(params[cur]))}`;
				}
			},
			'',
		);
};
