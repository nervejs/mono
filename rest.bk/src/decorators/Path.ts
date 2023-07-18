/* eslint-disable
	@typescript-eslint/no-explicit-any,
	@typescript-eslint/no-unsafe-member-access,
	@typescript-eslint/no-unsafe-return
*/

export const Path = (paramName: string) => {
	return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
		target.constructor[`${propertyKey}PathParamName`] = paramName;

		return descriptor;
	};
};
