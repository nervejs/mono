import { INerveReduxAction } from './INerveReduxAction';

export interface INerveReduxReducer<S> {
	case<P, R, E>(
		action: INerveReduxAction<P, R, E>,
		fn: (
			store: S,
			payload: {
				params?: P,
				result?: R,
				error?: E,
			},
		) => S
	): this;
}
