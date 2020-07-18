import { secondToStr } from './secondToStr';
import { digitFormat } from './digitFormat';
import { objectToCamelCase } from './objectToCamelCase';
import { snakeToCamelCase } from './snakeToCamelCase';
import { camelToSnakeCase } from './camelToSnakeCase';
import { objectCamelToSnakCase } from './objectCamelToSnakCase';
import { objectSnakeToCamelCase } from './objectSnakeToCamelCase';
import { numberHumanFormat } from './numberHumanFormat';
import { plural } from './plural';
import { capitalize } from './capitalize';
import { cutText } from './cutText';
import { isFunction } from './isFunction';
import { isObject } from './isObject';
import { isString } from './isString';
import { os } from './os';
import { browser } from './browser';

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