import { INerveActiveUserData } from './INerveActiveUserData';
import { INerveClientConfig } from './INerveClientConfig';
import { INerveHttpTransport } from './INerveHttpTransport';
import { INerveStaticVersion } from './INerveStaticVersion';

export interface INerveCommonTemplateVars {
	staticVersion: INerveStaticVersion;
	locales: Record<string, string>;
	req: {
		url: string;
		path: string;
		params: Record<string, string>;
		query: Record<string, string>;
		cookies: Record<string, string>;
	};
	clientConfig: INerveClientConfig;
	isServerRendering: boolean;
	httpTransport: INerveHttpTransport;
	activeUser: INerveActiveUserData;
	fetchedData: unknown;
	logInfo(message: string): void;
}
