import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('escape', function (options: Handlebars.HelperOptions) {
		// eslint-disable-next-line babel/no-invalid-this
		return options.fn(this).replace(/"/g, '\\"');
	});
};
