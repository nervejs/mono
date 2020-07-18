import { ENerveRestControllerRequestParamsType } from 'enums';

export interface INerveRestControllerRequestParamsSchemeItem {
	type: ENerveRestControllerRequestParamsType;
	isRequired?: boolean;
}

export interface INerveRestControllerRequestParamsScheme {
	path?: { [ key: string ]: INerveRestControllerRequestParamsSchemeItem };
	query?: { [ key: string ]: INerveRestControllerRequestParamsSchemeItem };
	body?: { [ key: string ]: INerveRestControllerRequestParamsSchemeItem };
	headers?: { [ key: string ]: INerveRestControllerRequestParamsSchemeItem };
}