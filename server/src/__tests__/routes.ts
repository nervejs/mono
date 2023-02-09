import { INerveServerRoute } from '..';

import { TestPage } from './pages';

export const routes: INerveServerRoute[] = [
	{ path: '/test', page: TestPage },
];
