import { ENerveLogLevel } from '@enums';

import { Log } from '@utils';

export class NerveObject {

	protected logPrefix: string;

	protected getLogText(message: string) {
		return message.replace(/%NERVE_SOURCE_NAME%/g, this.logPrefix || this.constructor.name);
	}

	protected log = {
		setLevel: (level: ENerveLogLevel) => Log.setLevel(level),
		error: (message: string, err?: Error) => Log.error(this.getLogText(message), err),
		info: (message: string) => Log.info(this.getLogText(message)),
		debug: (message: string) => Log.debug(this.getLogText(message)),
	};

	getLogLevel() {
		return Log.getLevel();
	}

}
