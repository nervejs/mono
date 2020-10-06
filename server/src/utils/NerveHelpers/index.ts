import { browser } from './browser';
import { camelToSnakeCase } from './camelToSnakeCase';
import { capitalize } from './capitalize';
import { cutText } from './cutText';
import { digitFormat } from './digitFormat';
import { isFunction } from './isFunction';
import { isObject } from './isObject';
import { isString } from './isString';
import { numberHumanFormat } from './numberHumanFormat';
import { objectCamelToSnakCase } from './objectCamelToSnakCase';
import { objectSnakeToCamelCase } from './objectSnakeToCamelCase';
import { objectToCamelCase } from './objectToCamelCase';
import { os } from './os';
import { plural } from './plural';
import { secondToStr } from './secondToStr';
import { snakeToCamelCase } from './snakeToCamelCase';

export class NerveHelpers {

	static digitFormat = digitFormat;

	static objectToCamelCase = objectToCamelCase;

	static snakeToCamelCase = snakeToCamelCase;

	static camelToSnakeCase = camelToSnakeCase;

	static objectCamelToSnakCase = objectCamelToSnakCase;

	static objectSnakeToCamelCase = objectSnakeToCamelCase;

	static secondToStr = secondToStr;

	static numberHumanFormat = numberHumanFormat;

	static plural = plural;

	static capitalize = capitalize;

	static cutText = cutText;

	static isFunction = isFunction;

	static isObject = isObject;

	static isString = isString;

	static os = os;

	static browser = browser;

}
