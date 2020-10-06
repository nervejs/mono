const path = require('path');

module.exports = {
	test: /\.tsx?$/,
	use: [
		{
			loader: 'thread-loader',
			options: {
				workers: require('os').cpus().length - 2,
			},
		},

		{
			loader: 'ts-loader',
			options: {
				configFile: path.resolve(__dirname, '../../tsconfig.json'),
				happyPackMode: true,
				transpileOnly: true,
			}
		}
	],
	include: [
		path.resolve(__dirname, '../../src'),
	],
};
