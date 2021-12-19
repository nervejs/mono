import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

import { ENerveRestContentType, ENerveRestHTTPStatus } from './enums';

import { Logger } from './decorators';

import { NerveRestObject } from './NerveRestObject';

import { INerveRestAuthLoginParams, INerveRestAuthOptions, INerveRestControllerResult } from './interfaces';

@Logger({ prefix: 'Auth' })
export class NerveRestAuth extends NerveRestObject {

	static options: INerveRestAuthOptions = null;

	static init(options: INerveRestAuthOptions) {
		this.options = options;
	};

	static async getEncryptedPassword(password: string) {
		return bcrypt.hash(password, 10);
	}

	static async compareEncryptedPasswords(password1: string, password2: string) {
		return bcrypt.compare(password1, password2);
	}

	static async login(params: INerveRestAuthLoginParams) {
		return this.options.login(params);
	}

	static async getCurrentUser(data: unknown) {
		return this.options.getCurrentUser(data);
	}

	static getToken(data: unknown) {
		return jwt.sign(
			data as Buffer,
			this.options.secret,
		);
	};

	static async validateToken(req: Request) {
		const authorization = req.headers.authorization;
		const [, token] = authorization ? authorization.split(' ') : [];

		if (token) {
			try {
				const decoded = jwt.verify(token, this.options.secret);

				return decoded;
			} catch (err) {
				return false;
			}
		} else {
			return false;
		}
	}

	static getError<T extends {}>(): INerveRestControllerResult<T> {
		return {
			contentType: ENerveRestContentType.JSON,
			status: ENerveRestHTTPStatus.UNAUTHORIZED,
			data: {
				error: '',
				code: ENerveRestHTTPStatus.UNAUTHORIZED,
			} as unknown as T,
		};
	}

}
