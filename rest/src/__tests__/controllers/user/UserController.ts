import { Action, Auth, NerveRestController, NerveRestRequest, NerveRestResponse } from '../../..';

export class UserController extends NerveRestController {

	// eslint-disable-next-line @typescript-eslint/require-await
	@Auth()
	@Action({})
	async current(req: NerveRestRequest, res: NerveRestResponse) {
		return {
			data: { ok: false },
		};
	}

}

export const Controller = UserController;
