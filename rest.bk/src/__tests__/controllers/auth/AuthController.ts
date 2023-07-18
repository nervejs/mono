import {
	Action,
	ENerveHTTPMethod,
	NerveRestAuth,
	NerveRestController,
	NerveRestRequest,
	NerveRestResponse,
} from '../../..';
import { authControllerLoginParamsScheme, IAuthControllerLoginParams } from './AuthControllerParams';

export class AuthController extends NerveRestController {

	@Action({
		request: authControllerLoginParamsScheme,
		method: ENerveHTTPMethod.POST,
	})
	async login(req: NerveRestRequest<IAuthControllerLoginParams>, res: NerveRestResponse) {
		const { login, password } = req.body;
		const result = await NerveRestAuth.login({ login, password });

		if (result) {
			return {
				data: {
					accessToken: NerveRestAuth.getToken({ login }),
				},
			};
		} else {
			return null;
		}
	}

}

export const Controller = AuthController;
