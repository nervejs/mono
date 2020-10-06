import { isAndroid } from './isAndroid';
import { isIOs } from './isIOs';
import { isWindowsPhone } from './isWindowsPhone';

/**
 * Возвращает true для мобильных клиентов
 */
export const isMobile = (userAgent: string): boolean => {
	return isWindowsPhone(userAgent) || isAndroid(userAgent) || isIOs(userAgent);
};