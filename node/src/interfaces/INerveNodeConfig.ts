import { ENerveLogLevel } from '@enums';

export interface INerveNodeConfig {
	isLocalServer: boolean;
	http: {
		host: string;
		port: number;
	};
	logLevel: ENerveLogLevel;
}
