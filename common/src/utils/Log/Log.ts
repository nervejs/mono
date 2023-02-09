/* eslint no-console: "off" */
import * as ErrorStackParser from 'error-stack-parser';

import { ENerveLogLevel } from '@enums';

export const DEFAULT_LOG_LEVEL = ENerveLogLevel.INFO;

export class Log {

	protected static level: ENerveLogLevel = DEFAULT_LOG_LEVEL;

	static getLevel() {
		return this.level;
	}

	static setLevel(level: ENerveLogLevel) {
		this.level = level;
	}

	static error(message: string, err?: Error) {
		if (this.level >= ENerveLogLevel.ERROR) {
			let log = message;

			if (err) {
				log += `\nmessage: ${err.toString ? err.toString() : String(err)}`;
			}

			if (err) {
				const parsedError = ErrorStackParser.parse(err);

				if (parsedError?.[0]) {
					log += `\nfile: ${parsedError[0].fileName}\nline: ${parsedError[0].lineNumber}\nfunction: ${parsedError[0].functionName}\n${err.stack}`;
				}
			}

			console.log(log);
		}
	}

	static info(message: string) {
		if (this.level >= ENerveLogLevel.INFO) {
			console.log(message);
		}
	}

	static debug(message: string) {
		if (this.level >= ENerveLogLevel.DEBUG) {
			console.log(message);
		}
	}

}
