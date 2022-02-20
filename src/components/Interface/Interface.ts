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
  secondCulture?: Culture;
<<<<<<< HEAD
  theme?: string,
  type?: Type 
=======
>>>>>>> 42c793301a53ca31b0cb476f7ea2d226395f9d0c
}
