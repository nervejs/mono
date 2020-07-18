import { EHttpMethod } from '../enums/EHttpMethod';

export interface INerveRoute {
	page: string;
	methods: EHttpMethod[];
}