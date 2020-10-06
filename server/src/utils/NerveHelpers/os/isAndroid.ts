/**
 * Возвращает true для android
 */
export const isAndroid = (userAgent: string): boolean => /android/i.test(userAgent);