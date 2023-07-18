import { NerveNodeActiveUser } from '@node/NerveNodeActiveUser';

import { NerveRestApp } from '../NerveRestApp';
import { INerveRestContextParamOptions } from '../NerveRestContextParam';
import type { NerveRestContext } from './NerveRestContext';

import { NerveNodeRequest } from '@types';

import { INerveRestValidationError } from '@interfaces';

export interface INerveRestContextOptions {
	app: NerveRestApp;
	requestId: string;
	activeUser: NerveNodeActiveUser;
	req: NerveNodeRequest;
	scheme: {
		params?: Record<string, INerveRestContextParamOptions<unknown>>;
		query?: Record<string, INerveRestContextParamOptions<unknown>>;
		body?: Record<string, INerveRestContextParamOptions<unknown>>;
		headers?: Record<string, INerveRestContextParamOptions<unknown>>;
		customValidations?: ((ctx?: NerveRestContext<unknown>) => Promise<INerveRestValidationError>)[];
	},
	data?: {
		params?: Record<string, string>;
		query?: Record<string, string>;
		body?: Record<string, string>;
		headers?: Record<string, string>;
	}
}

export interface INerveRestContext {
	params?: Record<string, unknown>;
	query?: Record<string, unknown>;
	body?: Record<string, unknown>;
	headers?: Record<string, unknown>;
}
