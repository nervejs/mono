// eslint-disable-next-line import/no-unassigned-import
require('module-alias/register');

import { TestApp } from './TestApp';

const app = new TestApp();

app
	.getRouter()
	.setControllersDir('./controllers');

void app.run();