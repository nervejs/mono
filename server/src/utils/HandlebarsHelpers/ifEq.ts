import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('ifEq', function (v1: unknown, v2: unknown, options: Handlebars.HelperOptions) {
		if (String(v1) === String(v2)) {
			// eslint-disable-next-line babel/no-invalid-this
			return options.fn(this);
		}
		// eslint-disable-next-line babel/no-invalid-this
		return options.inverse(this);
	});
};
