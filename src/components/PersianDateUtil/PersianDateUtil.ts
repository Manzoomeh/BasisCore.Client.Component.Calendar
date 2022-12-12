import { IDateUtil } from "../IDateUtil/IDateUtil";
import { Month } from "../Month/Month";
import {
  Lid,
  DayValue,
  MonthValue,
  DayNumber,
  YearValue,
  Culture,
  Status
} from "../type-alias";
export class PersianDateUtil implements IDateUtil {
  readonly persianDate: any;
  readonly lidConvertor = {
    1: "fa",
    2: "en",
  };
  constructor() {
    this.persianDate = require("persian-date");
  }
  getMonthName(month: MonthValue, culture: Culture, lid: Lid): string {
    return new this.persianDate([month.year, month.month, 1])
      .toLocale(this.lidConvertor[lid])
      .format("MMMM");
  }
  getDaysNumber(month: MonthValue, culture: Culture): DayNumber {
    return new this.persianDate([month.year, month.month, 1])
      .toLocale(culture)
      .daysInMonth();
  }
  getDayName(day: DayValue, culture: Culture, lid: Lid): string {
    return new this.persianDate([day.year, day.month, day.day])
      .toLocale(culture)
      .format("dddd");
  }
  getBasisDayId(day: DayValue): number {
    return 0;
  }
  getWeekday(day: DayValue, culture: Culture): number {
    return (
      new this.persianDate([day.year, day.month, day.day])
        .toLocale(culture)
        .day() - 1
    );
  }
  getIsHoliday(day: DayValue, culture: Culture): boolean {
    let weekday =
      new this.persianDate([day.year, day.month, day.day])
        .toLocale(culture)
        .day() - 1;
    if (weekday == 6) {
      return true;
    } else {
      return false;
    }
  }
  getIsLeapYear(year: YearValue, Culture: Culture): boolean {
    return new this.persianDate([year.year, 12, 1])
      .toLocale(Culture)
      .isLeapYear();
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
    var now = new this.persianDate();
    var basisCoreObjToday: DayValue = {
      year: now.year(),
      month: now.month(),
      day: now.date(),
    };
    return basisCoreObjToday;
  }
  getDayNames(lid: Lid, culture:Culture): string[] {
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
  getDayShortNames(lid: Lid , culture:Culture): string[] {
    let weekName: string[] =
      lid == 1
        ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekName;
  }
  nextMonth(month: Month, culture: Culture): MonthValue {
    return null;
  }
  prevMonth(month: Month, culture: Culture): MonthValue {
    return null;
  }
  getIsToday(day: DayValue): boolean {
    return true;
  }
  convertToGregorian(day : MonthValue ) : DayValue{
    return null
  }
  convertToJalali(day : MonthValue ) : DayValue{
    return null
  }
  getGregorianDaysNumber(day : DayValue) : DayNumber{
    return null
  }
  getGregorianMonthsName(month : MonthValue): string{
    return null
  }
  getJalaliMonthsName(month : MonthValue): string{
    return null
  }
  getJalaliDaysNumber(day : DayValue ) : DayNumber{
    return null
  }
  nextYear(month: Month, culture: Culture): MonthValue{
    return null
  }
  prevYear(month: Month, culture: Culture): MonthValue{
    return null
  }
  getRangeForDate(day : DayValue , status : Status , count: number ) : DayValue{
    return null
  }
  getCurrentYear(day:DayValue ,  culture : Culture) : number {
    return null
  }
  convertToGregorianFullDate(day : DayValue ) : DayValue{
    return null
  }
}
