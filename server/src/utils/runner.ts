import * as cluster from 'cluster';
import * as fs from 'fs';
import * as path from 'path';

const nativeRequire = eval('require')

export interface IProjectOptions {
	pathToProject?: string;
	appFileName?: string;
	port?: number;
	additionalOptions?: ({ flags: string; description: string })[];
}

export const runner = (projectOptions: IProjectOptions) => {
	const cpuCount = require('os').cpus().length - 1;
	const pathToProject = projectOptions?.pathToProject || 'src';
	const appFileName = projectOptions?.appFileName || 'App';
	let host = '0.0.0.0';
	let port = projectOptions?.port || 3000;
	let terminating = false;

	const options = require('commander')
		.option('-s, --socket [<host>]:<port>', 'socket to listen on')
		.option('-p, --port <port>', 'port to listen on')
		.option('-w, --workers <n>', 'number of workers to start (default: Ncpu - 1)')
		.option('-r, --routes <file>', 'template routes file')
		.option('-t, --templates <dir>', 'templates directory')
		.option('-e, --env <env>', 'environment');

	if (Array.isArray(projectOptions.additionalOptions)) {
		projectOptions.additionalOptions.forEach(function (item) {
			options.option(item.flags, item.description);
		});
	}

	options.parse(process.argv);

	if (options.socket) {
		const socket = options.socket.match(/^([\d\.]+)?:(\d+)$/);

		if (!socket) {
			invalidArguments('--socket option is in invalid format');
		}

		host = socket[1];
		port = socket[2];
	}

	if (options.port) {
		port = options.port;
	}

	if (cluster.isMaster) {
		const workersNum = options.workers || cpuCount;

		console.log('Starting %d workers', workersNum);

		for (let i = 0; i < workersNum; i++) {
			const worker = cluster.fork();

			(worker as unknown as { index: number }).index = i + 1;
			worker.send({
				msg: 'setIndex',
				data: {
					index: i + 1
				}
			});
		}

		cluster.on('listening', function (worker, address) {
			console.log('Worker #%d [%d] is listening on %s:%d', worker.id, worker.process.pid, address.address, address.port);
		});

		const workerFailed = function (worker: cluster.Worker, code: number, signal: number) {
			console.error('Failed to start worker [%d] (%s), exiting', worker.process.pid, signal || code);
			process.exit(1);
		};

		cluster.once('exit', workerFailed);
		cluster.once('listening', function (worker, address) {
			console.log('Listening on %s:%d', address.address, address.port);
			cluster.removeListener('exit', workerFailed);
			cluster.on('exit', function (worker, code, signal) {
				if (terminating) {
					return;
				}

				console.log('Worker #%d [%d] (index: %d) died (%s), restarting...', worker.id, worker.process.pid, (worker as unknown as { index: number }).index, signal || code);

				const newWorker = cluster.fork();
				(newWorker as unknown as { index: number }).index = (worker as unknown as { index: number }).index;
				newWorker.send({
					msg: 'setIndex',
					data: { index: (newWorker as unknown as { index: number }).index },
				});
			});
		});

		process.on('SIGTERM', function () {
			console.log('SIGTERM received, terminating all workers');
			terminating = true;

			for (var id in cluster.workers) {
				cluster.workers[id].send({
					msg: 'kill'
				});
			}

			console.log('All workers have terminated, exiting');
			process.exit(0);
		});
	} else {
		const pathToSetup = path.resolve(process.cwd(), pathToProject, 'setup');

		if (fs.existsSync(pathToSetup + '.js')) {
			require(pathToSetup)(options);
		}

		const appPath = path.resolve(process.cwd(), pathToProject, appFileName);
		const App = nativeRequire(appPath).App;
		const app = new App();

		if (options.env) {
			app.setEnv(options.env);
		}

		const server = app.listen(port, host, function () {
			const listen = server.address();

			console.log(`Listening on http://${listen.address}:${listen.port}`);
		});

		app.route(nativeRequire(path.resolve(process.cwd(), pathToProject, 'routes')).routes);

		server.on('error', function (error: NodeJS.ErrnoException) {
			if (error.syscall !== 'listen')
				throw error;

			switch (error.code) {
				case 'EACCES':
					console.error(options.socket + ' requires elevated privileges');
					process.exit(1);
					break;
				case 'EADDRINUSE':
					console.error(options.socket + ' is already in use');
					process.exit(1);
					break;
				default:
					throw error;
			}
		});

		process.on('message', function (event) {
			if (event.msg === 'kill') {
				console.log('worker ' + process.pid + ' terminated');
				process.exit(0);
			} else if (event.msg === 'setIndex') {
				app.setWorkerIndex(event.data.index);
			}
		});
	}

	function invalidArguments(message: string) {
		console.log(message);
		options.outputHelp();
		process.exit(1);
	}
};
