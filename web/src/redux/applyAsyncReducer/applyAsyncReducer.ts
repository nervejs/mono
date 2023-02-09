import {
	getNetworkStatusStarted,
	getNetworkStatusDone,
	getNetworkStatusFailed,
	NerveApiError,
} from '@nervejs/common';

import {
	INerveReduxActionAsync,
	INerveReduxReducer,
} from '@interfaces';

export const applyAsyncReducer = <TData, TMeta>() => {
	return <
		TStore,
		TFetchPayload,
		TResultPayload,
		TErrorPayload extends NerveApiError,
		TAction extends INerveReduxActionAsync<TFetchPayload, TResultPayload, TErrorPayload>,
		TProp extends keyof TStore,
		TMetaPropName extends keyof TMeta,
	>
	(
		propName: TProp,
		metaName: TMetaPropName,
		action: TAction,
		reducer: INerveReduxReducer<TStore>,
		prepareResult?: (params: { store: TStore & { [key: string]: { meta: TMeta; data: TData } }; result: TResultPayload; params: TFetchPayload }) => Partial<TData>,
	) =>
		reducer
			.case(
				action.async.started,
				(store: TStore & { [key: string]: { meta: TMeta } }) => ({
					...store,
					[propName]: {
						...store[propName],
						meta: {
							...store[propName].meta,
							[metaName]: getNetworkStatusStarted(),
						},
					},
				}),
			)
			.case(
				action.async.failed,
				(
					store: TStore & { [key: string]: { meta: TMeta } },
					{ error }: { error: TErrorPayload },
				) => ({
					...store,
					[propName]: {
						...store[propName],
						meta: {
							...store[propName].meta,
							[metaName]: getNetworkStatusFailed(error),
						},
					},
				}),
			)
			.case(
				action.async.done,
				(
					store: TStore & { [key: string]: { meta: TMeta; data: TData } },
					payload: { params: TFetchPayload; result: TResultPayload },
				) => {
					let data: Partial<TData>;

					if (prepareResult) {
						const result = prepareResult({ store, result: payload.result, params: payload.params });

						if (result === null) {
							data = result;
						} else if (Array.isArray(result)) {
							data = result;
						} else {
							data = {
								...store[propName].data,
								...result,
							};
						}
					} else {
						data = store[propName].data;
					}

					return {
						...store,
						[propName]: {
							...store[propName],
							data,
							meta: {
								...store[propName].meta,
								[metaName]: getNetworkStatusDone(),
							},
						},
					};
				},
			);
};
