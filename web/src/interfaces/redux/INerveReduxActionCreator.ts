import { INerveReduxAction } from './INerveReduxAction';

export interface INerveReduxActionCreator {
	<T>(action: string): INerveReduxAction<T>;
}
