import {
  Lid,
  DayValue,
  MonthValue,
  DayNumber,
  YearValue,
  MonthNumber,
  Culture,
  DateUtilProvider,
  ReminderType,
} from "../type-alias";
export interface INote {
  id: number;
  dateid: number;
  time: string;
  note: string;
  description: string;
  color: string;
  isNew: boolean;
  hasReminder: boolean;
  reminderType: ReminderType;
}

export interface ICalenderOptions {
  displayNote?: boolean;
  dateProvider?: DateUtilProvider;
  culture?: Culture;
  secondCulture?: Culture;
  lid?: Lid;
  dmnid? :number;
  baseUrl? : object,
  labels? : object
  
}
export interface IDatePickerOptions {
  dateProvider?: DateUtilProvider;
  culture?: Culture;
  secondCulture?: Culture;
  lid?: Lid;
  todayButton?: boolean;
  selectDate?: boolean;
  yearsList? : boolean ; 
  monthList? : boolean;
  rangeDates? : boolean;
}
