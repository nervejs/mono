const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = [
	new UglifyJsPlugin({
		cache: true,
		parallel: true,
		sourceMap: true,
		uglifyOptions: {
			output: {
				comments: false, // remove comments
			},
			compress: {
				passes: 3,
				unused: true,
				dead_code: true, // big one--strip code that will never execute
				// warnings: false, // good for prod apps so users can't peek behind curtain
				drop_debugger: true,
				conditionals: true,
				evaluate: true,
				// drop_console: true, // strips console statements
				sequences: true,
				booleans: true,
			}
		},
	}),
];