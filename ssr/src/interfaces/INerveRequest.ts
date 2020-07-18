import { Request } from 'express';

export interface INerveRequest extends Request {
	id: string;
}