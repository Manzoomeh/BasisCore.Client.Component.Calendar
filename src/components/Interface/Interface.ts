import {
  Lid,
  Culture,
  DateUtilProvider,
  ReminderType,
  Type
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
  catid : number
}

export interface ICatNote{
  id : number , 
  color : string,
  count: string,
  title: string
}

export interface ICalenderOptions {
  displayNote?: boolean;
  dateProvider?: DateUtilProvider;
  culture?: Culture;
  secondCulture?: Culture;
  lid?: Lid;
  dmnid? :number;
  baseUrl? : object,
  labels? : object , 
  theme? : string
  
}
export interface IDatePickerOptions {
  dateProvider?: DateUtilProvider;
  culture?: Culture;  
  lid?: Lid;
  todayButton?: boolean;
  yearsList? : boolean ; 
  monthList? : boolean;
  rangeDates? : boolean;
  switchType?: boolean;
  secondCulture?: Culture; theme?: string,
  type?: Type 
}
