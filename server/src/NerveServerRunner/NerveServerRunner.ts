import * as clstr from 'cluster';
import { Cluster, Worker } from 'cluster';
import { program } from 'commander';
import * as fs from 'fs';
import { cpus } from 'os';
import * as path from 'path';

import { EProcessMessageType } from './enums';

import { NerveServerApp } from '../NerveServerApp';
import { NerveServerObject } from '../NerveServerObject';

import { INerveServerRunnerCliOptions, INerveServerRunnerProjectOptions, TProcessMessage } from './types';

const cluster = clstr as unknown as Cluster;

export class NerveServerRunner extends NerveServerObject {

	protected options: INerveServerRunnerProjectOptions;

	constructor(options: INerveServerRunnerProjectOptions) {
		super();
		this.options = options;
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	init() {
		const cpuCount = cpus().length - 1;
		const pathToProject = this.options?.pathToProject || 'src';
		// const appFileName = projectOptions?.appFileName || 'App';
		// let host = '0.0.0.0';
		// let port = projectOptions?.port || 3000;
		let terminating = false;

		program
			.option('-s, --socket [<host>]:<port>', 'socket to listen on')
			.option('-p, --port <port>', 'port to listen on')
			.option('-w, --workers <n>', 'number of workers to start (default: Ncpu - 1)')
			.option('-r, --routes <file>', 'template routes file')
			.option('-t, --templates <dir>', 'templates directory')
			.option('--instance-id <dir>', 'instance id')
			.option('-e, --env <env>', 'environment');

		if (Array.isArray(this.options.additionalOptions)) {
			this.options.additionalOptions.forEach((item) => {
				program.option(item.flags, item.description);
			});
		}

		program.parse(process.argv);

		const options = program.opts<INerveServerRunnerCliOptions>();

		// if (options.socket) {
		// 	const socket = options.socket.match(/^([\d\.]+)?:(\d+)$/);
		//
		// 	if (!socket) {
		// 		invalidArguments('--socket option is in invalid format');
		// 	}
		//
		// 	host = socket[1];
		// 	port = Number(socket[2]);
		// }
		//
		// if (options.port) {
		// 	port = options.port;
		// }

		if (cluster.isPrimary) {
			const workersNum = options.workers || cpuCount;

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
			const pathToSetup = path.resolve(process.cwd(), pathToProject, 'setup');

			if (fs.existsSync(pathToSetup + '.js')) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-var-requires
				require(pathToSetup)(options);
			}

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const { run, app } = require(path.resolve(process.cwd(), pathToProject, 'run')) as { app: NerveServerApp; run: () => void };

			app.setInstanceId(options.instanceId);

			// const appPath = path.resolve(process.cwd(), pathToProject, appFileName);
			// const App = require(appPath).App as typeof NerveServerApp;
			// const app = new App({
			// 	workDir: path.resolve(process.cwd(), pathToProject),
			// });

			// if (options.env) {
			// 	app.setEnv(options.env);
			// }

			// const server = app.listen(port, host, function() {
			// 	const listen = server.address();
			//
			// 	console.log(`Listening on http://${listen.address}:${listen.port}`);
			// });

			// app.route(require(path.resolve(process.cwd(), pathToProject, 'routes')).routes);

			// server.on('error', function(error: NodeJS.ErrnoException) {
			// 	if (error.syscall !== 'listen') {
			// 		throw error;
			// 	}
			//
			// 	switch (error.code) {
			// 		case 'EACCES':
			// 			console.error(options.socket + ' requires elevated privileges');
			// 			process.exit(1);
			// 			break;
			// 		case 'EADDRINUSE':
			// 			console.error(options.socket + ' is already in use');
			// 			process.exit(1);
			// 			break;
			// 		default:
			// 			throw error;
			// 	}
			// });

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

		// function invalidArguments(message: string) {
		// 	console.log(message);
		// 	program.outputHelp();
		// 	process.exit(1);
		// }
	}

	static run(options: INerveServerRunnerProjectOptions) {
		const instance = new NerveServerRunner(options);

		instance.init();
	}

}
