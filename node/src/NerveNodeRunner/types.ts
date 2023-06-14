import { EProcessMessageType } from './enums';

import { NerveNodeApp, INerveNodeAppOptions } from '../NerveNodeApp';

export interface INerveNodeRunnerProjectOptions {
	pathToProject?: string;
	appRunFileName?: string;
	prepareFileName?: string
	http?: {
		host?: string;
		port?: number;
	};
	additionalOptions?: ({ flags: string; description: string })[];
}

export interface INerveNodeRunnerCliOptions {
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

export interface INerveNodeAppRunModule {
	createApp(options: Partial<INerveNodeAppOptions>): NerveNodeApp;
	run(): void;
}
