import { NerveApiError } from '@api';

export interface INetworkStatus {
	isFetching: boolean;
	isFetched: boolean;
	error: NerveApiError;
}
