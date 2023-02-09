import { IUpstreamOptions } from 'balancer-round-robin';

export interface INerveServerUpstreamsConfigPoolItemExtra {
	protocol?: string;
	headers?: { [key: string]: string };
}

export interface INerveServerUpstreamsConfigPoolItem extends IUpstreamOptions<INerveServerUpstreamsConfigPoolItemExtra> {}
