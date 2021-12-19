import { ENerveRestControllerRequestParamsType } from '../../../enums';

import { INerveRestControllerRequestParams, INerveRestControllerRequestParamsScheme } from '../../../interfaces';

export const authControllerLoginParamsScheme: INerveRestControllerRequestParamsScheme = {
	body: {
		login: { type: ENerveRestControllerRequestParamsType.STRING },
		password: { type: ENerveRestControllerRequestParamsType.STRING },
	},
};

export interface IAuthControllerLoginParams extends INerveRestControllerRequestParams {
	body: {
		login: string;
		password: string;
	};
}
