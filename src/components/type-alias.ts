export declare type YearValue = {
  year: number;
};

export declare type MonthValue = YearValue & {
  month: MonthNumber;
};
export declare type DayValue = MonthValue & {
  day: DayNumber;
};
export declare type Lid = 1 | 2;
export declare type MonthNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;
export declare type DayNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31;
export declare type Culture = "fa" | "en";
export declare type Level = "user" | "service";
export declare type DateUtilProvider = "basisCalendar" | "persianCalendar";
export enum ReminderType {
  none,
  email,
  sms,
}

export declare type Type = "load" | "click";
export declare type Mode = "desktop" | "mobile";
export declare type Status = "before" | "after";