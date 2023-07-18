import { TestApp } from './TestApp';

const app = new TestApp();

app
	.getRouter()
	.setControllersDir('./controllers');

void app.run();
