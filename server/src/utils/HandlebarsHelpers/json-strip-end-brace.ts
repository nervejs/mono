import * as Handlebars from 'handlebars';

export = function (HandlebarsObject: typeof Handlebars) {
	HandlebarsObject.registerHelper('stripEndBrace', function (object: {}) {
		return object ? JSON.stringify(object)
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/^\{/, '')
			.replace(/\}$/, '') : '{}';
	});
};
