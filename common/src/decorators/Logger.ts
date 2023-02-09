/* eslint-disable
	@typescript-eslint/no-explicit-any,
	@typescript-eslint/no-unsafe-member-access,
	@typescript-eslint/no-unsafe-return
*/

export const Logger = ({ prefix }: { prefix: string }) => {
	return (target: any) => {
		target.prototype.logPrefix = prefix;

		return target;
	};
};
