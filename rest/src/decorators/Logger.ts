export const Logger = ({ prefix }: { prefix: string }) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (target: any) => {
		target.prototype.logPrefix = prefix;

		return target;
	};
};