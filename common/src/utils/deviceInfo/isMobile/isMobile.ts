import { isAndroid } from '../isAndroid';
import { isIOS } from '../isIOS';

export const isMobile = (userAgent: string) => isIOS(userAgent) || isAndroid(userAgent);
