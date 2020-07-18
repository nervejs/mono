import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('spaceless', function (options: Handlebars.HelperOptions) {
		return options.fn(this)
			.replace(/>\s+</g, '><')
			.replace(/[\t\n]/g, '')
			.trim();
	});
};