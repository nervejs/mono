import * as net from 'net';
import { Socket } from 'net';
import { v4 as uuid } from 'uuid';

import {
	ENerveServerLocalesSocketMessageIn,
	ENerveServerLocalesSocketMessageOut,
} from '@enums';

import { Logger } from '@decorators';

import { NerveNodeObject } from '@node/NerveNodeObject';

import {
	INerveServerLocalesSocketClientOptions,
	TNerveServerLocalesSocketMessageIn,
	TNerveServerLocalesSocketMessageOut,
} from './types';

@Logger({ prefix: 'LocalesSocketClient' })
export class NerveServerLocalesSocketClient extends NerveNodeObject {

	protected options: INerveServerLocalesSocketClientOptions;
	protected socket: Socket;
	protected sessionId: string;
	protected timerConnect: NodeJS.Timer;
	protected buffer = '';

	constructor(options: INerveServerLocalesSocketClientOptions) {
		super();

		this.options = options;

		this.sessionId = uuid();
		this.connect();
	}

	getServerAddress() {
		const { locales: { socket: { host, port } } } = this.options.app.config;

		return `${host}:${port}`;
	}

	connect() {
		const { locales: { socket: { host, port } } } = this.options.app.config;

		this.logInfo(`Connect to locales socket server ${this.getServerAddress()}`);

		this.socket = net.connect(
			{
				host,
				port,
			},
			() => {
				this.logInfo(`Connected to locales socket server ${this.getServerAddress()}`);

				this.send({ cmd: ENerveServerLocalesSocketMessageOut.REGISTER });
			},
		);

		this.socket
			.on('error', () => this.onConnectionError())
			.on('close', () => this.onConnectionClose())
			.on('end', () => this.onConnectionEnd())
			.on('data', (data: Buffer) => this.onConnectionData(data));
	}

	send(message: TNerveServerLocalesSocketMessageOut) {
		const { cmd, data } = message;

		this.socket.write(JSON.stringify({
			cmd: cmd,
			data: {
				hostname: process.env.hostname || process.env.HOSTNAME,
				sessionId: this.sessionId,
				...data as Record<string, unknown>,
			},
		}) + ';');
	}

	protected retryConnect() {
		if (this.timerConnect) {
			clearTimeout(this.timerConnect);
		}

		this.timerConnect = setTimeout(
			() => {
				this.logInfo(`Try connect to server ${this.getServerAddress()}`);
				this.connect();
			},
			this.options.app.config.locales.socket.retryConnectTimeout,
		);
	}

	protected processingMessage(message: TNerveServerLocalesSocketMessageIn) {
		this.logInfo(`received "${message.cmd}" message from socket server`);

		// eslint-disable-next-line sonarjs/no-small-switch
		switch (message.cmd) {
			case ENerveServerLocalesSocketMessageIn.UPDATE:
				this.options.onUpdate();
				break;
		}
	}

	protected onConnectionError() {
		this.logInfo(`Failed connect to server ${this.getServerAddress()}: `);

		this.retryConnect();
	}

	protected onConnectionClose() {
		this.logInfo(`Connection to server ${this.getServerAddress()} closed`);

		this.retryConnect();
	}

	protected onConnectionEnd() {
		this.logInfo(`Disconnected from server ${this.getServerAddress()}`);

		this.retryConnect();
	}

	protected onConnectionData(data: Buffer) {
		let delimiterIndex;

		this.buffer += data.toString();

		delimiterIndex = this.buffer.indexOf(';');

		while (delimiterIndex > -1) {
			const messageStr = this.buffer.substring(0, delimiterIndex);

			try {
				const message = JSON.parse(messageStr) as TNerveServerLocalesSocketMessageIn;

				this.processingMessage(message);
			} catch (err) {
				this.logError('Failed parse message', err as Error);
				this.logError(`Message: ${messageStr}`);
			}

			this.buffer = this.buffer.substring(delimiterIndex + 1);
			delimiterIndex = this.buffer.indexOf(';');
		}
	}

}
