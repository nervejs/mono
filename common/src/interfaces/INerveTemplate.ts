import { INerveTemplateRenderResult } from './INerveTemplateRenderResult';

export interface INerveTemplate<T = unknown> {
	render(vars: T): Promise<INerveTemplateRenderResult>;
	fetchData(vars: T): Promise<unknown>;
}
