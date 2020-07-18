import { NerveRestController, NerveRestRequest, NerveRestResponse } from '../../..';

export class UserController extends NerveRestController {

	async index(req: NerveRestRequest, res: NerveRestResponse) {
		return {
			data: { ok: false },
		};
	}

}

export const Controller = UserController;