import { INerveHttpTransport } from '@interfaces';

export class NerveApi {

	static transport: INerveHttpTransport;

	static setTransport(transport: INerveHttpTransport) {
		this.transport = transport;
	}

	static getTransport(): INerveHttpTransport {
		return this.transport;
	}

}
