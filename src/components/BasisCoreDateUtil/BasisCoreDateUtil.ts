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
  Status
} from "../type-alias";
export class BasisCoreDateUtil implements IDateUtil {
  json;
  readonly sMonthsNameCultureEnLangFa: string[] = [
    "",
    "ژانویه",
    "فوریه",
    "مارس",
    "آپریل",
    "می",
    "ژوئن",
    "جولای",
    "آگوست",
    "سپتامبر",
    "اکتبر",
    "نوامبر",
    "دسامبر",
   
  ];
  readonly sMonthsNameCultureEn: string[] = [
    "",    
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
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
  readonly weeksNameEn:string[]= [
    "",    
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
  ]
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
    } else if (year > 1800 && year < 3000 && day) {
      return this.json.find((item) => {
        return item.nyear == year && item.mmonth == month && item.mdate == day;
      });
    }
    else if (year > 1800 && year < 3000 && !day) {
      var filtered = this.json.filter(function (element) {
        return element.nyear == year && element.mmonth == month;
      });
      return filtered;
    } 
  }
  getObjWithId(id: number) {
    var filtered = this.json.find((item) => {
        return item.id == id;
      });
    return filtered
  }
  getMonthName(month: MonthValue, culture: Culture, lid: Lid): string {
   
    if(culture == "fa"){
      let sMonth = this.getObj(month.year, month.month, 1).smonth;
      if (lid == 1) {
        return this.sMonthsNameFa[sMonth];
      } else if (lid == 2) {
        return this.sMonthsNameEn[sMonth];
      }
    }
    if(culture == "en"){
      let sMonth = this.getObj(month.year, month.month, 1).mmonth;
      if (lid == 1) {
        return this.sMonthsNameCultureEnLangFa[sMonth];
      } else if (lid == 2) {
        return this.sMonthsNameCultureEn[sMonth];
      }
    }
    
  }
  getDaysNumber(month: MonthValue, culture: Culture): DayNumber {
    let sMonth = this.getObj(month.year, month.month).length;
    return sMonth as DayNumber;
  }
  getDayName(day: DayValue, culture: Culture, lid: Lid): string {
    let weekday = this.getObj(day.year, day.month, day.day).weekday;
    if(culture == "en"){
      return this.weeksNameEn[weekday];
    }
    else if (lid == 1) {
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
    let startYear = false
    for(var j = from.year ; j <= to.year ; j++){
      if(startYear == true){
        from.month = 1
      }
      if(from.year == to.year){
        for (var i = from.month; i <= to.month; i++) {
          months.push({ year: j, month: i });
        }
      }
      else if(from.year < to.year && j != to.year){
        for (var i = from.month; i <= 12; i++) {
          months.push({ year: j, month: i });
          if (i == 12) {
            startYear = true
            break
          }
        }
      }
      else if(from.year < to.year && j == to.year){        
        for (var i = from.month; i <= to.month; i++) {
          months.push({ year: j, month: i });
          if (i == 12) {
            startYear = true
            break
          }
        }
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
  getDayShortNames(lid: Lid , culture : Culture): string[] {
    
      if(culture == "fa"){
        var weekName: string[] = lid == 1
        ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      }
      else{
        var weekName: string[]= ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      }
      
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
  convertToGregorian(day : MonthValue ) : DayValue{
    const basisDate = this.getObj(day.year, day.month, 1);
    var gregorianDate: DayValue = {
      year: basisDate.nyear,
      month: basisDate.mmonth,
      day: basisDate.mdate,
    };
    return gregorianDate
  }
  convertToJalali(day : MonthValue ) : DayValue{
    const basisDate = this.getObj(day.year, day.month, 1);
    var jalaliDate: DayValue = {
      year: basisDate.syear,
      month: basisDate.smonth,
      day: basisDate.sdate,
    };
    return jalaliDate;
  }
  getGregorianDaysNumber(day : DayValue ) : DayNumber{
    const basisDate = this.getObj(day.year, day.month, day.day);
    return basisDate.mdate
  }
  getGregorianMonthsName(month : MonthValue): string{
    const first = this.getObj(month.year, month.month,1).mmonth;
    const last = this.getObj(month.year, month.month,28).mmonth;
    return this.sMonthsNameCultureEn[first] + " - " + this.sMonthsNameCultureEn[last]
  }
  getJalaliMonthsName(month : MonthValue): string{
    const first = this.getObj(month.year, month.month,1).smonth;
    const last = this.getObj(month.year, month.month,28).smonth;
    return this.sMonthsNameFa[first] + " - " + this.sMonthsNameFa[last]
  }
  getJalaliDaysNumber(day : DayValue ) : DayNumber{
    const basisDate = this.getObj(day.year, day.month, day.day);
    return basisDate.sdate
  }
  nextYear(month: Month, culture: Culture): MonthValue{
    let retVal: MonthValue;
    let nextMonth: MonthNumber = (month.value.month + 1) as MonthNumber;
    let currentYear: number = month.value.year + 1 ;
    if (nextMonth > 12) {
      currentYear++;
      nextMonth = 1;
    }
    retVal = { year: currentYear, month: nextMonth };
    return retVal;
  }
  prevYear(month: Month, culture: Culture): MonthValue{
    let retVal: MonthValue;
    let nextMonth: MonthNumber = (month.value.month + 1) as MonthNumber;
    let currentYear: number = month.value.year - 1 ;
    if (nextMonth > 12) {
      currentYear++;
      nextMonth = 1;
    }
    retVal = { year: currentYear, month: nextMonth };
    return retVal;
  }
  getRangeForDate(day : DayValue , status : Status , count: number ) : DayValue{
    if(status == "after"){
      const calculatedDateId = this.getObj(day.year, day.month , day.day)
      const calculatedDate = this.getObjWithId(calculatedDateId.id + count)
      return {
        year : calculatedDate.syear,
        month : calculatedDate.smonth,
        day : calculatedDate.sdate
      }
    }
    else if(status == "before"){
      const calculatedDateId = this.getObj(day.year, day.month , day.day)
      const calculatedDate = this.getObjWithId(calculatedDateId.id - count)
      return {
        year : calculatedDate.syear,
        month : calculatedDate.smonth,
        day : calculatedDate.sdate
      }
    }
    else{
      return null
    }
  }
  getCurrentYear(day:DayValue ,culture : Culture) : number {
    const currentYear = this.getObj(day.year, day.month , day.day)
    return currentYear.nyear
  
  }
}
