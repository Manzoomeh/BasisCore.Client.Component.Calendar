import { DateRange } from "../calendar";
import { DatePicker } from "../DatePicker";
import { Day } from "../Day/Day";
import {
  Lid,
  DayValue,
  MonthValue,
  DayNumber,
  YearValue,
  MonthNumber,
} from "../type-alias";
export class Month {
  readonly range: DateRange | DatePicker;
  readonly value: MonthValue;
  readonly days: Array<Day>;
  readonly monthName: string;
  readonly secondMonthName : string ; 
  readonly isLeapYear: boolean;
  readonly dayInMonth: DayNumber;
  readonly firstDayInMonth: number;
  readonly lastDayInMonth: number;
  readonly currentDate: DayValue;
  readonly currentYear : number;
  public todayId : number=0
  public constructor(owner: DateRange | DatePicker, value: MonthValue) {
    this.range = owner;
    this.value = value;
   
    const firstDay: DayValue = {
      year: this.value.year,
      month: this.value.month,
      day: 1,
    };
   
    const year: YearValue = { year: this.value.year };
    this.monthName = this.range.dateUtil.getMonthName(
      this.value,
      this.range.options.culture,
      this.range.options.lid
    );
    if(this.range.options.secondCulture && this.range.options.secondCulture == "en"){
      this.secondMonthName = this.range.dateUtil.getGregorianMonthsName(value)
      
    }
    else if(this.range.options.secondCulture && this.range.options.secondCulture == "fa"){
      this.secondMonthName = this.range.dateUtil.getJalaliMonthsName(value)
    }
    this.dayInMonth = this.range.dateUtil.getDaysNumber(
      this.value,
      this.range.options.culture
    );
  
    this.firstDayInMonth = this.range.dateUtil.getWeekday(
      firstDay,
      this.range.options.culture
    )

  
    this.currentYear = this.range.dateUtil.getCurrentYear( firstDay , this.range.options.culture)


    this.currentDate = this.range.dateUtil.getCurrentDate();
    if (this.firstDayInMonth == 7) {
      this.firstDayInMonth = 0;
    }
    
    let lastDay: DayValue = {
      year: this.value.year,
      month: this.value.month,
      day: this.dayInMonth,
    };
    
    this.lastDayInMonth = this.range.dateUtil.getWeekday(
      lastDay,
      this.range.options.culture
    );
    if (this.lastDayInMonth == 7) {
      this.lastDayInMonth = 0;
    }
    this.isLeapYear = this.range.dateUtil.getIsLeapYear(
      year,
      this.range.options.culture
    );
    this.days = new Array<Day>();
    for (let i = 0; i < this.dayInMonth; i++) {
      this.days.push(new Day(this, (i + 1) as DayNumber));
    }
  }
}
