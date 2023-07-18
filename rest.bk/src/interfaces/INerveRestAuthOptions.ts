export interface INerveRestAuthLoginParams {
	login: string;
	password: string;
}

export interface INerveRestAuthOptions {
	secret: string;
	login(params: INerveRestAuthLoginParams): Promise<unknown>;
	getCurrentUser(data: unknown): Promise<unknown>;
}
