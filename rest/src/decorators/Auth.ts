export const Auth = () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
		if (!target.constructor.prototype.__authRequired) {
			target.constructor.prototype.__authRequired = [];
		}

		target.constructor.prototype.__authRequired.push(propertyKey);

		return descriptor;
	};
};
