/* eslint no-console: "off" */

import { ENerveRestLogLevel } from '../enums';

export class Log {

	protected static level: ENerveRestLogLevel = ENerveRestLogLevel.INFO;

	static setLevel(level: ENerveRestLogLevel) {
		this.level = level;
	}

	static error(message: string, err?: Error) {
		if (this.level >= ENerveRestLogLevel.ERROR) {
			console.log(`${message}: ${err && err.toString ? err.toString() : String(err)}`);
		}
	}

	static info(message: string) {
		if (this.level >= ENerveRestLogLevel.INFO) {
			console.log(message);
		}
	}

	static debug(message: string) {
		if (this.level >= ENerveRestLogLevel.DEBUG) {
			console.log(message);
		}
	}

}