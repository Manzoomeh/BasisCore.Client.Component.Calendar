import { Month } from "./Month/Month";
import {
  Culture,
  DayValue,
  MonthValue,
  ReminderType,
  catFilter,
} from "./type-alias";
import { ICalenderOptions, INote, ICatNote } from "./Interface/Interface";
import { IDateUtil } from "./IDateUtil/IDateUtil";
import { BasisCoreDateUtil } from "./BasisCoreDateUtil/BasisCoreDateUtil";
import { PersianDateUtil } from "./PersianDateUtil/PersianDateUtil";
import { UiCalendar } from "./UiCalendar/UiCalendar";
import { UiMbobile } from "./mobile/UiMobile";
import IUserDefineComponent from "../basiscore/IUserDefineComponent";
import { DatePicker } from "./DatePicker";
import { Day } from "./Day/Day";
declare const $bc: any;
export class DateRange {
  public readonly dateUtil: IDateUtil;
  public readonly months: Array<Month> = new Array<Month>();
  public readonly options: ICalenderOptions;
  private readonly monthValues: MonthValue[];
  private eventsCheck:boolean = false
  public note: INote[];
  public rKey: string;
  public wrapper: HTMLElement;
  public activeIndex: number;
  public catFilters: catFilter[] = [];
  public userId: number = 0;
  public holidayCategories = [];
  public templates: any;
  public holidays = [];
  public holidayFilters = [];
  public from: DayValue;
  public to: DayValue;
  public isFilterOpen = false;
  public todayId: number = 0;
  private endDateEvent : DayValue;
  public readonly Owner?: IUserDefineComponent;
  private runHeader: boolean = false;
  public categories: Array<ICatNote> = new Array<ICatNote>();
  private static readonly defaultCalenderOptions: Partial<ICalenderOptions> = {
    dateProvider: "basisCalendar",
    displayNote: true,
    culture: "fa",
    secondCulture: "en",
    lid: 1,
    theme: "basic",
    mode: "desktop",
    level: "user",
  };

  public constructor(
    from: DayValue,
    to: DayValue,
    options?: ICalenderOptions,
    rkey?: string,
    owner?: IUserDefineComponent
  ) {
    this.activeIndex = 0;
    this.options = { ...DateRange.defaultCalenderOptions, ...(options as any) };
    this.rKey = rkey;
    this.from = from;
    this.to = to;
    this.Owner = owner;
    this.dateUtil =
      this.options.dateProvider == "basisCalendar"
        ? new BasisCoreDateUtil()
        : new PersianDateUtil();
    this.note = new Array<INote>();

    this.monthValues = this.dateUtil.getMonthValueList(from, to);
    this.monthValues.map((x) => this.months.push(new Month(this, x)));
    this.syncHolidayCategories();

    this.getCategories();
    this.getTemplates();
  }
  async getTemplates(): Promise<void> {
    let data = await this.sendAsyncDataGetMethod(
      this.options.baseUrl["calendartemplates"]
    );
    this.templates = data as any;
  }

  public async getCategories() {
    if (this.options.displayNote == true) {
      let apiLink = this.options.baseUrl["catlist"];
      const data = await this.sendAsyncDataGetMethod(apiLink);
      this.categories = [];
      data.map((x: ICatNote) =>
        this.categories.push({
          id: x.id,
          color: x.color,
          count: x.count,
          title: x.title,
        })
      );
    }
  }
  public getRKey(): string {
    if (!this.rKey) {
      let cookie = {};
      document.cookie.split(";").forEach(function (el) {
        let [key, value] = el.split("=");
        cookie[key.trim()] = value;
      });
      this.rKey = cookie["rkey"];
    }
    return this.rKey;
  }

