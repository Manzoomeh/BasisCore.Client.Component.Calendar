import {
  Lid,
  Culture,
  DateUtilProvider,
  ReminderType,
  Type,
  Mode,
  Level
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
  catid : number,
  creator : number,
  creatoruser : number
  ownerinfo? : Iownerinfo
}

export interface Iownerinfo{
  name : string
}
export interface ICatNote{
  id : number , 
  color : string,
  count: string,
  title: string
}

export interface ILabels{
  todayTitle : string,
  titrTitle:string,
  categoryTitle : string,
  noteTitle : string,
  submitKeyTitle : string,
  timeTitle : string,
  emptyNoteList : string,
  editMenuTitle :string,
  deleteMenuTitle:string,
  shareMenuTitle:string,
  deleteTextTitle :string,
  cancelKeyTitle : string,
  shareTextTitle : string,
  deleteKeyTitle:string,
  shareBoxTitle : string

}


export interface ICalenderOptions {
  displayNote?: boolean;
  dateProvider?: DateUtilProvider;
  culture?: Culture;
  secondCulture?: Culture;
  lid?: Lid;
  dmnid? :number;
  baseUrl? : object,
  labels? : ILabels , 
  theme? : string,
  mode?: Mode,
  style?: string,
  level? : Level
  
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
  type?: Type ,
  sourceid? :string,
  mode?: Mode,
  style?: string
}
