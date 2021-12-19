import {
	Action,
	ENerveRestHTTPMethod,
	NerveRestAuth,
	NerveRestController,
	NerveRestRequest,
	NerveRestResponse,
} from '../../..';
import { authControllerLoginParamsScheme, IAuthControllerLoginParams } from './AuthControllerParams';

export class AuthController extends NerveRestController {

	@Action({
		request: authControllerLoginParamsScheme,
		method: ENerveRestHTTPMethod.POST,
	})
	async login(req: NerveRestRequest<IAuthControllerLoginParams>, res: NerveRestResponse) {
		const { login, password } = req.body;

		if (NerveRestAuth.login({ login, password })) {
			return {
				data: {
					accessToken: NerveRestAuth.getToken({ login }),
				},
			};
		}
	}

}

export const Controller = AuthController;
