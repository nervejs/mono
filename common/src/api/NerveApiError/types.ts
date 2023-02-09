import { INerveHttpTransportError, INerveHttpTransportRequestParams } from '@interfaces';

export interface IMydawnFeApiErrorOptions {
	error: INerveHttpTransportError;
	request: INerveHttpTransportRequestParams;
}
