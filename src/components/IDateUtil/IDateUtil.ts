import {
  Lid,
  DayValue,
  MonthValue,
  DayNumber,
  YearValue,
  Culture,
  Status
} from "../type-alias";
import { Month } from "../Month/Month";
import { Day } from "../Day/Day";

export interface IDateUtil {
  getMonthName(month: MonthValue, culture: Culture, lid: Lid): string;
  getDaysNumber(month: MonthValue, culture: Culture): DayNumber;
  getWeekday(day: DayValue, culture: Culture): number;
  getDayName(day: DayValue, culture: Culture, lid: Lid): string;
  getBasisDayId(day: DayValue): number;
  getIsHoliday(day: DayValue, culture: Culture): boolean;
  getIsLeapYear(year: YearValue, culture: Culture): boolean;
  getDayNames(lid: Lid , culture : Culture): string[];
  getDayShortNames(lid: Lid , culture:Culture): string[];
  getMonthValueList(from: DayValue, to: DayValue): MonthValue[];
  getCurrentDate(): DayValue;
  getIsToday(day: DayValue): boolean;
  nextMonth(month: Month, culture: Culture): MonthValue;
  nextYear(month: Month, culture: Culture): MonthValue;
  prevMonth(month: Month, culture: Culture): MonthValue;
  prevYear(month: Month, culture: Culture): MonthValue;
  convertToGregorian(day : MonthValue ) : DayValue
  convertToJalali(day : MonthValue ) : DayValue
  getGregorianDaysNumber(day : DayValue ) : DayNumber
  getGregorianMonthsName(month : MonthValue): string
  getJalaliDaysNumber(day : DayValue ) : DayNumber
  getJalaliMonthsName(month : MonthValue): string
  getRangeForDate(day : DayValue , status : Status , count: number ) : DayValue
  getCurrentYear(day:DayValue ,  culture : Culture) : number
  convertToGregorianFullDate(day : DayValue ) : DayValue
  getBasisToDayId (day : DayValue): number
}
