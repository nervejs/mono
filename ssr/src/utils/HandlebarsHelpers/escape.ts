import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('escape', function (options: Handlebars.HelperOptions) {
		return options.fn(this).replace(/"/g, '\\"');
	});
};