export interface INerveRestControllerRequestParams {
	path: { [ key: string ]: string | number };
	body: { [ key: string ]: string | number | string[] | number[] };
	query: { [ key: string ]: string | number };
	headers: { [ key: string ]: string | number };
}
