import { INerveTemplateRenderResult } from './INerveTemplateRenderResult';

export interface INerveTemplate<T = unknown> {
	render(vars: T): Promise<INerveTemplateRenderResult>;
	preFetchData(vars: T): Promise<unknown>;
	fetchData(vars: T): Promise<unknown>;
}
