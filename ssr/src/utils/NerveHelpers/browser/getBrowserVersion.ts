import * as browser from "browser-detect";

export const getBrowserVersion = (userAgent: string): string => browser(userAgent).version;