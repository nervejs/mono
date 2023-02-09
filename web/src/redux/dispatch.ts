import { useDispatch as useReduxDispatch } from 'react-redux';

import { ThunkCreator, thunkToAction } from 'typescript-fsa-redux-thunk';

import { INerveReduxAction, INerveReduxActionAsync } from '@interfaces';

const isAsyncAction = <P, R, E>(action: unknown): action is INerveReduxActionAsync<P, R, E> => {
	return !!(action as INerveReduxActionAsync<unknown, unknown, unknown>).action;
};

export const useDispatch = () => {
	const dispatch = useReduxDispatch();

	return <P, R, E>(action: INerveReduxActionAsync<P, R, E> | INerveReduxAction<P>, payload?: P) => {
		if (isAsyncAction(action)) {
			return dispatch(thunkToAction(action.action as unknown as ThunkCreator<P, R, unknown>)(payload));
		} else {
			return dispatch(action(payload));
		}
	};
};
