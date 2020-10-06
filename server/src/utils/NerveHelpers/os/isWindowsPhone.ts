/**
 * Возвращает true для windows phone
 */
export const isWindowsPhone = (userAgent: string): boolean => /windows phone/i.test(userAgent);