/* eslint no-console: "off" */

import { ENerveLogLevel } from '@enums';

import { DEFAULT_LOG_LEVEL, Log } from './Log';

let lastError: Error = null;

const getError = () => {
	lastError = new Error('error message');

	return lastError;
};

const runLogs = () => {
	Log.error('test error', getError());
	Log.info('test info');
	Log.debug('test debug');
};

describe('Log', () => {
	it('Default Level', () => {
		expect(Log.getLevel()).toBe(DEFAULT_LOG_LEVEL);
	});

	it('Set Level → NONE', () => {
		console.log = jest.fn();

		Log.setLevel(ENerveLogLevel.NONE);
		expect(Log.getLevel()).toBe(ENerveLogLevel.NONE);

		runLogs();

		expect(console.log).not.toHaveBeenCalled();
	});

	it('Set Level → ERROR', () => {
		console.log = jest.fn();

		Log.setLevel(ENerveLogLevel.ERROR);
		expect(Log.getLevel()).toBe(ENerveLogLevel.ERROR);

		runLogs();

		expect(console.log).toHaveBeenCalledTimes(1);
		expect(console.log).toHaveBeenNthCalledWith(1, `test error\nmessage: ${lastError.toString()}\nfile: ${__filename}\nline: 10\nfunction: getError\n${lastError.stack}`);
	});

	it('Set Level → INFO', () => {
		console.log = jest.fn();

		Log.setLevel(ENerveLogLevel.INFO);
		expect(Log.getLevel()).toBe(ENerveLogLevel.INFO);

		runLogs();

		expect(console.log).toHaveBeenCalledTimes(2);
		expect(console.log).toHaveBeenNthCalledWith(1, `test error\nmessage: ${lastError.toString()}\nfile: ${__filename}\nline: 10\nfunction: getError\n${lastError.stack}`);
		expect(console.log).toHaveBeenNthCalledWith(2, `test info`);
	});

	it('Set Level → DEBUG', () => {
		console.log = jest.fn();

		Log.setLevel(ENerveLogLevel.DEBUG);
		expect(Log.getLevel()).toBe(ENerveLogLevel.DEBUG);

		runLogs();

		expect(console.log).toHaveBeenCalledTimes(3);
		expect(console.log).toHaveBeenNthCalledWith(1, `test error\nmessage: ${lastError.toString()}\nfile: ${__filename}\nline: 10\nfunction: getError\n${lastError.stack}`);
		expect(console.log).toHaveBeenNthCalledWith(2, `test info`);
		expect(console.log).toHaveBeenNthCalledWith(3, `test debug`);
	});
});
