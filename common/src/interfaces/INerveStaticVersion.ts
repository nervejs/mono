import { INerveStaticVersionItem } from './INerveStaticVersionItem';

export interface INerveStaticVersion {
	version: string;
	js: INerveStaticVersionItem[];
	css: INerveStaticVersionItem[];
}
