/**
 * Возвращает true для iOS
 */
export const isIOs = (userAgent: string): boolean => /iPad|iPhone|iPod/.test(userAgent);