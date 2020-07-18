import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('ifLt', function (v1: unknown, v2: unknown, options: Handlebars.HelperOptions) {
		if (v1 < v2) {
			return options.fn(this);
		}

		return options.inverse(this);
	});
};