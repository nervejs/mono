import { INerveRestContextParamOptions, INerveRestContextParamOptionsNonGeneric } from './types';

export const ctxParam = <T extends string | number | boolean>(options: INerveRestContextParamOptionsNonGeneric) => options as INerveRestContextParamOptions<T>;

type GetGenericType<C extends INerveRestContextParamOptions<unknown>> = C extends INerveRestContextParamOptions<infer T> ? T : unknown;

export type CtxParamsType<T extends Record<string, INerveRestContextParamOptions<unknown>>> = {
	[key in keyof T]: GetGenericType<T[key]>
}
