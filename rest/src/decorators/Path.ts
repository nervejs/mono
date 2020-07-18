export const Path = (paramName: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
		target.constructor[`${propertyKey}PathParamName`] = paramName;

		return descriptor;
	};
};