import { INerveReduxAction } from './INerveReduxAction';

export interface INerveReduxActionAsync<P, R, E> {
	action: (payload?: P) => Promise<R>;
	async: {
		started: INerveReduxAction<P, R, E>;
		done: INerveReduxAction<P, R, E>;
		failed: INerveReduxAction<P, R, E>;
	};
}
