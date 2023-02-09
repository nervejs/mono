import { getURIParams } from './getURIParams';

describe('getURIParams', () => {
	it('one array param', () => {
		expect(
			getURIParams({ foo: ['1', '2', '3'] }),
		).toEqual(
			'foo[]=1&foo[]=2&foo[]=3',
		);
	});

	it('multiple array param', () => {
		expect(
			getURIParams({
				foo: ['1', '2', '3'],
				bar: ['4', '5', '6'],
			}),
		).toEqual(
			'foo[]=1&foo[]=2&foo[]=3&bar[]=4&bar[]=5&bar[]=6',
		);
	});

	it('simple params', () => {
		expect(
			getURIParams({
				foo: '123',
				bar: '456',
			}),
		).toEqual(
			'foo=123&bar=456',
		);
	});

	it('mixed params', () => {
		expect(
			getURIParams({
				foo: ['1', '2', '3'],
				bar: '456',
			}),
		).toEqual(
			'foo[]=1&foo[]=2&foo[]=3&bar=456',
		);
	});
});
