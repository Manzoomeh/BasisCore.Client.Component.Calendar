import { Month } from "./Month/Month";
import {
  DayValue,
  MonthNumber,
  MonthValue,
  ReminderType,
  catFilter,
  eventValue,
} from "./type-alias";
import { ICalenderOptions, INote, ICatNote } from "./Interface/Interface";
import { IDateUtil } from "./IDateUtil/IDateUtil";
import { BasisCoreDateUtil } from "./BasisCoreDateUtil/BasisCoreDateUtil";
import { PersianDateUtil } from "./PersianDateUtil/PersianDateUtil";
import { UiCalendar } from "./UiCalendar/UiCalendar";
import { UiMbobile } from "./mobile/UiMobile";
import IUserDefineComponent from "../basiscore/IUserDefineComponent";
import { DatePicker } from "./DatePicker";
import { EntryPlugin } from "webpack";
declare const $bc: any;
export class DateRange {
  public readonly dateUtil: BasisCoreDateUtil | PersianDateUtil;
  public readonly months: Array<Month> = new Array<Month>();
  public readonly options: ICalenderOptions;
  private readonly monthValues: MonthValue[];
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
  public todayId: number = 0;
  public isFilterOpen = false;
  public readonly Owner?: IUserDefineComponent;
  public categories: Array<ICatNote> = new Array<ICatNote>();
  private static readonly defaultCalenderOptions: Partial<ICalenderOptions> = {
    dateProvider: "basisCalendar",
    displayNote: true,
    culture: "fa",
    secondCulture: "en",
    lid: 1,
    theme: "basic",
    mode: "desktop",
    level: "service",
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
    this.getHolidays();
    this.getTemplates();
    this.getCategories();
  }
  async getTemplates(): Promise<void> {
    let data = await this.sendAsyncDataGetMethod(
      `https://basispanel.ir/service/${this.rKey}/${this.options.culture}/calendartemplates`
    );
    this.templates = data as any;
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
  async addTemplate(title) {
    let apiLink = this.options.baseUrl;

    try {
      const res = await fetch(apiLink["createholidaycategory"], {
        methos: "POST",
        body: {
          //@ts-ignore
          id: 0,
          typeid: this.options.lid == 2 ? 1 : 2,
          title,
          events: [],
        },
      });
      await this.getTemplates();
      this.renderModalBody();
    } catch {}
  }
  renderModalBody() {
    document.querySelector("[data-sys-modal-body]").innerHTML = "";
    const input = document.createElement("input");
    document.querySelector("[data-sys-modal-body]").appendChild(input);
    input.addEventListener("keypress", (e) => {
      //@ts-ignore
      if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        this.addTemplate(input.value);
      }
    });
    this.templates?.map((e) => {
      const row = document.createElement("div");
      const title = document.createElement("div");
      title.innerText = e.title;
      row.setAttribute("data-sys-modal-row", "");
      const icon = document.createElement("div");
      icon.innerHTML = `<svg  width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.833333 13.3333C0.833333 14.25 1.58333 15 2.5 15H9.16667C10.0833 15 10.8333 14.25 10.8333 13.3333V3.33333H0.833333V13.3333ZM2.88333 7.4L4.05833 6.225L5.83333 7.99167L7.6 6.225L8.775 7.4L7.00833 9.16667L8.775 10.9333L7.6 12.1083L5.83333 10.3417L4.06667 12.1083L2.89167 10.9333L4.65833 9.16667L2.88333 7.4ZM8.75 0.833333L7.91667 0H3.75L2.91667 0.833333H0V2.5H11.6667V0.833333H8.75Z" fill="#B40020"></path>
      </svg>`;
      icon.addEventListener("click", () => this.removeTemplate(e.id));
      row.appendChild(title);
      row.appendChild(icon);
      document.querySelector("[data-sys-modal-body]").appendChild(row);
    });
  }
  openModal(): void {
    document
      .querySelector("[data-sys-modal]")
      .setAttribute("style", "display:flex");
    this.renderModalBody();
  }
  removeTemplate(id) {
    this.templates = this.templates.filter((e) => e.id != id);
    this.renderModalBody();
  }
  public async getHolidays(): Promise<void> {
    const url = this.options.baseUrl["holidaysinrange"];
    const fromDateId = this.dateUtil.getBasisDayId(this.from);
    const toDateId = this.dateUtil.getBasisDayId(this.to);
    this.holidayFilters.map(async (e) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          body: JSON.stringify({
            from: fromDateId,
            to: toDateId,
            tempid: e.id,
            typeid: this.options.lid,
          }),
        });
        this.holidays.push(res);
        this.holidays = Array.from(new Set(this.holidays));
      } catch {}
    });
  }
  public async getCategories() {
    // this.Owner.addTrigger("")
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

  public async refreshNotesAsync(): Promise<void> {
    const from: DayValue = {
      year: this.from.year,
      month: this.from.month,
      day: this.from.day,
    };
    const to: DayValue = {
      year: this.to.year,
      month: this.to.month,
      day: this.to.day,
    };
    await this.syncNotesAsync(from, to);
  }
  public async syncHolidayCategories(): Promise<void> {
    const url =
      this.options.level === "service"
        ? this.options.baseUrl["serviceholiday"]
        : this.options.baseUrl["userholiday"];

    const res = await fetch(url);
    const data = await res.json();
    this.holidayCategories = data.message ? [] : data;
  }

  protected async syncNotesAsync(from: DayValue, to: DayValue): Promise<void> {
    //fetch push new data to server and fetch all data from server

    const fromDateId = this.dateUtil.getBasisDayId(from);
    const toDateId = this.dateUtil.getBasisDayId(to);
    const form = new FormData();
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
        creatoruser: 1037559,
        //   creatoruser: x.creatoruser ,
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
    nextMonthValues = this.dateUtil.nextMonth(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    if (this.options.sourceid) {
      const firstDay = this.months[0].days[0];
      const lastMonth = this.months[this.months.length - 1];
      const lastDay = lastMonth.days[lastMonth.dayInMonth - 1];
      const from =
        String(firstDay.month.value.year) +
        "/" +
        String(firstDay.month.value.month) +
        "/" +
        String(firstDay.value);

      const to =
        String(lastDay.month.value.year) +
        "/" +
        String(lastDay.month.value.month) +
        "/" +
        String(lastDay.value);
      $bc.setSource(this.options.sourceid, {
        from,
        to,
        culture: this.options.culture,
        lid: this.options.lid,
      });
    }
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
    if (this.options.sourceid) {
      const firstDay = this.months[0].days[0];
      const lastMonth = this.months[this.months.length - 1];
      const lastDay = lastMonth.days[lastMonth.dayInMonth - 1];
      const from =
        String(firstDay.month.value.year) +
        "/" +
        String(firstDay.month.value.month) +
        "/" +
        String(firstDay.value);

      const to =
        String(lastDay.month.value.year) +
        "/" +
        String(lastDay.month.value.month) +
        "/" +
        String(lastDay.value);
      $bc.setSource(this.options.sourceid, {
        from,
        to,
        culture: this.options.culture,
        lid: this.options.lid,
      });
    }
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
    if (this.options.sourceid) {
      const firstDay = this.months[0].days[0];
      const lastMonth = this.months[this.months.length - 1];
      const lastDay = lastMonth.days[lastMonth.dayInMonth - 1];
      const from =
        String(firstDay.month.value.year) +
        "/" +
        String(firstDay.month.value.month) +
        "/" +
        String(firstDay.value);

      const to =
        String(lastDay.month.value.year) +
        "/" +
        String(lastDay.month.value.month) +
        "/" +
        String(lastDay.value);
      $bc.setSource(this.options.sourceid, {
        from,
        to,
        culture: this.options.culture,
        lid: this.options.lid,
      });
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
    if (this.options.sourceid) {
      const firstDay = this.months[0].days[0];
      const lastMonth = this.months[this.months.length - 1];
      const lastDay = lastMonth.days[lastMonth.dayInMonth - 1];
      const from =
        String(firstDay.month.value.year) +
        "/" +
        String(firstDay.month.value.month) +
        "/" +
        String(firstDay.value);

      const to =
        String(lastDay.month.value.year) +
        "/" +
        String(lastDay.month.value.month) +
        "/" +
        String(lastDay.value);
      $bc.setSource(this.options.sourceid, {
        from,
        to,
        culture: this.options.culture,
        lid: this.options.lid,
      });
    }
    this.runAsync();
  }
  async goToMonth(monthNumber): Promise<void> {
    this.months[this.activeIndex] = new Month(this, {
      year: this.months[this.activeIndex].value.year,
      month: monthNumber,
    });
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    if (this.options.sourceid) {
      const firstDay = this.months[0].days[0];
      const lastMonth = this.months[this.months.length - 1];
      const lastDay = lastMonth.days[lastMonth.dayInMonth - 1];
      const from =
        String(firstDay.month.value.year) +
        "/" +
        String(firstDay.month.value.month) +
        "/" +
        String(firstDay.value);

      const to =
        String(lastDay.month.value.year) +
        "/" +
        String(lastDay.month.value.month) +
        "/" +
        String(lastDay.value);
      $bc.setSource(this.options.sourceid, {
        from,
        to,
        culture: this.options.culture,
        lid: this.options.lid,
      });
    }
    this.runAsync();
  }
  async goToday(): Promise<void> {
    let todayMonthValues: MonthValue = {
      year: this.months[this.activeIndex].currentDate.year,
      month: this.months[this.activeIndex].currentDate.month,
    };
    this.months[this.activeIndex] = new Month(this, todayMonthValues);
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    if (this.options.sourceid) {
      const firstDay = this.months[0].days[0];
      const lastMonth = this.months[this.months.length - 1];
      const lastDay = lastMonth.days[lastMonth.dayInMonth - 1];
      const from =
        String(firstDay.month.value.year) +
        "/" +
        String(firstDay.month.value.month) +
        "/" +
        String(firstDay.value);

      const to =
        String(lastDay.month.value.year) +
        "/" +
        String(lastDay.month.value.month) +
        "/" +
        String(lastDay.value);
      $bc.setSource(this.options.sourceid, {
        from,
        to,
        culture: this.options.culture,
        lid: this.options.lid,
      });
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
    settingButton.addEventListener("click", (e) => {
      this.openModal();
    });
    settingButton.setAttribute("data-calendar-setting-btn", "");

    settingButton.innerHTML = `<svg width="30" height="30" viewBox="8 7 28 26" fill="#222" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M24.2788 10.1522C23.9085 10 23.439 10 22.5 10C21.561 10 21.0915 10 20.7212 10.1522C20.2274 10.3552 19.8351 10.7446 19.6306 11.2346C19.5372 11.4583 19.5007 11.7185 19.4864 12.098C19.4653 12.6557 19.1772 13.1719 18.6902 13.4509C18.2032 13.73 17.6086 13.7195 17.1115 13.4588C16.7732 13.2813 16.5279 13.1826 16.286 13.151C15.7561 13.0818 15.2202 13.2243 14.7962 13.5472C14.4781 13.7894 14.2434 14.1929 13.7739 14.9999C13.3044 15.807 13.0697 16.2105 13.0173 16.6049C12.9476 17.1308 13.0912 17.6627 13.4165 18.0835C13.5651 18.2756 13.7738 18.437 14.0977 18.639C14.5739 18.936 14.8803 19.4419 14.8803 20C14.8803 20.5581 14.5739 21.0639 14.0977 21.3608C13.7737 21.5629 13.565 21.7244 13.4164 21.9165C13.0911 22.3373 12.9475 22.8691 13.0172 23.395C13.0696 23.7894 13.3043 24.193 13.7738 25C14.2433 25.807 14.478 26.2106 14.7961 26.4527C15.2201 26.7756 15.756 26.9181 16.2859 26.8489C16.5278 26.8173 16.7731 26.7186 17.1113 26.5412C17.6085 26.2804 18.2031 26.27 18.6901 26.549C19.1771 26.8281 19.4653 27.3443 19.4864 27.9021C19.5007 28.2815 19.5372 28.5417 19.6306 28.7654C19.8351 29.2554 20.2274 29.6448 20.7212 29.8478C21.0915 30 21.561 30 22.5 30C23.439 30 23.9085 30 24.2788 29.8478C24.7726 29.6448 25.1649 29.2554 25.3694 28.7654C25.4628 28.5417 25.4994 28.2815 25.5137 27.902C25.5347 27.3443 25.8228 26.8281 26.3098 26.549C26.7968 26.2699 27.3914 26.2804 27.8886 26.5412C28.2269 26.7186 28.4721 26.8172 28.714 26.8488C29.2439 26.9181 29.7798 26.7756 30.2038 26.4527C30.5219 26.2105 30.7566 25.807 31.2261 24.9999C31.6956 24.1929 31.9303 23.7894 31.9827 23.395C32.0524 22.8691 31.9088 22.3372 31.5835 21.9164C31.4349 21.7243 31.2262 21.5628 30.9022 21.3608C30.4261 21.0639 30.1197 20.558 30.1197 19.9999C30.1197 19.4418 30.4261 18.9361 30.9022 18.6392C31.2263 18.4371 31.435 18.2757 31.5836 18.0835C31.9089 17.6627 32.0525 17.1309 31.9828 16.605C31.9304 16.2106 31.6957 15.807 31.2262 15C30.7567 14.193 30.522 13.7894 30.2039 13.5473C29.7799 13.2244 29.244 13.0818 28.7141 13.1511C28.4722 13.1827 28.2269 13.2814 27.8887 13.4588C27.3915 13.7196 26.7969 13.73 26.3099 13.451C25.8229 13.1719 25.5347 12.6557 25.5136 12.0979C25.4993 11.7185 25.4628 11.4583 25.3694 11.2346C25.1649 10.7446 24.7726 10.3552 24.2788 10.1522ZM22.5 23C24.1695 23 25.5228 21.6569 25.5228 20C25.5228 18.3431 24.1695 17 22.5 17C20.8305 17 19.4772 18.3431 19.4772 20C19.4772 21.6569 20.8305 23 22.5 23Z" fill="none" stroke="#222"/> </svg>`;
    todayButton.addEventListener("click", (e) => {
      this.goToday();
    });
    const todayIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17"  >
    <path fill-rule="evenodd"  clip-rule="evenodd" d="M4.65476 0C4.99008 0 5.26191 0.271827 5.26191 0.607143V1.22458C5.79783 1.21427 6.38828 1.21428 7.03766 1.21429H10.3671C11.0165 1.21428 11.6069 1.21427 12.1429 1.22458V0.607143C12.1429 0.271827 12.4147 0 12.75 0C13.0853 0 13.3571 0.271827 13.3571 0.607143V1.27669C13.5676 1.29273 13.7668 1.3129 13.9554 1.33825C14.9045 1.46586 15.6727 1.73471 16.2785 2.34053C16.8843 2.94635 17.1532 3.71454 17.2808 4.66365C17.3216 4.96697 17.3489 5.298 17.3673 5.65863C17.3915 5.72419 17.4048 5.79507 17.4048 5.86905C17.4048 5.92517 17.3971 5.9795 17.3829 6.03109C17.4048 6.6803 17.4048 7.41746 17.4048 8.25195V9.96233C17.4048 11.45 17.4048 12.6284 17.2808 13.5506C17.1532 14.4997 16.8843 15.2679 16.2785 15.8738C15.6727 16.4796 14.9045 16.7484 13.9554 16.876C13.0332 17 11.8548 17 10.3671 17H7.03767C5.54996 17 4.37158 17 3.44936 16.876C2.50026 16.7484 1.73206 16.4796 1.12624 15.8738C0.520427 15.2679 0.25157 14.4997 0.123967 13.5506C-2.27988e-05 12.6284 -1.25745e-05 11.45 2.60355e-07 9.96234V8.25195C-6.9291e-06 7.41746 -1.32978e-05 6.68031 0.0218644 6.03109C0.00761404 5.9795 5.49864e-07 5.92517 5.49864e-07 5.86905C5.49864e-07 5.79507 0.0132313 5.72418 0.0374556 5.65862C0.0558201 5.29799 0.0831865 4.96697 0.123967 4.66365C0.25157 3.71454 0.520427 2.94635 1.12624 2.34053C1.73206 1.73471 2.50026 1.46586 3.44936 1.33825C3.63792 1.3129 3.83719 1.29273 4.04762 1.27669V0.607143C4.04762 0.271827 4.31945 0 4.65476 0ZM1.22488 6.47619C1.21454 7.00459 1.21429 7.60627 1.21429 8.29762V9.91667C1.21429 11.4603 1.21558 12.5569 1.32742 13.3888C1.43692 14.2033 1.64228 14.6725 1.98487 15.0151C2.32747 15.3577 2.79671 15.5631 3.61116 15.6726C4.44308 15.7844 5.53972 15.7857 7.08333 15.7857H10.3214C11.865 15.7857 12.9617 15.7844 13.7936 15.6726C14.6081 15.5631 15.0773 15.3577 15.4199 15.0151C15.7625 14.6725 15.9678 14.2033 16.0773 13.3888C16.1892 12.5569 16.1905 11.4603 16.1905 9.91667V8.29762C16.1905 7.60627 16.1902 7.00459 16.1799 6.47619H1.22488ZM16.1244 5.2619H1.28041C1.29337 5.10859 1.30888 4.96338 1.32742 4.82545C1.43692 4.011 1.64228 3.54176 1.98487 3.19916C2.32747 2.85656 2.79671 2.65121 3.61116 2.54171C4.44308 2.42986 5.53972 2.42857 7.08333 2.42857H10.3214C11.865 2.42857 12.9617 2.42986 13.7936 2.54171C14.6081 2.65121 15.0773 2.85656 15.4199 3.19916C15.7625 3.54176 15.9678 4.011 16.0773 4.82545C16.0959 4.96338 16.1114 5.10859 16.1244 5.2619ZM12.3452 11.3333C12.0099 11.3333 11.7381 11.6052 11.7381 11.9405C11.7381 12.2758 12.0099 12.5476 12.3452 12.5476C12.6806 12.5476 12.9524 12.2758 12.9524 11.9405C12.9524 11.6052 12.6806 11.3333 12.3452 11.3333ZM10.5238 11.9405C10.5238 10.9345 11.3393 10.119 12.3452 10.119C13.3512 10.119 14.1667 10.9345 14.1667 11.9405C14.1667 12.9464 13.3512 13.7619 12.3452 13.7619C11.3393 13.7619 10.5238 12.9464 10.5238 11.9405Z" fill="#222222"/>
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
    if (this.monthValues.length == 1) {
      const nextButton = document.createElement("button");
      const prevButton = document.createElement("button");
      const nextYear = document.createElement("button");
      const prevYear = document.createElement("button");
      nextButton.addEventListener("click", (e) => {
        this.nextMonth();
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
      nextButton.innerHTML = `<svg width="11"  height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path data-sys-text=""  d="M0.37999 19.01C0.86999 19.5 1.65999 19.5 2.14999 19.01L10.46 10.7C10.85 10.31 10.85 9.68005 10.46 9.29005L2.14999 0.980049C1.65999 0.490049 0.86999 0.490049 0.37999 0.980049C-0.11001 1.47005 -0.11001 2.26005 0.37999 2.75005L7.61999 10L0.36999 17.25C-0.11001 17.73 -0.11001 18.5301 0.37999 19.01Z" fill="#767676"/>
      </svg>
      `;
      prevButton.innerHTML = `<svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path data-sys-text=""  d="M10.6201 0.990059C10.1301 0.500059 9.34006 0.500059 8.85006 0.990059L0.540059 9.30006C0.150059 9.69006 0.150059 10.3201 0.540059 10.7101L8.85006 19.0201C9.34006 19.5101 10.1301 19.5101 10.6201 19.0201C11.1101 18.5301 11.1101 17.7401 10.6201 17.2501L3.38006 10.0001L10.6301 2.75006C11.1101 2.27006 11.1101 1.47006 10.6201 0.990059Z" fill="#767676"/>
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
      prevButton.setAttribute("data-calendar-prev", "");
      nextYear.setAttribute("data-calendar-next-year", "");
      prevYear.setAttribute("data-calendar-prev-year", "");
      controlElement.appendChild(nextYear);
      controlElement.appendChild(nextButton);
      controlElement.appendChild(monthNameElement);
      controlElement.appendChild(prevButton);
      controlElement.appendChild(prevYear);
    } else {
      const monthsBtnWrapper = document.createElement("select");
      monthsBtnWrapper.setAttribute("data-calendar-month-wrapper", "");
      this.monthValues.map((x, index) => {
        const monthBtn = document.createElement("option");

        monthBtn.setAttribute("data-calendar-month-btn", "");
        monthBtn.textContent = this.dateUtil.getMonthName(
          x,
          this.options.culture,
          this.options.lid
        );
        monthBtn.addEventListener("click", (e) => {
          this.months[this.activeIndex] = this.months[index];
          if (this.options.sourceid) {
            const firstDay = this.months[0].days[0];
            const lastMonth = this.months[this.months.length - 1];
            const lastDay = lastMonth.days[lastMonth.dayInMonth - 1];
            const from =
              String(firstDay.month.value.year) +
              "/" +
              String(firstDay.month.value.month) +
              "/" +
              String(firstDay.value);

            const to =
              String(lastDay.month.value.year) +
              "/" +
              String(lastDay.month.value.month) +
              "/" +
              String(lastDay.value);
            $bc.setSource(this.options.sourceid, {
              from,
              to,
              culture: this.options.culture,
              lid: this.options.lid,
            });
          }
          this.runAsync();
        });
        monthsBtnWrapper.appendChild(monthBtn);
      });
      controlElement.appendChild(monthsBtnWrapper);
    }

    calendarHeader.setAttribute("bc-calendar-calendar-header", "");
    // calendarHeader.appendChild(controlElement);
    // calendarHeader.appendChild(monthNameElement);
    // controlElement.appendChild(currentYear)
    calendarHeader.appendChild(controlElement);
    const rightSideBtns = document.createElement("div");
    rightSideBtns.setAttribute("data-calendar-right-btns", "");

    rightSideBtns.appendChild(todayButton);
    rightSideBtns.appendChild(yearBtn);
    const container = document.createElement("div");

    // const yearContainer = document.createElement("div");
    // const currentyear = document.createElement("div");
    // currentyear.innerText = String(this.months[this.activeIndex].currentYear);
    // yearContainer.setAttribute("data-calendar-year-container", "");
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
    // yearContainer.appendChild(nextYearIcon);

    // yearContainer.appendChild(currentyear);
    // yearContainer.appendChild(prevYearIcon);

    // container.appendChild(yearContainer);
    const empt = document.createElement("div");
    container.setAttribute("data-calendar-date-modal", "");
    container.appendChild(empt);
    yearBtn.innerHTML =
      `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="9" viewBox="0 0 6 9" fill="none">
    <path d="M4.42857 1.5L1 4.5L4.42857 7.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>` +
      monthNameElement.outerHTML +
      `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="9" viewBox="0 0 6 9" fill="none">
    <path d="M1.42885 1.5L4.85742 4.5L1.42885 7.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
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
      `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.002 1.44491C16.002 1.86366 15.752 2.20312 15.4437 2.20312L0.557333 2.20313C0.249026 2.20313 -0.000905991 1.86366 -0.000905991 1.44491C-0.000905991 1.02616 0.249026 0.6867 0.557333 0.6867L15.4437 0.6867C15.752 0.6867 16.002 1.02616 16.002 1.44491Z" fill="#222222"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.7676 6.50741C13.7676 6.92616 13.5176 7.26562 13.2093 7.26562L2.78887 7.26563C2.48057 7.26563 2.23063 6.92616 2.23063 6.50741C2.23063 6.08866 2.48057 5.7492 2.78887 5.7492L13.2093 5.7492C13.5176 5.7492 13.7676 6.08866 13.7676 6.50741Z" fill="#222222"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5371 11.5543C11.5371 11.973 11.2872 12.3125 10.9789 12.3125L5.02432 12.3125C4.71601 12.3125 4.46608 11.973 4.46608 11.5543C4.46608 11.1355 4.71601 10.7961 5.02432 10.7961L10.9789 10.7961C11.2872 10.7961 11.5371 11.1355 11.5371 11.5543Z" fill="#222222"/>
    </svg>` +
      "فیلتر" +
      `${
        this.catFilters.length != 0 || this.holidayFilters.length != 0
          ? `<div data-calendar-filter-number>${
              this.catFilters.length + this.holidayFilters.length
            }</div>`
          : ""
      }`;

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
        pickerType: "range",
        switchType: true,
        theme: "basic",
        isFilter: true,
        mode: "desktop",
        style: "../css/datepicker-style.css",
        sourceid: "db.form",
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
      dayWrapper.appendChild(enSpan);
      weekNameWrapper.appendChild(dayWrapper);
    }
    return weekNameWrapper;
  }
  closeModal(): void {
    document.querySelector("[data-sys-modal]").setAttribute("style", "");
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
    modalTitle.innerText = "تنظیمات";
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
    modalSubmitBtn.innerText = "ثبت";
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
      "یادداشت ها" +
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
      "تعطیلات" +
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
    const onHolidayCheck = async ({
      title,
      id,
    }: {
      title: string;
      id: string;
    }) => {
      console.log("value :>> ", id);
      if (this.holidayFilters.filter((e) => e.id === id).length > 0) {
        this.holidayFilters = this.holidayFilters.filter((i) => i.id !== id);
      } else {
        this.holidayFilters = [...this.holidayFilters, { title, id }];
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
      if (this.holidayFilters.find((i) => i.id === e.id)) {
        input.setAttribute("checked", "true");
      }
      console.log("e :>> ", e);
      input.addEventListener("click", () => {
        onHolidayCheck(e);
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

          if (this.holidayFilters.find((i) => i.title === e.title)) {
            input.setAttribute("checked", "true");
          }
          input.addEventListener("click", () => onHolidayCheck(e));
          filterRow.appendChild(input);
          filterRow.appendChild(title);

          holidayFilters.appendChild(filterRow);
        });
        if (this.options.level !== "user") {
          const newPersonalHoliday = document.createElement("button");
          newPersonalHoliday.setAttribute("data-calendar-new-holiday", "");
          newPersonalHoliday.innerHTML = `شخصی سازی<svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
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
        console.log(
          "holidayFilters :>> ",
          this.holidays.filter((i) =>
            this.holidayFilters.find((e) => e.id == i.temID)
          )
        );
        const dayElement = new UiCalendar(this, x).generateDaysUi(
          this.catFilters,
          this.holidays.filter((i) =>
            this.holidayFilters.find((e) => e.id == i.temID)
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
  protected createMountFooter(): Node {
    //create related element
    var footerElement = document.createElement("div");
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
      console.log("this.catFilterss :>> ", this.catFilters);
    });
    this.holidayFilters.map((e) => {
      const filterRemoveButton = document.createElement("div");
      filterRemoveButton.setAttribute("data-calendar-remove-button", "");
      filterRemoveButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" fill="none">
      <path opacity="0.8" d="M3.7577 3.49995L6.23089 6.22575C6.39184 6.40305 6.39184 6.68972 6.23089 6.86702C6.07002 7.04433 5.8099 7.04433 5.64903 6.86702L3.17577 4.14122L0.702578 6.86702C0.541627 7.04433 0.281589 7.04433 0.120713 6.86702C-0.0402377 6.68972 -0.0402377 6.40305 0.120713 6.22575L2.5939 3.49995L0.120713 0.774149C-0.0402377 0.596848 -0.0402377 0.310175 0.120713 0.132873C0.200887 0.0444298 0.306304 0 0.411645 0C0.516987 0 0.622328 0.0444298 0.702578 0.132873L3.17577 2.85867L5.64903 0.132873C5.72928 0.0444298 5.83462 0 5.93996 0C6.0453 0 6.15064 0.0444298 6.23089 0.132873C6.39184 0.310175 6.39184 0.596848 6.23089 0.774149L3.7577 3.49995Z" fill="#767676"/>
      </svg>${e.title}`;
      filterRemoveButton.addEventListener("click", () => {
        this.holidayFilters = this.holidayFilters.filter(
          (i) => i.value != e.value
        );
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

  public async runAsync(): Promise<void> {
    console.log("this.catFilters :>> ", this.catFilters);
    console.log("run", this.options.culture);
    this.wrapper.innerHTML = "";
    this.wrapper.setAttribute("id", "basis-calendar");
    const headerPart = this.createMountHeader();
    const bodyPart = this.createMountBody();
    const footerPart = this.createMountFooter();
    //Extra process..
    this.getHolidays();
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
