import { ENerveRestControllerRequestParamsType, ENerveHTTPMethod } from '@enums';

import { Action, IAction } from './Action';

describe('Decorators → Action', () => {
	class Controller {

		@Action({
			request: {
				path: {
					bar: { type: ENerveRestControllerRequestParamsType.STRING },
					baz: { type: ENerveRestControllerRequestParamsType.STRING },
				},
			},
		})
		foo(): void {
			return void 0;
		}

		@Action({
			method: ENerveHTTPMethod.POST,
		})
		createFoo(): void {
			return void 0;
		}

		@Action({
			url: 'custom_url',
		})
		bar(): void {
			return void 0;
		}

	}

	it('path param name', () => {
		expect((Controller as unknown as { fooPathParamName: string }).fooPathParamName).toBe('bar');
	});

	it('Custom Action → Default HTTP Method', () => {
		const action = (Controller.prototype as unknown as { __customActions: IAction[] }).__customActions[0];

		expect(action.method).toBe(ENerveHTTPMethod.GET);
	});

	it('Custom Action → Custom HTTP Method', () => {
		const action = (Controller.prototype as unknown as { __customActions: IAction[] }).__customActions[1];

		expect(action.method).toBe(ENerveHTTPMethod.POST);
	});

	it('Custom Action → Default URL', () => {
		const action1 = (Controller.prototype as unknown as { __customActions: IAction[] }).__customActions[0];
		const action2 = (Controller.prototype as unknown as { __customActions: IAction[] }).__customActions[1];

		expect(action1.url).toBe('foo');
		expect(action2.url).toBe('create_foo');
	});

	it('Custom Action → Custom URL', () => {
		const action = (Controller.prototype as unknown as { __customActions: IAction[] }).__customActions[2];

		expect(action.url).toBe('custom_url');
	});
});