  public async getHolidays(fromDay? :DayValue, toDay? : DayValue,id?: number ): Promise<void> {
    

    const url =
      this.options.level == "service"
        ? this.options.baseUrl["calendareventsservice"]
        : this.options.baseUrl["calendareventsuser"];
    
    this.from.day = 1
    let fromDateId = this.dateUtil.getBasisDayId(this.from);
    if(fromDay){
      fromDateId = this.dateUtil.getBasisDayId(fromDay);
    }
    this.endDateEvent= {
      year : this.from.year,
      month : this.from.month,
      day : 30
    }
    let toDateId = this.dateUtil.getBasisDayId(this.endDateEvent)
    if(toDay){
      toDateId = this.dateUtil.getBasisDayId(toDay)
    }
    await this.holidayCategories.map(async (e,mapIndex,array) => {
     
      try {
        let res = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            from: fromDateId,
            to: toDateId,
            temid: e.id,
          }),
        });
        res = await res.json();
        //@ts-ignore
        await res.map((e) => {
          if (
            !this.holidays.find(
              (i) => i.eventID == e.eventID && e.dateID == i.dateID
            )
          ) {
            this.holidays.push(e);
           
            
          }
        });
      
      } catch {}
      if( mapIndex === array.length -1  ){
        this.runAsync()
      }
    });
    
  }

  public async getUserId(): Promise<void> {
    this.getRKey();
    const form = new FormData();
    form.append("rkey", this.rKey);
    form.append("dmnid", "30");
    let apiLink = this.options.baseUrl;
    let userIdObj = await this.sendAsyncDataGetMethod(apiLink["userid"]);
    this.userId = parseInt(userIdObj.userid);
    return null;
  }

  public async refreshNotesAsync(): Promise<void> {
    if (this.months.length > 0) {
   
      const firstDay = this.months[0].days[0];
      const lastMonth = this.months[this.months.length - 1];
      const lastDay = lastMonth.days[lastMonth.dayInMonth - 1];
      const from: DayValue = {
        year: firstDay.month.value.year,
        month: firstDay.month.value.month,
        day: firstDay.value,
      };
      const to: DayValue = {
        year: lastDay.month.value.year,
        month: lastDay.month.value.month,
        day: lastDay.value,
      };
      
      await this.syncNotesAsync(from, to);
    }
  }
  public async syncHolidayCategories(fromDay?:DayValue,toDay?: DayValue): Promise<void> {
    const url =
      this.options.level === "service"
        ? this.options.baseUrl["serviceholiday"]
        : this.options.baseUrl["userholiday"];

    const res = await fetch(url);
    const data = await res.json();
    this.holidayCategories = data.message ? [] : data;
    this.eventsCheck = true
    await this.getHolidays(fromDay , toDay);
  }
  protected async syncNotesAsync(from: DayValue, to: DayValue): Promise<void> {
    //fetch push new data to server and fetch all data from server

    const fromDateId = this.dateUtil.getBasisDayId(from);
    const toDateId = this.dateUtil.getBasisDayId(to);
    const form = new FormData();
    const useridd = await this.getUserId();
    form.append("shared", "0");
    // form.append("catid", "");
    form.append("from", `${fromDateId}`);
    form.append("to", `${toDateId}`);
    let apiLink = this.options.baseUrl["usernotes"];
    apiLink = apiLink.toString().replace("${rkey}", this.rKey);

    const data = await this.sendAsyncData(form, apiLink);
    
    this.note = [];
    data.map((x: INote) =>
      this.note.push({
        id: x.id,
        dateid: x.dateid,
        time: x.time,
        note: x.note,
        description: x.description,
        color: x.color,
        isNew: false,
        hasReminder: false,
        reminderType: ReminderType.none,
        catid: x.catid,
        creator: x.creator,
        creatoruser: x.creatoruser,
        sharinginfo: x.sharinginfo,
      })
    );
  }
  public getDayNotes(dateid: number): INote[] {
    var todayNote: INote[] = this.note.filter((x) => x.dateid == dateid);
    return todayNote;
  }
  async nextMonth(): Promise<void> {
    let nextMonthValues: MonthValue;
    this.holidays =[]
    nextMonthValues = this.dateUtil.nextMonth(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    const fromDayHoliday : DayValue = {
      year :  nextMonthValues.year,
      month : nextMonthValues.month,
      day : 1
    }
    const toDayHoliday : DayValue = {
      year :  nextMonthValues.year,
      month : nextMonthValues.month,
      day : 30
    }
    
    const checkBoxHoliday  = document.querySelectorAll("[data-holidaycheckbox]") 
    checkBoxHoliday.forEach(e => {
      if(e.getAttribute("checked") == "true"){
        const args = { id : e.getAttribute("data-id") ,title: e.getAttribute("data-title")  }
          this.onHolidayCheck(args, true) 
      }
    })
    await this.syncHolidayCategories(fromDayHoliday,toDayHoliday);
    this.runAsync();
    
  
  }
  async prevMonth(): Promise<void> {
    let nextMonthValues: MonthValue;
    nextMonthValues = this.dateUtil.prevMonth(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    const fromDayHoliday : DayValue = {
      year :  nextMonthValues.year,
      month : nextMonthValues.month,
      day : 1
    }
    const toDayHoliday : DayValue = {
      year :  nextMonthValues.year,
      month : nextMonthValues.month,
      day : 30
    }
    const checkBoxHoliday  = document.querySelectorAll("[data-holidaycheckbox]") 
    checkBoxHoliday.forEach(e => {
      if(e.getAttribute("checked") == "true"){
        const args = { id : e.getAttribute("data-id") ,title: e.getAttribute("data-title")  }
          this.onHolidayCheck(args, true) 
      }
    })
    await this.syncHolidayCategories(fromDayHoliday,toDayHoliday);
    this.runAsync();
  }
  async prevYear(): Promise<void> {
    let nextMonthValues: MonthValue;
    nextMonthValues = this.dateUtil.prevYear(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    
    this.runAsync();
  }
  async nextYear(): Promise<void> {
    let nextMonthValues: MonthValue;
    nextMonthValues = this.dateUtil.nextYear(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    this.runAsync();
  }
  async goToday(culture: Culture): Promise<void> {
    if (this.options.culture == "fa") {
      var todayMonthValues: MonthValue = {
        year: this.months[this.activeIndex].currentDate.year,
        month: this.months[this.activeIndex].currentDate.month,
      };
    } else {
      var todayMonthValues: MonthValue = {
        year: this.months[this.activeIndex].currentmDate.year,
        month: this.months[this.activeIndex].currentmDate.month,
      };
    }

    this.months[this.activeIndex] = new Month(this, todayMonthValues);
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    this.runAsync();
  }

  protected createMountHeader(): Node {
    const headerElement = document.createElement("div");
    const monthNameElement = document.createElement("div");
    const currentYear = document.createElement("div");
    const controlElement = document.createElement("div");
    const secondMonthName = document.createElement("div");
    const yearBtn = document.createElement("div");
    yearBtn.setAttribute("data-calendar-year-btn", "");
    const calendarHeader: HTMLElement = document.createElement("div");
    headerElement.setAttribute("data-calendar-Header", "");
    monthNameElement.setAttribute("data-calendar-title", "");
    controlElement.setAttribute("data-calendar-tools", "");
    secondMonthName.setAttribute("data-calendar-second-culture", "");
    currentYear.setAttribute("data-calendar-year", "");
    currentYear.textContent = " " + this.months[this.activeIndex].value.year;
    monthNameElement.textContent =
      this.months[this.activeIndex].monthName +
      " " +
      this.months[this.activeIndex].currentYear;
    secondMonthName.textContent = this.months[this.activeIndex].secondMonthName;
    //monthNameElement.appendChild(secondMonthName);
    const todayButton = document.createElement("button");
    const settingButton = document.createElement("button");
    // ????
    settingButton.addEventListener("click", (e) => {
      const UImanager = new UiCalendar(
        this,
        this.months[this.activeIndex].days[0]
      );

      UImanager.modal.openModal(UImanager.renderModalBody());
    });
    if (this.options.level == "service") {
      settingButton.setAttribute("data-calendar-setting-btn", "");
      settingButton.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0028 6C11.0636 6 12.0811 6.42143 12.8312 7.17157C13.5813 7.92172 14.0028 8.93913 14.0028 10C14.0028 11.0609 13.5813 12.0783 12.8312 12.8284C12.0811 13.5786 11.0636 14 10.0028 14C8.9419 14 7.92449 13.5786 7.17434 12.8284C6.4242 12.0783 6.00277 11.0609 6.00277 10C6.00277 8.93913 6.4242 7.92172 7.17434 7.17157C7.92449 6.42143 8.9419 6 10.0028 6ZM10.0028 8C9.47234 8 8.96363 8.21071 8.58856 8.58579C8.21348 8.96086 8.00277 9.46957 8.00277 10C8.00277 10.5304 8.21348 11.0391 8.58856 11.4142C8.96363 11.7893 9.47234 12 10.0028 12C10.5332 12 11.0419 11.7893 11.417 11.4142C11.7921 11.0391 12.0028 10.5304 12.0028 10C12.0028 9.46957 11.7921 8.96086 11.417 8.58579C11.0419 8.21071 10.5332 8 10.0028 8ZM8.00277 20C7.75277 20 7.54277 19.82 7.50277 19.58L7.13277 16.93C6.50277 16.68 5.96277 16.34 5.44277 15.94L2.95277 16.95C2.73277 17.03 2.46277 16.95 2.34277 16.73L0.342769 13.27C0.212769 13.05 0.272769 12.78 0.462769 12.63L2.57277 10.97L2.50277 10L2.57277 9L0.462769 7.37C0.272769 7.22 0.212769 6.95 0.342769 6.73L2.34277 3.27C2.46277 3.05 2.73277 2.96 2.95277 3.05L5.44277 4.05C5.96277 3.66 6.50277 3.32 7.13277 3.07L7.50277 0.42C7.54277 0.18 7.75277 0 8.00277 0H12.0028C12.2528 0 12.4628 0.18 12.5028 0.42L12.8728 3.07C13.5028 3.32 14.0428 3.66 14.5628 4.05L17.0528 3.05C17.2728 2.96 17.5428 3.05 17.6628 3.27L19.6628 6.73C19.7928 6.95 19.7328 7.22 19.5428 7.37L17.4328 9L17.5028 10L17.4328 11L19.5428 12.63C19.7328 12.78 19.7928 13.05 19.6628 13.27L17.6628 16.73C17.5428 16.95 17.2728 17.04 17.0528 16.95L14.5628 15.95C14.0428 16.34 13.5028 16.68 12.8728 16.93L12.5028 19.58C12.4628 19.82 12.2528 20 12.0028 20H8.00277ZM9.25277 2L8.88277 4.61C7.68277 4.86 6.62277 5.5 5.85277 6.39L3.44277 5.35L2.69277 6.65L4.80277 8.2C4.40277 9.37 4.40277 10.64 4.80277 11.8L2.68277 13.36L3.43277 14.66L5.86277 13.62C6.63277 14.5 7.68277 15.14 8.87277 15.38L9.24277 18H10.7628L11.1328 15.39C12.3228 15.14 13.3728 14.5 14.1428 13.62L16.5728 14.66L17.3228 13.36L15.2028 11.81C15.6028 10.64 15.6028 9.37 15.2028 8.2L17.3128 6.65L16.5628 5.35L14.1528 6.39C13.3828 5.5 12.3228 4.86 11.1228 4.62L10.7528 2H9.25277Z" fill="#004B85"/>
      </svg>
      `;
    }
    todayButton.addEventListener("click", (e) => {
      this.goToday(this.options.culture);
    });

    const todayIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17"  >
    <path fill-rule="evenodd"  clip-rule="evenodd" d="M4.65476 0C4.99008 0 5.26191 0.271827 5.26191 0.607143V1.22458C5.79783 1.21427 6.38828 1.21428 7.03766 1.21429H10.3671C11.0165 1.21428 11.6069 1.21427 12.1429 1.22458V0.607143C12.1429 0.271827 12.4147 0 12.75 0C13.0853 0 13.3571 0.271827 13.3571 0.607143V1.27669C13.5676 1.29273 13.7668 1.3129 13.9554 1.33825C14.9045 1.46586 15.6727 1.73471 16.2785 2.34053C16.8843 2.94635 17.1532 3.71454 17.2808 4.66365C17.3216 4.96697 17.3489 5.298 17.3673 5.65863C17.3915 5.72419 17.4048 5.79507 17.4048 5.86905C17.4048 5.92517 17.3971 5.9795 17.3829 6.03109C17.4048 6.6803 17.4048 7.41746 17.4048 8.25195V9.96233C17.4048 11.45 17.4048 12.6284 17.2808 13.5506C17.1532 14.4997 16.8843 15.2679 16.2785 15.8738C15.6727 16.4796 14.9045 16.7484 13.9554 16.876C13.0332 17 11.8548 17 10.3671 17H7.03767C5.54996 17 4.37158 17 3.44936 16.876C2.50026 16.7484 1.73206 16.4796 1.12624 15.8738C0.520427 15.2679 0.25157 14.4997 0.123967 13.5506C-2.27988e-05 12.6284 -1.25745e-05 11.45 2.60355e-07 9.96234V8.25195C-6.9291e-06 7.41746 -1.32978e-05 6.68031 0.0218644 6.03109C0.00761404 5.9795 5.49864e-07 5.92517 5.49864e-07 5.86905C5.49864e-07 5.79507 0.0132313 5.72418 0.0374556 5.65862C0.0558201 5.29799 0.0831865 4.96697 0.123967 4.66365C0.25157 3.71454 0.520427 2.94635 1.12624 2.34053C1.73206 1.73471 2.50026 1.46586 3.44936 1.33825C3.63792 1.3129 3.83719 1.29273 4.04762 1.27669V0.607143C4.04762 0.271827 4.31945 0 4.65476 0ZM1.22488 6.47619C1.21454 7.00459 1.21429 7.60627 1.21429 8.29762V9.91667C1.21429 11.4603 1.21558 12.5569 1.32742 13.3888C1.43692 14.2033 1.64228 14.6725 1.98487 15.0151C2.32747 15.3577 2.79671 15.5631 3.61116 15.6726C4.44308 15.7844 5.53972 15.7857 7.08333 15.7857H10.3214C11.865 15.7857 12.9617 15.7844 13.7936 15.6726C14.6081 15.5631 15.0773 15.3577 15.4199 15.0151C15.7625 14.6725 15.9678 14.2033 16.0773 13.3888C16.1892 12.5569 16.1905 11.4603 16.1905 9.91667V8.29762C16.1905 7.60627 16.1902 7.00459 16.1799 6.47619H1.22488ZM16.1244 5.2619H1.28041C1.29337 5.10859 1.30888 4.96338 1.32742 4.82545C1.43692 4.011 1.64228 3.54176 1.98487 3.19916C2.32747 2.85656 2.79671 2.65121 3.61116 2.54171C4.44308 2.42986 5.53972 2.42857 7.08333 2.42857H10.3214C11.865 2.42857 12.9617 2.42986 13.7936 2.54171C14.6081 2.65121 15.0773 2.85656 15.4199 3.19916C15.7625 3.54176 15.9678 4.011 16.0773 4.82545C16.0959 4.96338 16.1114 5.10859 16.1244 5.2619ZM12.3452 11.3333C12.0099 11.3333 11.7381 11.6052 11.7381 11.9405C11.7381 12.2758 12.0099 12.5476 12.3452 12.5476C12.6806 12.5476 12.9524 12.2758 12.9524 11.9405C12.9524 11.6052 12.6806 11.3333 12.3452 11.3333ZM10.5238 11.9405C10.5238 10.9345 11.3393 10.119 12.3452 10.119C13.3512 10.119 14.1667 10.9345 14.1667 11.9405C14.1667 12.9464 13.3512 13.7619 12.3452 13.7619C11.3393 13.7619 10.5238 12.9464 10.5238 11.9405Z" fill="#fff"/>
    </svg>
    `;
    const todayText = document.createElement("span");
    todayText.innerText = this.options.labels.todayTitle;
    todayButton.setAttribute("data-calendar-today-btn", "");
    todayButton.innerHTML = todayText.innerText + todayIcon;
    if (this.options.mode == "mobile") {
      todayButton.innerHTML = "";
      todayButton.removeAttribute("data-calendar-today-btn");
      todayButton.setAttribute("data-calendar-today-btn-mobile", "");
      todayButton.innerHTML = todayIcon;
    }
    const nextButton = document.createElement("button");
    const prevButton = document.createElement("button");
    const nextYear = document.createElement("button");
    const prevYear = document.createElement("button");
    const titleWrapper = document.createElement("div");
    nextButton.addEventListener("click",async (e) => {
      await this.nextMonth();
    });
    prevButton.addEventListener("click", (e) => {
      this.prevMonth();
    });
    nextYear.addEventListener("click", (e) => {
      this.nextYear();
    });
    prevYear.addEventListener("click", (e) => {
      this.prevYear();
    });
    nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="9" viewBox="0 0 6 9" fill="none">
    <path d="M4.42857 1.5L1 4.5L4.42857 7.5" stroke="#767676" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `;
    prevButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="9" viewBox="0 0 6 9" fill="none">
    <path d="M1.42885 1.5L4.85742 4.5L1.42885 7.5" stroke="#767676" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `;
    nextYear.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="20" height="20" viewBox="0 0 256 256" xml:space="preserve">

    <defs>
    </defs>
    <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
      <path d="M 7.161 90 c -1.792 0 -3.583 -0.684 -4.95 -2.05 c -2.734 -2.734 -2.734 -7.166 0 -9.9 L 35.262 45 L 2.211 11.95 c -2.734 -2.733 -2.734 -7.166 0 -9.899 c 2.733 -2.733 7.166 -2.733 9.899 0 l 38 38 c 2.733 2.733 2.733 7.166 0 9.9 l -38 38 C 10.744 89.316 8.953 90 7.161 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill:#767676; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
      <path d="M 44.839 90 c -1.792 0 -3.583 -0.684 -4.95 -2.05 c -2.734 -2.734 -2.734 -7.166 0 -9.9 L 72.939 45 l -33.05 -33.05 c -2.734 -2.733 -2.734 -7.166 0 -9.899 c 2.733 -2.732 7.166 -2.733 9.9 0 l 38 38 c 2.733 2.733 2.733 7.166 0 9.9 l -38 38 C 48.422 89.316 46.63 90 44.839 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #767676; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
    </g>
    </svg>`;
    prevYear.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="20" height="20" viewBox="0 0 256 256" xml:space="preserve">

    <defs>
    </defs>
    <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
      <path d="M 7.161 90 c -1.792 0 -3.583 -0.684 -4.95 -2.05 c -2.734 -2.734 -2.734 -7.166 0 -9.9 L 35.262 45 L 2.211 11.95 c -2.734 -2.733 -2.734 -7.166 0 -9.899 c 2.733 -2.733 7.166 -2.733 9.899 0 l 38 38 c 2.733 2.733 2.733 7.166 0 9.9 l -38 38 C 10.744 89.316 8.953 90 7.161 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill:#767676; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
      <path d="M 44.839 90 c -1.792 0 -3.583 -0.684 -4.95 -2.05 c -2.734 -2.734 -2.734 -7.166 0 -9.9 L 72.939 45 l -33.05 -33.05 c -2.734 -2.733 -2.734 -7.166 0 -9.899 c 2.733 -2.732 7.166 -2.733 9.9 0 l 38 38 c 2.733 2.733 2.733 7.166 0 9.9 l -38 38 C 48.422 89.316 46.63 90 44.839 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #767676; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
    </g>
    </svg>`;
    nextButton.setAttribute("data-calendar-next", "");
    nextButton.setAttribute("data-tree-tooltip", this.options.labels.nextLabel);
    prevButton.setAttribute("data-calendar-prev", "");
    prevButton.setAttribute("data-tree-tooltip", this.options.labels.prevMonth);
    nextYear.setAttribute("data-calendar-next-year", "");
    prevYear.setAttribute("data-calendar-prev-year", "");
    titleWrapper.setAttribute("data-bc-title-wrapper", "");
    calendarHeader.setAttribute("bc-calendar-calendar-header", "");
    calendarHeader.appendChild(controlElement);
    const rightSideBtns = document.createElement("div");
    rightSideBtns.setAttribute("data-calendar-right-btns", "");
    const container = document.createElement("div");
    const nextYearIcon = document.createElement("div");
    const prevYearIcon = document.createElement("div");
    prevYearIcon.addEventListener("click", () => {
      this.prevYear().then(() => {
        yearBtn.click();
      });
    });
    nextYearIcon.addEventListener("click", () => {
      this.nextYear().then(() => {
        yearBtn.click();
      });
    });

    nextYearIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none" >
    <path d="M1.28571 1L7 6L1.28571 11" stroke="#5F5F5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    prevYearIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
    <path d="M6.71429 1L1 6L6.71429 11" stroke="#5F5F5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const empt = document.createElement("div");
    container.setAttribute("data-calendar-date-modal", "");
    container.appendChild(empt);

    titleWrapper.appendChild(nextButton);
    titleWrapper.appendChild(yearBtn);
    titleWrapper.appendChild(prevButton);
    rightSideBtns.appendChild(todayButton);
    rightSideBtns.appendChild(titleWrapper);
    yearBtn.innerHTML = monthNameElement.outerHTML;
    //headerElement.appendChild(calendarHeader);
    yearBtn.addEventListener("click", (e) => {
      if (yearBtn.hasAttribute("data-calendar-year-btn")) {
        yearBtn.removeAttribute("data-calendar-year-btn");
        yearBtn.setAttribute("data-calendar-year-btn-selected", "");

        container.style.display = "flex";
        container.style.top =
          String(yearBtn.offsetTop + yearBtn.offsetHeight - 20) + "px";
        container.style.left =
          String(
            yearBtn.offsetLeft + yearBtn.offsetWidth - container.offsetWidth
          ) + "px";
      } else {
        yearBtn.removeAttribute("data-calendar-year-btn-selected");
        yearBtn.setAttribute("data-calendar-year-btn", "");
        container.style.display = "none";
      }
    });
    const filterBtn = document.createElement("div");
    filterBtn.innerHTML =
      `<svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.0013 16.88C11.0413 17.18 10.9413 17.5 10.7113 17.71C10.3213 18.1 9.69132 18.1 9.30132 17.71L5.29132 13.7C5.06132 13.47 4.96132 13.16 5.00132 12.87V7.75L0.211323 1.62C-0.128677 1.19 -0.0486774 0.56 0.381323 0.22C0.571323 0.08 0.781322 0 1.00132 0H15.0013C15.2213 0 15.4313 0.08 15.6213 0.22C16.0513 0.56 16.1313 1.19 15.7913 1.62L11.0013 7.75V16.88ZM3.04132 2L7.00132 7.06V12.58L9.00132 14.58V7.05L12.9613 2H3.04132Z" fill="#004b85"/>
      </svg>
      ` +
      this.options.labels?.filter ?  this.options.labels.filter  :   "فیلتر"
      

    if (this.isFilterOpen) {
      filterBtn.setAttribute("data-calendar-filter-btn-selected", "");
    } else {
      filterBtn.setAttribute("data-calendar-filter-btn", "");
    }
    filterBtn.addEventListener("click", () => {
      this.isFilterOpen = !this.isFilterOpen;
      this.runAsync();
    });

    headerElement.appendChild(filterBtn);
    headerElement.appendChild(settingButton);

    headerElement.appendChild(rightSideBtns);
    headerElement.appendChild(container);
    const picker = new DatePicker(
      this.from,
      this.to,
      {
        dateProvider: "basisCalendar",
        culture: this.options.culture,
        lid: this.options.lid,
        yearsList: true,
        monthList: true,
        switchType: false,
        rangeDates: false,
        theme: "basic",
        isFilter: true,
        mode: "desktop",
        style: this.options.datepickerStyle,
        sourceid: "db.form",
        type: "load",
        pickerType: "action",
      },
      this
    );
    picker.createUIAsync(empt);
    return headerElement;
  }
  protected generateDaysName(): Node {
    const daysName = this.dateUtil.getDayNames(
      this.options.lid,
      this.options.culture
    );
    const secondDayName = this.dateUtil.getDayNames(2, "en");
    const weekNameWrapper: Element = document.createElement("div");
    weekNameWrapper.setAttribute("data-calendar-day-names", "");
    for (const index in daysName) {
      let enIndex = parseInt(index) - 1;
      if (enIndex == -1) {
        enIndex = 6;
      }
      const dayWrapper: Element = document.createElement("div");
      const faSpan: Element = document.createElement("span");
      const enSpan: Element = document.createElement("span");
      dayWrapper.setAttribute("data-calendar-day-name", "");
      dayWrapper.setAttribute("data-sys-text", "");
      dayWrapper.setAttribute("data-sys-bg", "");
      enSpan.setAttribute("data-calendar-second-day-name", "");
      enSpan.setAttribute("data-sys-text", "");
      faSpan.setAttribute("data-calendar-first-day-name", "");
      faSpan.textContent = daysName[index];
      enSpan.textContent = secondDayName[enIndex];
      dayWrapper.appendChild(faSpan);
      if(this.options.culture == "fa"){
        dayWrapper.appendChild(enSpan);
      }
      
      weekNameWrapper.appendChild(dayWrapper);
    }
    return weekNameWrapper;
  }
  protected createMountBody(): Node {
    const monthsContainer = document.createElement("div");
    const modal = document.createElement("div");
    const modalBG = document.createElement("div");
    const modalheader = document.createElement("div");
    const modalheaderRow = document.createElement("div");
    const modalTitle = document.createElement("h2");
    const modalCloseIcon = document.createElement("div");
    const modalBody = document.createElement("div");
    const modalSubmitBtn = document.createElement("button");
    const modalFooter = document.createElement("div");
    modalTitle.innerText = this.options.labels.setting
    modal.setAttribute("data-sys-modal", "");
    modalBG.setAttribute("data-sys-modal-bg", "");
    modalheader.setAttribute("data-sys-modal-header", "");
    modalheaderRow.setAttribute("data-sys-modal-header-row", "");
    modalTitle.setAttribute("data-sys-modal-header-title", "");
    modalCloseIcon.setAttribute("data-sys-modal-header-close", "");
    modalFooter.setAttribute("data-sys-modal-footer", "");
    modalSubmitBtn.setAttribute("data-sys-button", "");
    modalBody.setAttribute("data-sys-modal-body", "");
    modalCloseIcon.innerHTML = ` <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="15"
    style="cursor: pointer"
    viewBox="0 0 14 15"
    fill="none"
  >
    <path
      opacity="0.8"
      d="M8.05223 7.49989L13.3519 13.3409C13.6968 13.7208 13.6968 14.3351 13.3519 14.7151C13.0072 15.095 12.4498 15.095 12.1051 14.7151L6.80521 8.87405L1.50552 14.7151C1.16063 15.095 0.603404 15.095 0.258671 14.7151C-0.0862237 14.3351 -0.0862237 13.7208 0.258671 13.3409L5.55836 7.49989L0.258671 1.65889C-0.0862237 1.27896 -0.0862237 0.66466 0.258671 0.284728C0.430473 0.0952063 0.656366 0 0.882097 0C1.10783 0 1.33356 0.0952063 1.50552 0.284728L6.80521 6.12572L12.1051 0.284728C12.277 0.0952063 12.5028 0 12.7285 0C12.9542 0 13.18 0.0952063 13.3519 0.284728C13.6968 0.66466 13.6968 1.27896 13.3519 1.65889L8.05223 7.49989Z"
      fill="#222222"
    />
  </svg>`;
    modalheader.addEventListener("click", () => {
      this.closeModal();
    });
    modalCloseIcon.addEventListener("click", () => {
      this.closeModal();
    });
    modalheaderRow.appendChild(modalTitle);
    modalheader.appendChild(modalheaderRow);
    modalheader.appendChild(modalCloseIcon);
    modalFooter.appendChild(modalSubmitBtn);
    modal.appendChild(modalBG);
    modal.appendChild(modalheader);
    modal.appendChild(modalBody);
    modal.appendChild(modalFooter);
    modalSubmitBtn.innerText = this.options.labels.submitKeyTitle;
    modalSubmitBtn.setAttribute("data-calendar-today-btn", "");
    modalSubmitBtn.addEventListener("click", (e) => this.closeModal());
    monthsContainer.setAttribute("data-calendar-month-container", "");
    const bodyElement = document.createElement("div");
    const mainElement = document.createElement("div");
    bodyElement.setAttribute("data-calendar-body", "");
    mainElement.setAttribute("data-calendar-days", "");
    let firstDayInMonth = this.months[this.activeIndex].firstDayInMonth;
    let lastDayInMonth = this.months[this.activeIndex].lastDayInMonth;
    if (this.options.culture == "en") {
      firstDayInMonth = this.months[this.activeIndex].firstDayInMonth - 1;
      lastDayInMonth = this.months[this.activeIndex].lastDayInMonth - 1;
    }
    const holidayFilter = document.createElement("div");
    const reminderFilter = document.createElement("div");
    reminderFilter.setAttribute("data-calendar-reminder-filter", "");
    holidayFilter.setAttribute("data-calendar-reminder-filter", "");
    reminderFilter.innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.56779 4.82951e-07H10.4322C11.6408 -1.77422e-05 12.6149 -3.24405e-05 13.3811 0.102975C14.1765 0.209919 14.8463 0.438709 15.3782 0.970635C15.642 1.2344 15.8312 1.53205 15.968 1.86211C16.7917 1.96529 17.4832 2.19192 18.0294 2.73812C18.5613 3.27005 18.7901 3.9398 18.897 4.73524C19 5.5014 19 6.47555 19 7.68412V11.316C19 12.5245 19 13.4987 18.897 14.2649C18.7901 15.0603 18.5613 15.73 18.0294 16.262C17.4832 16.8082 16.7916 17.0348 15.9679 17.138C15.8312 17.468 15.6419 17.7656 15.3782 18.0294C14.8463 18.5613 14.1765 18.7901 13.3811 18.897C12.6149 19 11.6408 19 10.4322 19H8.56779C7.35922 19 6.38508 19 5.61892 18.897C4.82347 18.7901 4.15372 18.5613 3.6218 18.0294C3.35806 17.7656 3.16884 17.468 3.03205 17.138C2.20837 17.0348 1.51684 16.8082 0.970635 16.262C0.438709 15.73 0.209919 15.0603 0.102975 14.2649C-3.24405e-05 13.4987 -1.77422e-05 12.5245 4.82951e-07 11.316V7.68411C-1.77422e-05 6.47554 -3.24405e-05 5.5014 0.102975 4.73524C0.209919 3.9398 0.438709 3.27005 0.970635 2.73812C1.51683 2.19193 2.20835 1.96529 3.03201 1.86211C3.16881 1.53205 3.35804 1.2344 3.6218 0.970635C4.15372 0.438709 4.82347 0.209919 5.61892 0.102975C6.38508 -3.24405e-05 7.35922 -1.77422e-05 8.56779 4.82951e-07ZM2.72048 3.26135C2.33375 3.35455 2.09266 3.49076 1.90796 3.67545C1.66338 3.92003 1.50392 4.26342 1.41674 4.91187C1.32699 5.57939 1.32558 6.4641 1.32558 7.7326V11.2675C1.32558 12.536 1.32699 13.4207 1.41674 14.0882C1.50392 14.7367 1.66338 15.0801 1.90796 15.3246C2.09266 15.5093 2.33375 15.6455 2.72049 15.7387C2.65113 15.0218 2.65115 14.1427 2.65116 13.0834V5.91662C2.65115 4.85739 2.65113 3.97823 2.72048 3.26135ZM16.2795 15.7387C16.6662 15.6455 16.9073 15.5093 17.092 15.3246C17.3366 15.0801 17.4961 14.7367 17.5833 14.0882C17.673 13.4207 17.6744 12.536 17.6744 11.2675V7.7326C17.6744 6.4641 17.673 5.57939 17.5833 4.91187C17.4961 4.26342 17.3366 3.92003 17.092 3.67545C16.9073 3.49076 16.6663 3.35455 16.2795 3.26135C16.3489 3.97824 16.3489 4.8574 16.3488 5.91663V13.0834C16.3489 14.1426 16.3489 15.0218 16.2795 15.7387ZM5.79555 1.41674C5.1471 1.50392 4.80371 1.66338 4.55913 1.90796C4.31454 2.15254 4.15508 2.49593 4.0679 3.14439C3.97815 3.81191 3.97674 4.69661 3.97674 5.96512V13.0349C3.97674 14.3034 3.97815 15.1881 4.0679 15.8556C4.15508 16.5041 4.31454 16.8475 4.55913 17.092C4.80371 17.3366 5.1471 17.4961 5.79555 17.5833C6.46307 17.673 7.34777 17.6744 8.61628 17.6744H10.3837C11.6522 17.6744 12.5369 17.673 13.2045 17.5833C13.8529 17.4961 14.1963 17.3366 14.4409 17.092C14.6855 16.8475 14.8449 16.5041 14.9321 15.8556C15.0218 15.1881 15.0233 14.3034 15.0233 13.0349V5.96512C15.0233 4.69661 15.0218 3.81191 14.9321 3.14439C14.8449 2.49593 14.6855 2.15254 14.4409 1.90796C14.1963 1.66338 13.8529 1.50392 13.2045 1.41674C12.5369 1.32699 11.6522 1.32558 10.3837 1.32558H8.61628C7.34777 1.32558 6.46307 1.32699 5.79555 1.41674ZM6.18605 6.84884C6.18605 6.48279 6.48279 6.18605 6.84884 6.18605H12.1512C12.5172 6.18605 12.814 6.48279 12.814 6.84884C12.814 7.21489 12.5172 7.51163 12.1512 7.51163H6.84884C6.48279 7.51163 6.18605 7.21489 6.18605 6.84884ZM6.18605 10.3837C6.18605 10.0177 6.48279 9.72093 6.84884 9.72093H12.1512C12.5172 9.72093 12.814 10.0177 12.814 10.3837C12.814 10.7498 12.5172 11.0465 12.1512 11.0465H6.84884C6.48279 11.0465 6.18605 10.7498 6.18605 10.3837ZM6.18605 13.9186C6.18605 13.5526 6.48279 13.2558 6.84884 13.2558H9.5C9.86605 13.2558 10.1628 13.5526 10.1628 13.9186C10.1628 14.2847 9.86605 14.5814 9.5 14.5814H6.84884C6.48279 14.5814 6.18605 14.2847 6.18605 13.9186Z" fill="#767676"/>
    </svg>` +
      this.options.labels.noteTitle +
      `${
        this.catFilters.length != 0
          ? `<div data-calendar-filter-count>${this.catFilters.length}</div>`
          : ""
      } ` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" fill="none">
    <path d="M1 0.782366L4 4.21094L7 0.782366" stroke="#767676" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    holidayFilter.innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
      <path d="M14.5234 11.0833C15.0231 11.0833 15.4282 10.6783 15.4282 10.1786C15.4282 9.67888 15.0231 9.27381 14.5234 9.27381C14.0238 9.27381 13.6187 9.67888 13.6187 10.1786C13.6187 10.6783 14.0238 11.0833 14.5234 11.0833Z" fill="#767676"/>
      <path d="M14.5234 14.7024C15.0231 14.7024 15.4282 14.2973 15.4282 13.7976C15.4282 13.2979 15.0231 12.8929 14.5234 12.8929C14.0238 12.8929 13.6187 13.2979 13.6187 13.7976C13.6187 14.2973 14.0238 14.7024 14.5234 14.7024Z" fill="#767676"/>
      <path d="M10.9044 10.1786C10.9044 10.6783 10.4993 11.0833 9.99963 11.0833C9.49994 11.0833 9.09487 10.6783 9.09487 10.1786C9.09487 9.67888 9.49994 9.27381 9.99963 9.27381C10.4993 9.27381 10.9044 9.67888 10.9044 10.1786Z" fill="#767676"/>
      <path d="M10.9044 13.7976C10.9044 14.2973 10.4993 14.7024 9.99963 14.7024C9.49994 14.7024 9.09487 14.2973 9.09487 13.7976C9.09487 13.2979 9.49994 12.8929 9.99963 12.8929C10.4993 12.8929 10.9044 13.2979 10.9044 13.7976Z" fill="#767676"/>
      <path d="M5.47582 11.0833C5.9755 11.0833 6.38058 10.6783 6.38058 10.1786C6.38058 9.67888 5.9755 9.27381 5.47582 9.27381C4.97613 9.27381 4.57106 9.67888 4.57106 10.1786C4.57106 10.6783 4.97613 11.0833 5.47582 11.0833Z" fill="#767676"/>
      <path d="M5.47582 14.7024C5.9755 14.7024 6.38058 14.2973 6.38058 13.7976C6.38058 13.2979 5.9755 12.8929 5.47582 12.8929C4.97613 12.8929 4.57106 13.2979 4.57106 13.7976C4.57106 14.2973 4.97613 14.7024 5.47582 14.7024Z" fill="#767676"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.47582 0C5.85058 0 6.15439 0.303807 6.15439 0.678571V1.36865C6.75334 1.35713 7.41321 1.35714 8.13895 1.35714H11.8602C12.586 1.35714 13.2459 1.35713 13.8449 1.36865V0.678571C13.8449 0.303807 14.1487 0 14.5234 0C14.8982 0 15.202 0.303807 15.202 0.678571V1.42689C15.4372 1.44482 15.6599 1.46736 15.8706 1.49569C16.9314 1.63831 17.79 1.9388 18.4671 2.61589C19.1442 3.29298 19.4447 4.15155 19.5873 5.21231C19.7258 6.24302 19.7258 7.56001 19.7258 9.22273V11.1344C19.7258 12.7971 19.7258 14.1141 19.5873 15.1448C19.4447 16.2056 19.1442 17.0642 18.4671 17.7413C17.79 18.4183 16.9314 18.7188 15.8706 18.8614C14.8399 19 13.5229 19 11.8602 19H8.13907C6.47635 19 5.15932 19 4.12861 18.8614C3.06785 18.7188 2.20927 18.4183 1.53218 17.7413C0.855091 17.0642 0.554604 16.2056 0.411988 15.1448C0.273412 14.1141 0.273424 12.7971 0.273438 11.1344V9.22276C0.273424 7.56003 0.273412 6.24303 0.411988 5.21231C0.554604 4.15155 0.855091 3.29298 1.53218 2.61589C2.20927 1.9388 3.06785 1.63831 4.12861 1.49569C4.33935 1.46736 4.56206 1.44482 4.79725 1.42689V0.678571C4.79725 0.303807 5.10106 0 5.47582 0ZM4.30944 2.84073C3.39917 2.96312 2.87473 3.19263 2.49183 3.57553C2.10892 3.95844 1.87941 4.48288 1.75703 5.39315C1.7363 5.54731 1.71897 5.7096 1.70448 5.88095H18.2948C18.2803 5.7096 18.263 5.54731 18.2422 5.39315C18.1198 4.48288 17.8903 3.95844 17.5074 3.57553C17.1245 3.19263 16.6001 2.96312 15.6898 2.84073C14.76 2.71573 13.5344 2.71429 11.8092 2.71429H8.1901C6.46489 2.71429 5.23924 2.71573 4.30944 2.84073ZM1.63058 9.27381C1.63058 8.50113 1.63087 7.82866 1.64242 7.2381H18.3568C18.3684 7.82866 18.3687 8.50113 18.3687 9.27381V11.0833C18.3687 12.8086 18.3672 14.0342 18.2422 14.964C18.1198 15.8743 17.8903 16.3987 17.5074 16.7816C17.1245 17.1645 16.6001 17.394 15.6898 17.5164C14.76 17.6414 13.5344 17.6429 11.8092 17.6429H8.1901C6.46489 17.6429 5.23923 17.6414 4.30944 17.5164C3.39917 17.394 2.87473 17.1645 2.49183 16.7816C2.10892 16.3987 1.87941 15.8743 1.75703 14.964C1.63202 14.0342 1.63058 12.8086 1.63058 11.0833V9.27381Z" fill="#767676"/>
      </svg>` +
      this.options.labels.holiday+
      `${
        this.holidayFilters.length != 0
          ? `<div data-calendar-filter-count>${this.holidayFilters.length}</div>`
          : ""
      } ` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" fill="none">
    <path d="M1 0.782366L4 4.21094L7 0.782366" stroke="#767676" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    const onCheck = (id: number, title: string) => {
      if (this.catFilters.filter((e) => e.id === id).length > 0) {
        this.catFilters = this.catFilters.filter((i) => i.id !== id);
      } else {
        this.catFilters = [...this.catFilters, { id, title }];
      }
      this.runAsync();
    };

    const holidayFilters = document.createElement("div");
    holidayFilters.style.display = "none";
    holidayFilters.setAttribute("data-calendar-holiday-filters", "");
    this.holidayCategories?.map((e) => {
      const filterRow = document.createElement("div");
      filterRow.setAttribute("data-calendar-filter-row", "");
      const input = document.createElement("input");
      const title = document.createElement("div");
      title.innerHTML = `${e.title}`;
      title.setAttribute("data-bc-filter-title", "");
      input.setAttribute("type", "checkbox");
      input.setAttribute("data-id", e.id)
      input.setAttribute("data-title", e.title)
      input.setAttribute("data-holidaycheckbox", e.title)
      input.setAttribute("data-holidaycheckbox", e.title)
      if (this.holidayFilters.find((i) => i.id === e.id)) {
        input.setAttribute("checked", "true");
      }
      input.addEventListener("click", () => {
        this.onHolidayCheck(e);
      });
      filterRow.appendChild(input);
      filterRow.appendChild(title);

      holidayFilters.appendChild(filterRow);
    });

    holidayFilter.addEventListener("click", () => {
      if (holidayFilters.style.display == "none") {
        holidayFilters.style.display = "flex";
        holidayFilters.style.top =
          String(holidayFilter.offsetTop + holidayFilter.offsetHeight + 10) +
          "px";
        holidayFilters.style.left =
          String(
            holidayFilter.offsetLeft +
              holidayFilter.offsetWidth -
              holidayFilters.offsetWidth
          ) + "px";
        holidayFilters.innerHTML = "";
        this.holidayCategories.map((e) => {
          const filterRow = document.createElement("div");
          filterRow.setAttribute("data-calendar-filter-row", "");
          const input = document.createElement("input");
          const title = document.createElement("div");
          title.innerHTML = `${e.title}`;
          input.setAttribute("type", "checkbox");
          title.setAttribute("data-bc-filter-title", "");
          input.setAttribute("data-id", e.id)
          input.setAttribute("data-title", e.title)
          if (this.holidayFilters.find((i) => i.title === e.title)) {
            input.setAttribute("checked", "true");
          }
          input.addEventListener("click", () => {
            this.onHolidayCheck(e);
          });
          filterRow.appendChild(input);
          filterRow.appendChild(title);

          holidayFilters.appendChild(filterRow);
        });
        if (this.options.level !== "user") {
          const newPersonalHoliday = document.createElement("button");
          newPersonalHoliday.setAttribute("data-calendar-new-holiday", "");
          newPersonalHoliday.innerHTML = `${this.options.labels.personalization}<svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
          <path d="M5.4 0.5H3.6V4.1H0V5.9H3.6V9.5H5.4V5.9H9V4.1H5.4V0.5Z" fill="#004B85"/>
        </svg>`;
          newPersonalHoliday.addEventListener("click", () => {
            if (this.options.mode == "desktop") {
              const UImanager = new UiCalendar(
                this,
                this.months[this.activeIndex].days[0]
              );

              UImanager.modal.openModal(
                UImanager.generatePersonalHolidayForm()
              );
            } else if (this.options.mode == "mobile") {
              const UImanager = new UiMbobile(
                this,
                this.months[this.activeIndex].days[0]
              );
            }
          });
          holidayFilters.appendChild(newPersonalHoliday);
        }
      } else {
        holidayFilters.style.display = "none";
      }
    });

    const categoriesFilter = document.createElement("div");
    categoriesFilter.style.display = "none";
    categoriesFilter.setAttribute("data-calendar-reminder-filters", "");
    this.categories.map((e) => {
      const filterRow = document.createElement("div");
      filterRow.setAttribute("data-calendar-filter-row", "");
      const input = document.createElement("input");
      const title = document.createElement("div");
      title.innerHTML = `${e.title}`;
      input.setAttribute("type", "checkbox");
      title.setAttribute("data-bc-filter-title", "");

      if (this.catFilters.find((i) => i.id === e.id)) {
        input.setAttribute("checked", "true");
      }
      input.addEventListener("click", () => onCheck(e.id, e.title));
      filterRow.appendChild(input);
      filterRow.appendChild(title);

      categoriesFilter.appendChild(filterRow);
    });
    reminderFilter.addEventListener("click", () => {
      if (categoriesFilter.style.display == "none") {
        categoriesFilter.style.display = "flex";
        categoriesFilter.style.top =
          String(reminderFilter.offsetTop + reminderFilter.offsetHeight + 10) +
          "px";
        categoriesFilter.style.left =
          String(
            reminderFilter.offsetLeft +
              reminderFilter.offsetWidth -
              categoriesFilter.offsetWidth
          ) + "px";
        categoriesFilter.innerHTML = "";
        this.categories.map((e) => {
          const filterRow = document.createElement("div");
          filterRow.setAttribute("data-calendar-filter-row", "");
          const input = document.createElement("input");
          const title = document.createElement("div");
          title.innerHTML = `${e.title}`;
          input.setAttribute("type", "checkbox");
          title.setAttribute("data-bc-filter-title", "");

          if (this.catFilters.find((i) => i.id === e.id)) {
            input.setAttribute("checked", "true");
          }
          input.addEventListener("click", () => onCheck(e.id, e.title));
          filterRow.appendChild(input);
          filterRow.appendChild(title);

          categoriesFilter.appendChild(filterRow);
        });
      } else {
        categoriesFilter.style.display = "none";
      }
    });
    const filterWrapper = document.createElement("div");
    filterWrapper.setAttribute("data-calendar-filter-container", "");
    const filterButtonsContainer = document.createElement("div");
    filterButtonsContainer.setAttribute("data-calendar-filters-container", "");
    filterButtonsContainer.appendChild(holidayFilter);
    filterButtonsContainer.appendChild(holidayFilters);
    filterButtonsContainer.appendChild(reminderFilter);
    filterButtonsContainer.appendChild(categoriesFilter);
    filterWrapper.appendChild(filterButtonsContainer);
    bodyElement.appendChild(filterWrapper);
    if (this.isFilterOpen) {
      filterWrapper.style.display = "flex";
    }

    if (this.catFilters.length > 0 || this.holidayFilters.length > 0) {
      filterWrapper.appendChild(this.createMountFilters());
    }
    bodyElement.append(this.generateDaysName());
    for (var j = 0; j < firstDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-calendar-day", "");
      dayElement.setAttribute("data-sys-inherit", "");
      dayElement.setAttribute("data-sys-text", "");
      mainElement.appendChild(dayElement);
    }
    this.months[this.activeIndex].days.map((x) => {
      if (this.options.mode == "desktop") {
       
  
        const dayElement = new UiCalendar(this, x).generateDaysUi(
          this.catFilters,
          this.holidays.filter((i) =>
            this.holidayFilters.find((e) => {
              return e.id == i.temID;
            })
          ),
          this.categories
        );
        mainElement.appendChild(dayElement);
      } else if (this.options.mode == "mobile") {
        const dayElement = new UiMbobile(this, x).generateDaysUi();
        mainElement.appendChild(dayElement);
      }
    });

    for (var j = 0; j < 6 - lastDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-calendar-day", "");
      dayElement.setAttribute("data-sys-inherit", "");
      dayElement.setAttribute("data-sys-text", "");
      mainElement.appendChild(dayElement);
    }

    monthsContainer.appendChild(bodyElement);
    bodyElement.append(mainElement);
    bodyElement.append(modal);

    return monthsContainer;
  }
  async onHolidayCheck({title ,id } , changeMonth:boolean = false)  {
   if(changeMonth == true){
    
    while(this.holidayFilters.length){
      this.holidayFilters.pop();
    }   
   }

    if (this.holidayFilters.filter((e) => e.id === id).length > 0) {
      this.holidayFilters = this.holidayFilters.filter((i) => i.id !== id);
    } else {
      this.holidayFilters = [...this.holidayFilters, { title, id }];
    }
    
    if(changeMonth == false){
    this.runAsync();
    }
   
  };
  protected createMountFooter(): Node {
    //create related element
    var footerElement = document.createElement("div");
    this.runHeader = true;
    return footerElement;
  }
  protected createMountFilters(): Node {
    const submittedFilters = document.createElement("div");
    submittedFilters.setAttribute("data-calendar-filters-row", "");
    this.catFilters.map((e) => {
      const filterRemoveButton = document.createElement("div");
      filterRemoveButton.setAttribute("data-calendar-remove-button", "");
      filterRemoveButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" fill="none">
      <path opacity="0.8" d="M3.7577 3.49995L6.23089 6.22575C6.39184 6.40305 6.39184 6.68972 6.23089 6.86702C6.07002 7.04433 5.8099 7.04433 5.64903 6.86702L3.17577 4.14122L0.702578 6.86702C0.541627 7.04433 0.281589 7.04433 0.120713 6.86702C-0.0402377 6.68972 -0.0402377 6.40305 0.120713 6.22575L2.5939 3.49995L0.120713 0.774149C-0.0402377 0.596848 -0.0402377 0.310175 0.120713 0.132873C0.200887 0.0444298 0.306304 0 0.411645 0C0.516987 0 0.622328 0.0444298 0.702578 0.132873L3.17577 2.85867L5.64903 0.132873C5.72928 0.0444298 5.83462 0 5.93996 0C6.0453 0 6.15064 0.0444298 6.23089 0.132873C6.39184 0.310175 6.39184 0.596848 6.23089 0.774149L3.7577 3.49995Z" fill="#767676"/>
      </svg>${e.title}`;
      filterRemoveButton.addEventListener("click", () => {
        this.catFilters = this.catFilters.filter((i) => i.id != e.id);
        this.runAsync();
      });
      submittedFilters.appendChild(filterRemoveButton);
    });
 
    this.holidayFilters.map((e) => {
      const filterRemoveButton = document.createElement("div");
      filterRemoveButton.setAttribute("data-calendar-remove-button", "");
      filterRemoveButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" fill="none">
      <path opacity="0.8" d="M3.7577 3.49995L6.23089 6.22575C6.39184 6.40305 6.39184 6.68972 6.23089 6.86702C6.07002 7.04433 5.8099 7.04433 5.64903 6.86702L3.17577 4.14122L0.702578 6.86702C0.541627 7.04433 0.281589 7.04433 0.120713 6.86702C-0.0402377 6.68972 -0.0402377 6.40305 0.120713 6.22575L2.5939 3.49995L0.120713 0.774149C-0.0402377 0.596848 -0.0402377 0.310175 0.120713 0.132873C0.200887 0.0444298 0.306304 0 0.411645 0C0.516987 0 0.622328 0.0444298 0.702578 0.132873L3.17577 2.85867L5.64903 0.132873C5.72928 0.0444298 5.83462 0 5.93996 0C6.0453 0 6.15064 0.0444298 6.23089 0.132873C6.39184 0.310175 6.39184 0.596848 6.23089 0.774149L3.7577 3.49995Z" fill="#767676"/>
      </svg>${e.title}`;
      filterRemoveButton.addEventListener("click", () => {
        this.holidayFilters = this.holidayFilters.filter((i) => i.id != e.id);
        this.runAsync();
      });
      submittedFilters.appendChild(filterRemoveButton);
    });
    if (this.catFilters.length > 0 || this.holidayFilters.length > 0) {
      const filterRemoveAllButton = document.createElement("div");
      filterRemoveAllButton.setAttribute("data-calendar-remove-button", "");
      filterRemoveAllButton.innerHTML = `پاک کردن تمام فیلتر ها<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" fill="none">
    <path opacity="0.8" d="M3.7577 3.49995L6.23089 6.22575C6.39184 6.40305 6.39184 6.68972 6.23089 6.86702C6.07002 7.04433 5.8099 7.04433 5.64903 6.86702L3.17577 4.14122L0.702578 6.86702C0.541627 7.04433 0.281589 7.04433 0.120713 6.86702C-0.0402377 6.68972 -0.0402377 6.40305 0.120713 6.22575L2.5939 3.49995L0.120713 0.774149C-0.0402377 0.596848 -0.0402377 0.310175 0.120713 0.132873C0.200887 0.0444298 0.306304 0 0.411645 0C0.516987 0 0.622328 0.0444298 0.702578 0.132873L3.17577 2.85867L5.64903 0.132873C5.72928 0.0444298 5.83462 0 5.93996 0C6.0453 0 6.15064 0.0444298 6.23089 0.132873C6.39184 0.310175 6.39184 0.596848 6.23089 0.774149L3.7577 3.49995Z" fill="#767676"/>
    </svg>`;
      filterRemoveAllButton.addEventListener("click", () => {
        this.catFilters = [];
        this.holidayFilters = [];
        this.runAsync();
      });
      submittedFilters.appendChild(filterRemoveAllButton);
    }
    return submittedFilters;
  }

  async runAsync(): Promise<void> {
    this.wrapper.innerHTML = "";
    this.wrapper.setAttribute("id", "basis-calendar");
    const headerPart = this.createMountHeader();
    const bodyPart = this.createMountBody();
    const footerPart = this.createMountFooter();
    //Extra process..

    this.wrapper.appendChild(headerPart);
    this.wrapper.appendChild(bodyPart);
    this.wrapper.appendChild(footerPart);

    // this.wrapper.style.display = "block"
  }
  public async createUIAsync(container: HTMLElement): Promise<void> {
    const style = document.createElement("link");
    style.setAttribute("href", this.options.style);
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("type", "text/css");
    await document.querySelector("head").appendChild(style);
    this.wrapper = container;
    // this.wrapper.style.display = "none"
    if (this.options.displayNote) {
      await this.refreshNotesAsync();
      this.runAsync();
    } else {
      this.runAsync();
    }
  }
  closeModal(): void {
    document.querySelector("[data-sys-modal]").setAttribute("style", "");
  }
  async sendAsyncData(form: FormData, url: string) {
    var data = new URLSearchParams();
    for (var p of form) {
      let name = p[0];
      let value = p[1];
      data.append(name, value.toString());
    }
    const response = await fetch(url, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.json();
  }
  async sendAsyncDataGetMethod(url: string) {
    const response = await fetch(url, {
      method: "Get",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.json();
  }
  async sendAsyncDataPostJson(json: object, url: string) {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(json),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }
}
