import { ENerveHTTPMethod } from '@enums';

import { NerveServerPage } from '../NerveServerPage';

export interface INerveServerRoute {
	path: string;
	method?: ENerveHTTPMethod;
	page: typeof NerveServerPage;
}
