import { ENerveLocale } from '@enums';

import { INerveNodeConfig } from '@node/interfaces';

import { INerveServerUpstreamsConfigPoolItem } from './INerveServerUpstreamsConfigPoolItem';

export interface INerveServerConfig extends INerveNodeConfig {
	paths: {
		templates: {
			dir: string;
		};
		locales: {
			dir: string,
			fileName: string,
		};
	};
	static: {
		isMultiVersions: boolean;
		versionsFiles: {
			js: string;
			css: string;
		};
		currentVersion: string;
	};
	locales: {
		source: ENerveLocale;
		list: ENerveLocale[];
		isEnabled: boolean;
		isFallbackToSource: boolean;
		isNewManager: boolean;
		server: {
			host: string;
			protocol: string;
			prefixUrl: string;
			projectId: string;
		};
		socket: {
			isEnabled: boolean;
			host: string;
			port: number;
			retryConnectTimeout: number;
		};
	};
	render: {
		isCacheEnabled: boolean;
		isServerEnabled: boolean;
	};
	upstreams: {
		[key: string]: {
			pool: INerveServerUpstreamsConfigPoolItem[];
		};
	};
	hosts: {
		main: string;
		api: string;
		js: string;
		css: string;
		static: string;
	};
	defaultUpstream: string;
	request: {
		timeout: number;
	};
}
