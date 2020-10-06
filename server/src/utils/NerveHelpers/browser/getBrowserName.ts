import * as browser from 'browser-detect';

export const getBrowserName = (userAgent: string): string => browser(userAgent).name;