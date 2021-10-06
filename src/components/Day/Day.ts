import { Month } from "../Month/Month";
import { DayValue, DayNumber } from "../type-alias";
export class Day {
  readonly month: Month;
  readonly value: DayNumber;
  readonly id: number;
  readonly dayOfWeek: number;
  readonly isHoliday: boolean;
  readonly isToday: boolean;
  readonly dateId: number;
  readonly currentDay: DayValue;
  //dayName: string;
  public constructor(owner: Month, value: DayNumber) {
    this.month = owner;
    this.value = value;
    this.currentDay = {
      year: this.month.value.year,
      month: this.month.value.month,
      day: this.value,
    };
    this.dayOfWeek = this.month.range.dateUtil.getWeekday(
      this.currentDay,
      this.month.range.options.culture
    );
    this.isHoliday = this.month.range.dateUtil.getIsHoliday(
      this.currentDay,
      this.month.range.options.culture
    );
    this.dateId = this.month.range.dateUtil.getBasisDayId(this.currentDay);
    this.isToday = this.month.range.dateUtil.getIsToday(this.currentDay);
  }
  getDayName() {
    return this.month.range.dateUtil.getDayName(
      this.currentDay,
      this.month.range.options.culture,
      this.month.range.options.lid
    );
  }
}
