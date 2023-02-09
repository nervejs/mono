import { INerveReduxReducer } from '@interfaces';

type ReducersMapObject<S> = {
	[K in keyof S]: INerveReduxReducer<S[K]>
}

export interface IOptions<S> {
	getInitialState(): S;
	reducers: ReducersMapObject<S>;
}
