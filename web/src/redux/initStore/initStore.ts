import { createStore, applyMiddleware, combineReducers, PreloadedState, CombinedState, ReducersMapObject } from 'redux';

import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import { htmlEntitiesDecode } from '@nervejs/common';

import { IOptions } from './types';

export const initStore = <S>(options: IOptions<S>) => {
	const {
		getInitialState,
		reducers,
	} = options;

	const rootReducer = combineReducers<S>(reducers as unknown as ReducersMapObject<S>);

	let initialState: S;

	try {
		initialState = JSON.parse(htmlEntitiesDecode(document.getElementById('initial-state').innerHTML)) as S;
	} catch (err) {
		initialState = {} as S;
	}

	return () => createStore(
		rootReducer,
		{
			...getInitialState(),
			...initialState,
		} as PreloadedState<CombinedState<S>>,
		composeWithDevTools(applyMiddleware(thunk)),
	);
};
