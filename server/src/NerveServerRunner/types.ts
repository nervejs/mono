import { EProcessMessageType } from './enums';

export interface INerveServerRunnerProjectOptions {
	pathToProject?: string;
	appFileName?: string;
	host?: string;
	port?: number;
	additionalOptions?: ({ flags: string; description: string })[];
}

export interface INerveServerRunnerCliOptions {
	socket: string;
	port: number;
	workers: number;
	routes: string;
	templates: string;
	instanceId: string;
	env: string;
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
