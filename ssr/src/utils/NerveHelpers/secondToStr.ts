export interface ISecondToStrFormat {
	showHour?: boolean;
	showMin?: boolean;
	showSec?: boolean;
	padHour?: boolean;
	padMin?: boolean;
	padSec?: boolean;
	sepHour?: string;
	sepMin?: string;
	sepSec?: string;
}

/**
 * Перевод секунд в строку с выводом часов, минут, секунд
 */
export const secondToStr = (s: number, format?: ISecondToStrFormat): string => {
	s = Number(s);

	if (isNaN(s)) {
		s = 0;
	}

	const timeFormat = {
		showHour: false,
		showMin: true,
		showSec: true,
		padHour: false,
		padMin: true,
		padSec: true,
		sepHour: ':',
		sepMin: ':',
		sepSec: '',

		...format,
	};
	const myTime = new Date(s * 1000);
	const hour = myTime.getUTCHours();
	const min = timeFormat.showHour ? myTime.getUTCMinutes() : myTime.getUTCMinutes() + hour * 60;
	const sec = timeFormat.showMin ? myTime.getUTCSeconds() : myTime.getUTCSeconds() + min * 60;
	const strHour = (timeFormat.padHour && hour < 10) ? '0' + hour : hour;
	const strMin = (timeFormat.padMin && min < 10) ? '0' + min : min;
	const strSec = (timeFormat.padSec && sec < 10) ? '0' + sec : sec;
	let strTime = '';

	if (strHour) {
		strTime += timeFormat.showHour ? strHour + timeFormat.sepHour : '';
	}
	strTime += timeFormat.showMin ? strMin + timeFormat.sepMin : '';
	strTime += timeFormat.showSec ? strSec + timeFormat.sepSec : '';

	return strTime;
};