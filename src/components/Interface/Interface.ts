import {
  Lid,
  Culture,
  DateUtilProvider,
  ReminderType,
  Type,
  Mode,
  Level,
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
  catid: number;
  creator: number;
  creatoruser: number;
  sharinginfo?: Iownerinfo;
}

export interface Iownerinfo {
  name: string;
  id?: number;
}
export interface ICatNote {
  id: number;
  color: string;
  count: string;
  title: string;
}

export interface ILabels {
  todayTitle: string;
  titrTitle: string;
  categoryTitle: string;
  noteTitle: string;
  submitKeyTitle: string;
  timeTitle: string;
  emptyNoteList: string;
  editMenuTitle: string;
  deleteMenuTitle: string;
  shareMenuTitle: string;
  deleteTextTitle: string;
  cancelKeyTitle: string;
  shareTextTitle: string;
  deleteKeyTitle: string;
  shareBoxTitle: string;
  reminderMenuTitle: string;
  dateViewNote: string;
  sharingViewNote: string;
  timeViewNote: string;
  categoryViewNote: string;
  reminderViewNote: string;
  reminderErrorForLastDays: string;
  reminderCount: string;
  reminderTitle: string;
  forme: string;
  forall: string;
  email: string;
  sms: string;
  day: string;
  hour: string;
  minute: string;
  viewMenuTitle: string;
  sharingSuccessMessage: string;
  sharingrepeatMessage: string;
  setTimeForReminderMessage: string;
  errorMessage: string;
  successMessage: string;
  noGrouoForReciver: string;
  amLabel: string;
  pmLabel: string;
  noCategoryError: string;
  repeatUser: string;
  sharingErrorWithOwner: string;
  wrongUser: string;
  before: string;
  for: string;
  me: string;
  all: string;
  SharingBy: string;
}

export interface ICalenderOptions {
  displayNote?: boolean;
  dateProvider?: DateUtilProvider;
  culture?: Culture;
  secondCulture?: Culture;
  lid?: Lid;
  dmnid?: number;
  baseUrl?: object;
  labels?: ILabels;
  sourceid?: string;
  theme?: string;
  mode?: Mode;
  style?: string;
  level?: Level;
}
export interface IDatePickerOptions {
  dateProvider?: DateUtilProvider;
  culture?: Culture;
  lid?: Lid;
  todayButton?: boolean;
  yearsList?: boolean;
  monthList?: boolean;
  rangeDates?: boolean;
  isFilter?: boolean;

  switchType?: boolean;
  secondCulture?: Culture;
  theme?: string;
  type?: Type;
  sourceid?: string;
  mode?: Mode;
  style?: string;
  action?: IActionCallback;
  disabledPrevButton?: boolean;
  rangeDatesSeparated?: boolean;
}
export type IActionCallback = (element: HTMLElement) => any;
