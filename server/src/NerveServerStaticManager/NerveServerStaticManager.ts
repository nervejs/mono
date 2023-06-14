import { promises as fs } from 'fs';
import * as path from 'path';

import { Logger } from '@decorators';

import { NerveNodeObject } from '@node/NerveNodeObject';

import { INerveStaticVersion, INerveStaticVersionItem } from '@interfaces';

import { INerveServerStaticManagerOptions } from './types';

@Logger({ prefix: 'StaticManager' })
export class NerveServerStaticManager extends NerveNodeObject {

	protected options: INerveServerStaticManagerOptions;
	protected versions: INerveStaticVersion[] = [];

	constructor(options: INerveServerStaticManagerOptions) {
		super();

		this.options = options;
	}

	async init() {
		await this.readVersions();
	}

	getCurrentVersion(): INerveStaticVersion {
		const {
			static: { isMultiVersions, currentVersion },
		} = this.options.app.config;

		if (isMultiVersions) {
			if (currentVersion) {
				const version = this.versions.find((item) => item.version === currentVersion);

				if (version) {
					return version;
				} else {
					this.log.error(`Static version ${currentVersion} not found, use last version`);

					return this.versions[this.versions.length - 1];
				}
			} else {
				return this.versions[this.versions.length - 1];
			}
		} else {
			return this.versions[0];
		}
	}

	async readVersions() {
		const { static: { isMultiVersions } } = this.options.app.config;
		const templatesDir = this.options.app.getTemplatesDir();

		if (isMultiVersions) {
			try {
				const dirs = await fs.readdir(path.resolve(templatesDir));

				this.versions = await Promise.all(
					dirs
						.filter((item) => item !== '.' && item !== '..')
						.map(async (item) => this.readVersion(item)),
				);
			} catch (err) {
				this.log.error('Failed read static multi versions: ', err as Error);
			}
		} else {
			try {
				const version = await this.readVersion(templatesDir);

				this.versions = [{ ...version, version: '0' }];
			} catch (err) {
				this.log.error('Failed read static single version: ', err as Error);
			}
		}
	}

	async readVersion(version: string): Promise<INerveStaticVersion> {
		const { static: { versionsFiles } } = this.options.app.config;
		const templatesDir = this.options.app.getTemplatesDir();
		const dir = path.resolve(templatesDir, version);
		let js: INerveStaticVersionItem[] = [];
		let css: INerveStaticVersionItem[] = [];

		try {
			const [
				jsVersions,
				cssVersions,
			] = await Promise.all([
				fs.readFile(path.resolve(dir, versionsFiles.js), { encoding: 'utf-8' }),
				fs.readFile(path.resolve(dir, versionsFiles.css), { encoding: 'utf-8' }),
			]);

			try {
				js = JSON.parse(jsVersions) as INerveStaticVersionItem[];
			} catch (err) {
				this.log.error('Failed parse js versions: ', err as Error);
			}

			try {
				css = JSON.parse(cssVersions) as INerveStaticVersionItem[];
			} catch (err) {
				this.log.error('Failed parse css versions: ', err as Error);
			}
		} catch (err) {
			this.log.error('Failed read static versions: ', err as Error);
		}

		return {
			version,
			js,
			css,
		};
	}

}
