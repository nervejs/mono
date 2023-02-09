export interface INerveApiResponse<T> {
	data: T;
	status: number;
	statusText: string;
	headers: { [ key: string ]: string };
}
