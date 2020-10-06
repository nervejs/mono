module.exports = function (env, options) {
	return [
		require('./app')(env, options),
	];
};
