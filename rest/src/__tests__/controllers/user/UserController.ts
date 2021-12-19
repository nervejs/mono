import { Action, Auth, NerveRestController, NerveRestRequest, NerveRestResponse } from '../../..';

export class UserController extends NerveRestController {

	@Auth()
	@Action({})
	async current(req: NerveRestRequest, res: NerveRestResponse) {
		return {
			data: { ok: false },
		};
	}

}

export const Controller = UserController;
