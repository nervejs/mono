import { NerveRequestError } from '@api';

export interface INetworkStatus {
	isFetching: boolean;
	isFetched: boolean;
	error: NerveRequestError;
}
