import { ENerveRestControllerRequestParamsType } from '../../../enums';

import { INerveRestControllerRequestParams, INerveRestControllerRequestParamsScheme } from '../../../interfaces';

export const postControllerViewParamsScheme: INerveRestControllerRequestParamsScheme = {
	path: {
		postId: { type: ENerveRestControllerRequestParamsType.STRING },
	},
};

export interface IPostControllerViewParams extends INerveRestControllerRequestParams {
	path: { postId: string };
}

export interface IPostControllerCreateParams extends INerveRestControllerRequestParams {
	path: { title: string };
}
