import { Response } from 'express';

export interface INerveResponse extends Response {
	id: string;
}