import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('debug', function (optionalValue: unknown) {
		console.log(optionalValue);
	});
};