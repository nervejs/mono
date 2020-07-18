import { ENerveRestLogLevel } from './enums';

import { Log } from './utils';

export class NerveRestObject {

	protected logPrefix: string;

	// tslint:disable-next-line: typedef
	protected log = {
		setLevel: (level: ENerveRestLogLevel) => Log.setLevel(level),
		error: (message: string, err?: Error) => Log.error(`${this.logPrefix || ''}: ${message}`, err),
		info: (message: string) => Log.info(`${this.logPrefix || ''}: ${message}`),
		debug: (message: string) => Log.debug(`${this.logPrefix || ''}: ${message}`),
	};

}