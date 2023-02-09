import { Dispatch } from 'react';

import { actionCreatorFactory } from 'typescript-fsa';
import { asyncFactory, AsyncWorker, ThunkReturnType } from 'typescript-fsa-redux-thunk';

import { ENerveReduxActionType } from '@enums';

import { INerveReduxAction, INerveReduxActionAsync } from '@interfaces';

export const getActionCreator = <T>(prefix: string) => {
	const actionCreator = actionCreatorFactory(prefix);
	const actionCreatorAsync = asyncFactory<T>(actionCreator);

	return {
		actionCreator: <P>(action: string) => {
			const actionObj = actionCreator(action) as unknown as INerveReduxAction<P>;

			actionObj.mode = ENerveReduxActionType.SYNC;

			return actionObj;
		},
		actionCreatorAsync: <P, R, E>(action: string, worker: (payload: P, dispatch: Dispatch<unknown>) => Promise<R>) => {
			const actionObj = actionCreatorAsync(action, worker as unknown as AsyncWorker<P, ThunkReturnType<R>, T, unknown>) as unknown as INerveReduxActionAsync<P, R, E>;

			actionObj.async.started.mode = ENerveReduxActionType.STARTED;
			actionObj.async.done.mode = ENerveReduxActionType.DONE;
			actionObj.async.failed.mode = ENerveReduxActionType.FAILED;

			return actionObj;
		},
	};
};
