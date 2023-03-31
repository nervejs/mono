import { EProcessMessageType } from './enums';

import { NerveServerApp, INerveServerAppOptions } from '../NerveServerApp';

export interface INerveServerRunnerProjectOptions {
	pathToProject?: string;
	appRunFileName?: string;
	prepareFileName?: string
	http?: {
		host?: string;
		port?: number;
	};
	additionalOptions?: ({ flags: string; description: string })[];
}

export interface INerveServerRunnerCliOptions {
	host: string;
	port: number;
	workers: number;
	instanceId: string;
}

export type TProcessMessage = {
	type: EProcessMessageType.SET_INDEX,
	data: {
		index: number;
	}
} | {
	type: EProcessMessageType.RUN,
} | {
	type: EProcessMessageType.KILL
}

export interface INerveServerAppRunModule {
	createApp(options: Partial<INerveServerAppOptions>): NerveServerApp;
	run(): void;
}
