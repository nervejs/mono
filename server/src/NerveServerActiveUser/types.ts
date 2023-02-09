import { Response } from 'express';

import { NerveServerApp } from '../NerveServerApp';

import { NerveServerRequest } from '@types';

export interface INerveServerActiveUserOptions {
	app: NerveServerApp;
	req: NerveServerRequest;
	res: Response;

	requestId: string;
}
