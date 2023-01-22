import { Month } from "../Month/Month";
import { DayValue, DayNumber } from "../type-alias";
export class Day {
  readonly month: Month;
  readonly value: DayNumber;
  readonly secondValue : DayNumber;
  readonly id: number;
  readonly dayOfWeek: number;
  readonly isHoliday: boolean;
  readonly isToday: boolean;
  readonly dateId: number;
  readonly currentDay: DayValue;
  readonly mcurrentDay: DayValue;
  readonly isPast : boolean = false
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
    this.mcurrentDay = this.month.range.dateUtil.convertToGregorianFullDate(this.currentDay)
    if(this.month.range.options.secondCulture && this.month.range.options.secondCulture == "en"){
      this.secondValue =this.month.range.dateUtil.getGregorianDaysNumber(this.currentDay)
    }
    else if (this.month.range.options.secondCulture && this.month.range.options.secondCulture == "fa"){
      this.secondValue =this.month.range.dateUtil.getJalaliDaysNumber(this.currentDay)

    }    
    this.isHoliday = this.month.range.dateUtil.getIsHoliday(
      this.currentDay,
      this.month.range.options.culture
    );
    this.dateId = this.month.range.dateUtil.getBasisDayId(this.currentDay);
    this.isToday = this.month.range.dateUtil.getIsToday(this.currentDay);
    
    if( this.isToday == true){
      this.month.range.todayId = this.dateId
    }

    if( this.month.range.todayId  ==  0 ){
      this.isPast = true
    }
  }
  getDayName() {
    return this.month.range.dateUtil.getDayName(
      this.currentDay,
      this.month.range.options.culture,
      this.month.range.options.lid
    );
 
  }
}
