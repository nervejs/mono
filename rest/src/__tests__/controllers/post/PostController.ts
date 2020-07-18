import { NerveRestController, NerveRestRequest, NerveRestResponse, Action } from '../../..';
import {
	IPostControllerCreateParams,
	IPostControllerViewParams,
	postControllerViewParamsScheme,
} from './PostControllerParams';

export class PostController extends NerveRestController {

	async index(req: NerveRestRequest, res: NerveRestResponse) {
		return {
			data: { ok: true },
		};
	}

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

	async create(req: NerveRestRequest<IPostControllerCreateParams>, res: NerveRestResponse) {
		return {
			data: { ok: true },
		};
	}

}

export const Controller = PostController;