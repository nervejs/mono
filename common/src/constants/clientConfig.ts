import { INerveClientConfig } from '@interfaces';

export const getDefaultNerveClientConfig: () => INerveClientConfig = () => ({
	hosts: {
		main: '',
		api: '',
		static: '',
		js: '',
		css: '',
	},
});
