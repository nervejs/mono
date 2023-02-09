export interface INerveReduxDispatchAsync {
	<P, R>(payload?: P): Promise<R>;
}
