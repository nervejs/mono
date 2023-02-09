import { NerveRestController, NerveRestRequest, NerveRestResponse, Action } from '../../..';
import {
	IPostControllerCreateParams,
	IPostControllerViewParams,
	postControllerViewParamsScheme,
} from './PostControllerParams';

export class PostController extends NerveRestController {

	// eslint-disable-next-line @typescript-eslint/require-await
	async index(req: NerveRestRequest, res: NerveRestResponse) {
		return {
			data: { ok: true },
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	@Action({
		request: postControllerViewParamsScheme,
	})
	async view(req: NerveRestRequest<IPostControllerViewParams>, res: NerveRestResponse) {
		return {
			data: {
				ok: true,
				params: JSON.stringify(req.params),
			},
		};
	}

	// eslint-disable-next-line sonarjs/no-identical-functions,@typescript-eslint/require-await
	async create(req: NerveRestRequest<IPostControllerCreateParams>, res: NerveRestResponse) {
		return {
			data: { ok: true },
		};
	}

}

export const Controller = PostController;
