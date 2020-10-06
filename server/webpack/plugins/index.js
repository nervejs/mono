module.exports = (isDev, isProd, isStat) => {
	let plugins = [
		require('./circularDependencyPlugin'),
		// require('./moduleConcatenationPlugin'),
	];

	if (isStat) {
		plugins.push(require('./bundleAnalyzerPlugin'));
	}

	return plugins;
};
