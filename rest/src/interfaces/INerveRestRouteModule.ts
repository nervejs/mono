import { INerveRestRouteAction } from './INerveRestRouteAction';

export interface INerveRestRouteModule {
	url: string;
	module: string;
	actions: INerveRestRouteAction[];
}