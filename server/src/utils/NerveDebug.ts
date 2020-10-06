/* eslint @typescript-eslint/no-explicit-any: "off", "no-console": "off" */

import { ELogLevel } from '../enums/ELogLevel';

export class NerveDebug {

	static timeEvents: any = {};

	static timeout: number = 20000;

	static level: ELogLevel = 1;

	static setLevel(level: number) {
		this.level = level;
	}

	static error(message: string, ...messages: unknown[]) {
		let args = arguments;

		if (this.level > ELogLevel.DISABLE || this.level === undefined || isNaN(this.level)) {
			setTimeout(() => console.log.apply(this, args));
		}
	}

	static log(message: string, ...messages: unknown[]) {
		let args = arguments;

		if (this.level > ELogLevel.INFO) {
			setTimeout(() => console.log.apply(this, args));
		}
	}

	static debug(message: string, ...messages: unknown[]) {
		let args = arguments;

		if (this.level > ELogLevel.DEBUG) {
			setTimeout(() => console.log.apply(this, args));
		}
	}

	static time(id: string) {
		if (this.level > ELogLevel.TIMING) {
			this.timeEvents[id] = Date.now();
			setTimeout(() => {
				if (this.timeEvents[id]) {
					delete this.timeEvents[id];
				}
			}, this.timeout);
		}
	}

	static timeEnd(id: string, message?: string) {
		let time: number;

		message = message || id;

		try {
			if (this.level > ELogLevel.TIMING && this.timeEvents[id]) {
				time = Date.now() - this.timeEvents[id];
				delete this.timeEvents[id];

				setTimeout(() => console.log(`${message}: ${time}ms`));
			}
		} catch (ignore) {
		}
	}

}
