import { IDefaultLogPrefixParams } from './types';

export const getDefaultLogPrefix = (params: IDefaultLogPrefixParams = {}) => {
	const { requestId } = params;
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
	const date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;

	let prefix = `[${date}] [${process.pid}]`;

	prefix += ` [%NERVE_SOURCE_NAME%]`;

	if (requestId) {
		prefix += ` [${requestId}]`;
	}

	return prefix;
};
