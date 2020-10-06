import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('unlessEq', function (v1: unknown, v2: unknown, options: Handlebars.HelperOptions) {
		if (v1 !== v2) {
			// eslint-disable-next-line babel/no-invalid-this
			return options.fn(this);
		}

		// eslint-disable-next-line babel/no-invalid-this
		return options.inverse(this);
	});
};
