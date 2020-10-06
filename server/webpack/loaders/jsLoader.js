const path = require('path');

module.exports = {
	test: /\.jsx?$/,
	use: [
		{
			loader: 'babel-loader',
			options: {
				presets: ['@babel/preset-env']
			}
		}
	],
	include: [
		path.resolve(__dirname, '../../node_modules'),
	],
};
