const path = require('path');

module.exports = function (env, options) {
	env = env || {};

	const isDev = options.mode === 'development';
	const isProd = options.mode === 'production';
	const isStat = !!env.stat;

	const config = {
		mode: options.mode,

		devtool: 'source-map',

		entry: {
			index: require('./entries/index'),
		},

		target: 'node',

		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, '../dist/'),
			publicPath: '/',
			library: '@nervejs/server',
			libraryTarget: 'commonjs2',
		},

		module: {
			rules: [
				require('./loaders/typescriptLoader'),
				require('./loaders/jsLoader'),
			]
		},

		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			alias: require('./aliases'),
		},

		optimization: require('./optimization'),

		plugins: [
			...require('./plugins')(isDev, isProd, isStat),
		],

		stats: 'errors-only',

	};

	return config;
};
