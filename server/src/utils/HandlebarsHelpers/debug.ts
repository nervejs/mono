import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('debug', function (optionalValue: unknown) {
		// eslint-disable-next-line no-console
		console.log(optionalValue);
	});
};
