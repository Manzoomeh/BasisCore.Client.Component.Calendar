import { IDateUtil } from "../IDateUtil/IDateUtil";
import { Month } from "../Month/Month";
import {
  Lid,
  DayValue,
  MonthValue,
  DayNumber,
  YearValue,
  Culture,
  MonthNumber,
} from "../type-alias";
export class BasisCoreDateUtil implements IDateUtil {
  json;
  readonly sMonthsNameFa: string[] = [
    "",
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  readonly sMonthsNameEn: string[] = [
    "",
    "Farvardin",
    "Ordibehesht",
    "Khordad",
    "Tir",
    "Mordad",
    "Shahrivar",
    "Mehr",
    "Aban",
    "Azar",
    "Dey",
    "Bahman",
    "Esfand",
  ];
  readonly weeksName: string[] = [
    "",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ];
  readonly weeksEnName: string[] = [
    "",
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
  constructor() {
    this.json = require("./tdate.json");
  }
  getObj(year: number, month: MonthNumber, day?: DayNumber) {
    if (year > 1300 && year < 1500 && day) {
      return this.json.find((item) => {
        return item.syear == year && item.smonth == month && item.sdate == day;
      });
    } else if (year > 1300 && year < 1500 && !day) {
      var filtered = this.json.filter(function (element) {
        return element.syear == year && element.smonth == month;
      });
      return filtered;
    } else {
      return this.json.find((item) => {
        return item.nyear == year && item.mmonth == month && item.mdate == day;
      });
    }
  }
  getMonthName(month: MonthValue, culture: Culture, lid: Lid): string {
    let sMonth = this.getObj(month.year, month.month, 1).smonth;
    if (lid == 1) {
      return this.sMonthsNameFa[sMonth];
    } else if (lid == 2) {
      return this.sMonthsNameEn[sMonth];
    }
  }
  getDaysNumber(month: MonthValue, culture: Culture): DayNumber {
    let sMonth = this.getObj(month.year, month.month).length;
    return sMonth as DayNumber;
  }
  getDayName(day: DayValue, culture: Culture, lid: Lid): string {
    let weekday = this.getObj(day.year, day.month, day.day).weekday;
    if (lid == 1) {
      return this.weeksName[weekday];
    } else {
      return this.weeksEnName[weekday];
    }
  }
  getBasisDayId(day: DayValue): number {
    return this.getObj(day.year, day.month, day.day).id;
  }

  getWeekday(day: DayValue, culture: Culture): number {
    return this.getObj(day.year, day.month, day.day).weekday;
  }
  getIsHoliday(day: DayValue, culture: Culture): boolean {
    let weekday = this.getObj(day.year, day.month, day.day).weekday;
    if (weekday == 6) {
      return true;
    } else {
      return false;
    }
  }
  getIsLeapYear(year: YearValue, Culture: Culture): boolean {
    return false;
  }
  getMonthValueList(from: DayValue, to: DayValue): MonthValue[] {
    let months: MonthValue[] = [];
    let currentYear = from.year;
    for (var i = from.month; i <= to.month; i++) {
      months.push({ year: from.year, month: i });
      if (i == 12) {
        currentYear = currentYear + 1;
      }
    }
    return months;
  }
  getCurrentDate(): DayValue {
    var date = new Date();
    var today = this.getObj(
      date.getFullYear(),
      (date.getMonth() + 1) as MonthNumber,
      date.getDate() as DayNumber
    );
    var basisCoreObjToday: DayValue = {
      year: today.syear,
      month: today.smonth,
      day: today.sdate,
    };
    return basisCoreObjToday;
  }
  getDayNames(lid: Lid): string[] {
    let weekName: string[] =
      lid == 1
        ? [
            "شنبه",
            "یکشنبه",
            "دوشنبه",
            "سه‌شنبه",
            "چهارشنبه",
            "پنج‌شنبه",
            "جمعه",
          ]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekName;
  }
  getDayShortNames(lid: Lid): string[] {
    let weekName: string[] =
      lid == 1
        ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekName;
  }
  nextMonth(month: Month, culture: Culture): MonthValue {
    let retVal: MonthValue;
    let nextMonth: MonthNumber = (month.value.month + 1) as MonthNumber;
    let currentYear: number = month.value.year;
    if (nextMonth > 12) {
      currentYear++;
      nextMonth = 1;
    }
    retVal = { year: currentYear, month: nextMonth };
    return retVal;
  }
  prevMonth(month: Month, culture: Culture): MonthValue {
    let retval: MonthValue;
    let prevMonth: MonthNumber = (month.value.month - 1) as MonthNumber;
    let currentYear: number = month.value.year;
    if (prevMonth < 1) {
      currentYear--;
      prevMonth = 12;
    }
    retval = { year: currentYear, month: prevMonth };
    return retval;
  }
  getIsToday(day: DayValue): boolean {
    const javaScriptTody = new Date()
      .toLocaleDateString("fa-IR")
      .replace(/([۰-۹])/g, (token) =>
        String.fromCharCode(token.charCodeAt(0) - 1728)
      );
    const datePart = javaScriptTody.split("/");
    const basisDate = this.getObj(day.year, day.month, day.day);
    if (
      parseInt(datePart[0]) == parseInt(basisDate.syear) &&
      parseInt(datePart[1]) == parseInt(basisDate.smonth) &&
      parseInt(datePart[2]) == parseInt(basisDate.sdate)
    ) {
      return true;
    }
    return false;
  }
}
