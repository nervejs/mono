import { ActionCreator } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { ENerveReduxActionType } from '@enums';

import { INerveReduxAction, INerveReduxReducer } from '@interfaces';

export const getReducer = <S>({
	initial,
}: {
	initial: S;
}) => {
	const reducer = reducerWithInitialState<S>(initial);
	const originalCase = reducer.case.bind(reducer);

	(reducer as unknown as INerveReduxReducer<S>).case = <P, R, E>(
		action: INerveReduxAction<P>,
		fn: (
			store: S,
			payload: {
				params?: P,
				result?: R,
				error?: E,
			},
		) => S,
	) => {
		if (action.mode === ENerveReduxActionType.STARTED || action.mode === ENerveReduxActionType.SYNC) {
			originalCase(
				action as unknown as ActionCreator<P>,
				(store: S, params: P) => {
					return fn(store, { params });
				},
			);
		} else {
			originalCase(
				action as unknown as ActionCreator<{ params: P, result: R, error: E }>,
				(store: S, payload: { params: P, result: R, error: E }) => {
					return fn(store, payload);
				},
			);
		}

		return reducer as unknown as INerveReduxReducer<S>;
	};

	return reducer as unknown as INerveReduxReducer<S>;
};
