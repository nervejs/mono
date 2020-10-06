export interface ICutTextOptions {
	maxLinkLength: number;
}

/**
 * Обрезает текст с учетом слов и ссылок
 */
export const cutText = (text: string, length: number, options?: ICutTextOptions): string => {
	let cutted = text.slice(0, Number(length)),
		textLength = text.length,
		cuttedLength = cutted.length,
		posOpenLink,
		posCloseLink,
		i;

	options = options || <ICutTextOptions>{};

	const opts = {
		maxLinkLength: 30,
		...options,
	};

	if (textLength > cuttedLength) {
		i = cuttedLength;

		while (text[i] !== ' ' && i < textLength) {
			cutted += text[i++];
		}

		posOpenLink = cutted.toLowerCase().lastIndexOf('<a');
		posCloseLink = cutted.toLowerCase().lastIndexOf('</a>');
		if (posOpenLink > posCloseLink) {
			cutted += text.slice(cutted.length, text.indexOf('</a>', cutted.length)) + '</a>';
		}
	}

	if (opts.maxLinkLength) {
		cutted = cutted.replace(/>(.+?)<\/a>/g, function (matches, text) {
			let result = '>' + text.slice(0, opts.maxLinkLength);

			if (text.length > opts.maxLinkLength) {
				result += '...';
			}

			result += '</a>';

			return result;
		});
	}

	return cutted;
};