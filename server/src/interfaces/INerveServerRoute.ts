import { INerveNodeRoute } from '@node/interfaces';

import { NerveServerPage } from '../NerveServerPage';

export interface INerveServerRoute extends INerveNodeRoute {
	page: typeof NerveServerPage;
}
