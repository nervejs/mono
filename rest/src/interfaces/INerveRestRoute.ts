import { INerveNodeRoute } from '@node/interfaces';

import { NerveRestAction } from '../NerveRestAction';

export interface INerveRestRoute extends INerveNodeRoute {
	action: typeof NerveRestAction;
}
