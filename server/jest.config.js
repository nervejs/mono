module.exports = {
	roots: [
		'<rootDir>/src'
	],
	preset: 'ts-jest/presets/js-with-ts-esm',
	testEnvironment: 'node',
	testMatch: [
		'**/?(*.)+(spec|test).[tj]s?(x)'
	],
	globals: {},
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	moduleNameMapper: {
		'^@common(.*)$': '<rootDir>/../common/src$1',
		'^@node(.*)$': '<rootDir>/../node/src$1',
		'^@constants(.*)$': '<rootDir>/src/constants$1',
		'^@enums(.*)$': '<rootDir>/src/enums$1',
		'^@interfaces(.*)$': '<rootDir>/src/interfaces$1',
		'^@redux(.*)$': '<rootDir>/src/redux$1',
		'^@utils(.*)$': '<rootDir>/src/utils$1',
		'^@decorators(.*)$': '<rootDir>/src/decorators$1'
	},
};
