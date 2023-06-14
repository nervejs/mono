import { getDefaultLogPrefix } from '@utils';

import { NerveObject } from '@common/NerveObject';

export class NerveNodeObject extends NerveObject {

	protected getLogPrefix() {
		return getDefaultLogPrefix();
	}

	protected depersonalizeLog(message: string) {
		return message;
	}

	protected errorLog(message: string, err?: Error) {
		this.log.error(`${this.getLogPrefix()} ${this.depersonalizeLog(message)}`, err);
	}

	protected logError(message: string, err?: Error) {
		this.log.error(`${this.getLogPrefix()} ${this.depersonalizeLog(message)}`, err);
	}

	protected logInfo(message: string) {
		this.log.info(`${this.getLogPrefix()} ${this.depersonalizeLog(message)}`);
	}

	protected logDebug(message: string) {
		this.log.debug(`${this.getLogPrefix()} ${this.depersonalizeLog(message)}`);
	}

}
