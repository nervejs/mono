module.exports = {
	"roots": [
		"<rootDir>/src"
	],
	"testMatch": [
		"**/?(*.)+(spec|test).[tj]s?(x)"
	],
	"globals": {},
	"transform": {
		"^.+\\.ts$": "ts-jest"
	},
	"moduleNameMapper": {
		"^@constants(.*)$": "<rootDir>/src/constants$1",
		"^@enums(.*)$": "<rootDir>/src/enums$1",
		"^@interfaces(.*)$": "<rootDir>/src/interfaces$1",
		"^@redux(.*)$": "<rootDir>/src/redux$1",
		"^@utils(.*)$": "<rootDir>/src/utils$1"
	},
};