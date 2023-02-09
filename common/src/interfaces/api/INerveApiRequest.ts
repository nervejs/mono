import { INerveHttpTransportRequestParams } from '../INerveHttpTransport';

export interface INerveApiRequest extends INerveHttpTransportRequestParams {
	isNoProcessData?: boolean;
	baseURL?: string;
	getAbort?(abort: () => void): void;
	onUploadProgress?(event: ProgressEvent): void;
}
