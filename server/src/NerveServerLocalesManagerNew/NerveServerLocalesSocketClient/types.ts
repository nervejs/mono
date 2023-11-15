import { ENerveServerLocalesSocketMessageIn, ENerveServerLocalesSocketMessageOut } from '@enums';

import { NerveServerApp } from '../../NerveServerApp';

export interface INerveServerLocalesSocketClientOptions {
	app: NerveServerApp;
	onUpdate(): void;
}

export interface INerveServerLocalesSocketMessage<T, D = unknown> {
	cmd: T;
	data?: D;
}

export type TNerveServerLocalesSocketMessageIn = INerveServerLocalesSocketMessage<ENerveServerLocalesSocketMessageIn.UPDATE>

export type TNerveServerLocalesSocketMessageOut = INerveServerLocalesSocketMessage<ENerveServerLocalesSocketMessageOut.REGISTER>
