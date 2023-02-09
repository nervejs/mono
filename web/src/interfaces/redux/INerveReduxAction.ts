import { ENerveReduxActionType } from '@enums';

export interface INerveReduxAction<P, R = unknown, E = unknown> {
	(payload?: P): void;
	mode: ENerveReduxActionType;
}
