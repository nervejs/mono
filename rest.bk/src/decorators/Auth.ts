/* eslint-disable
	@typescript-eslint/no-explicit-any,
	@typescript-eslint/no-unsafe-member-access,
	@typescript-eslint/no-unsafe-return,
	@typescript-eslint/no-unsafe-call
*/

export const Auth = () => {
	return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
		if (!target.constructor.prototype.__authRequired) {
			target.constructor.prototype.__authRequired = [];
		}

		target.constructor.prototype.__authRequired.push(propertyKey);

		return descriptor;
	};
};
