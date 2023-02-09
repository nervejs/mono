import { Upstream, UpstreamList } from 'balancer-round-robin';

import { Logger } from '@decorators';

import { NerveServerObject } from '../NerveServerObject';

import { INerveServerUpstreamsConfigPoolItem, INerveServerUpstreamsConfigPoolItemExtra } from '@interfaces';

import { INerveServerUpstreamBalancerOptions } from './types';

@Logger({ prefix: 'UpstreamBalancer' })
export class NerveServerUpstreamBalancer extends NerveServerObject {

	protected options: INerveServerUpstreamBalancerOptions;
	protected upstreams: { [key: string]: { upstream?: Upstream; pool?: UpstreamList } } = {};
	protected upstreamsConfig: { [key: string]: { pool: INerveServerUpstreamsConfigPoolItem[] } };

	constructor(options: INerveServerUpstreamBalancerOptions) {
		super();

		this.options = options;
	}

	readUpstreamsFromConfig() {
		const upstreamsConfig = this.options.app.config.upstreams;

		if (upstreamsConfig && JSON.stringify(upstreamsConfig) !== JSON.stringify(this.upstreamsConfig)) {
			this.upstreamsConfig = { ...upstreamsConfig };

			Object.keys(this.upstreamsConfig).forEach((key) => {
				const configItem = this.upstreamsConfig[key];
				const upstreamList = new UpstreamList();

				if (!configItem.pool) {
					this.log.error(`Empty upstream config "${key}"`);
				} else {
					upstreamList.setList(configItem.pool || []);

					this.upstreams[key] = { pool: upstreamList };
				}
			});
		}
	}

	get(upstreamKey: string): Upstream<INerveServerUpstreamsConfigPoolItemExtra> {
		const pool = this.upstreams[upstreamKey]?.pool;
		let upstream = this.upstreams[upstreamKey]?.upstream;

		if (pool) {
			upstream = pool.get();
		}

		if (!upstream) {
			throw new Error(`Upstream for "${upstreamKey}" not found (maybe not configured)`);
		}

		return upstream;
	}

}
