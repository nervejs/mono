import { TNerveRoute } from '../types/TNerveRoute';

export interface INerveRouteList {
	public?: { [key: string]: TNerveRoute };
	protected?: { [key: string]: TNerveRoute };
}