import { NerveRestApp } from '..';

import { TestRouter } from './TestRouter';

export class TestApp extends NerveRestApp {

	protected port = 15000;

	protected router: TestRouter = new TestRouter();

}