import { Dispatch } from 'react';

import { INerveReduxActionAsync } from './INerveReduxActionAsync';

export interface INerveReduxActionAsyncCreator {
	<P, R, E>(action: string, worker: (payload: P, dispatch: Dispatch<unknown>) => Promise<R>): INerveReduxActionAsync<P, R, E>;
}
