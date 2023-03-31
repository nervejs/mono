import { NerveRequestError } from '@api';

import { INetworkStatus } from '@interfaces';

export const getDefaultNetworkStatus = (): INetworkStatus => {
	return {
		isFetching: false,
		isFetched: false,
		error: null,
	};
};

export const getNetworkStatusStarted = (): INetworkStatus => {
	return {
		isFetching: true,
		isFetched: false,
		error: null,
	};
};

export const getNetworkStatusDone = (): INetworkStatus => {
	return {
		isFetching: false,
		isFetched: true,
		error: null,
	};
};

export const getNetworkStatusFailed = (error: NerveRequestError): INetworkStatus => {
	return {
		isFetching: false,
		isFetched: false,
		error,
	};
};
