import * as clstr from 'cluster';
import { Cluster, Worker } from 'cluster';
import { program } from 'commander';
import * as fs from 'fs';
import { cpus } from 'os';
import * as path from 'path';

import { EProcessMessageType } from './enums';

import { NerveServerObject } from '../NerveServerObject';

import {
	INerveServerAppRunModule,
	INerveServerRunnerCliOptions,
	INerveServerRunnerProjectOptions,
	TProcessMessage,
} from './types';

const cluster = clstr as unknown as Cluster;

export class NerveServerRunner extends NerveServerObject {

	protected options: INerveServerRunnerProjectOptions;

	constructor(options: INerveServerRunnerProjectOptions) {
		super();
		this.options = {
			pathToProject: './src',
			appRunFileName: 'run',
			...options,
		};
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	init() {
		const {
			pathToProject,
			appRunFileName,
			prepareFileName,
			http,
		} = this.options;
		const cpuCount = cpus().length - 1;
		let terminating = false;

		program
			.option('-H, --host <host>', 'host to listen on')
			.option('-p, --port <port>', 'port to listen on')
			.option('-w, --workers <n>', 'number of workers to start (default: Ncpu - 1)')
			.option('--instance-id <dir>', 'instance id');

		if (Array.isArray(this.options.additionalOptions)) {
			this.options.additionalOptions.forEach((item) => {
				program.option(item.flags, item.description);
			});
		}

		program.parse(process.argv);

		const cliOptions = program.opts<INerveServerRunnerCliOptions>();

		if (cluster.isPrimary) {
			const workersNum = cliOptions.workers || cpuCount;

			this.log.info(`Starting ${workersNum} workers`);

			for (let i = 0; i < workersNum; i++) {
				const index = i + 1;
				const worker = cluster.fork();

				(worker as unknown as { index: number }).index = index;
				worker.send({
					type: EProcessMessageType.SET_INDEX,
					data: {
						index: index,
					},
				});
				worker.send({
					type: EProcessMessageType.RUN,
				});
			}

			cluster.on('listening', (worker, address) => {
				this.log.info(`Worker #${worker.id} [${worker.process.pid}] is listening on ${address.address}:${address.port}`);
			});

			const workerFailed = (worker: Worker, code: number, signal: number) => {
				this.log.error(`Failed to start worker [${worker.process.pid}] (${signal || code}), exiting`);
				process.exit(1);
			};

			cluster.once('exit', workerFailed);
			cluster.once('listening', (worker, address) => {
				this.log.info(`Listening on ${address.address}:${address.port}`);
				cluster.removeListener('exit', workerFailed);
				cluster.on('exit', (failedWorker, code, signal) => {
					if (terminating) {
						return;
					}

					this.log.info(`Worker #${failedWorker.id} [${failedWorker.process.pid}] (index: ${(failedWorker as unknown as { index: number }).index}) died (${signal || code}), restarting...`);

					const newWorker = cluster.fork();

					(newWorker as unknown as { index: number }).index = (failedWorker as unknown as { index: number }).index;
					newWorker.send({
						type: EProcessMessageType.SET_INDEX,
						data: { index: (newWorker as unknown as { index: number }).index },
					});
					newWorker.send({
						type: EProcessMessageType.RUN,
					});
				});
			});

			process.on('SIGTERM', () => {
				this.log.error('SIGTERM received, terminating all workers');
				terminating = true;

				// eslint-disable-next-line guard-for-in
				for (const id in cluster.workers) {
					cluster.workers[id].send({
						type: EProcessMessageType.KILL,
					});
				}

				this.log.error('All workers have terminated, exiting');
				process.exit(0);
			});
		} else {
			if (prepareFileName) {
				const preparePath = path.resolve(process.cwd(), pathToProject, prepareFileName);

				if (fs.existsSync(preparePath + '.js')) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-var-requires
					require(preparePath)(cliOptions);
				}
			}

			const appRunPath = path.resolve(process.cwd(), pathToProject, appRunFileName);
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { run, createApp } = require(appRunPath) as INerveServerAppRunModule;
			const app = createApp({
				http: {
					host: cliOptions.host || (http === null || http === void 0 ? void 0 : http.host),
					port: cliOptions.port || (http === null || http === void 0 ? void 0 : http.port),
				},
			});

			app.setInstanceId(cliOptions.instanceId);

			process.on('message', (message: TProcessMessage) => {
				switch (message.type) {
					case EProcessMessageType.SET_INDEX:
						app.setWorkerIndex(message.data.index);
						break;
					case EProcessMessageType.RUN:
						run();
						break;
					case EProcessMessageType.KILL:
						this.log.error(`worker ${process.pid} terminated`);
						process.exit(0);
						break;
				}
			});
		}
	}

	static run(options: INerveServerRunnerProjectOptions) {
		const instance = new NerveServerRunner(options);

		instance.init();
	}

}
