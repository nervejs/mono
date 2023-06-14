import { NerveNodeApp } from '../NerveNodeApp';

import { NerveNodeRequest, NerveNodeResponse } from '@types';

export interface INerveNodeActiveUserOptions {
	app: NerveNodeApp;
	req: NerveNodeRequest;
	res: NerveNodeResponse;

	requestId: string;
}
