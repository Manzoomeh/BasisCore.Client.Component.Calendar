import "../asset/style.css";
import { Month } from "./Month/Month";
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
} from "./type-alias";
import { ICalenderOptions, INote } from "./Interface/Interface";
import { IDateUtil } from "./IDateUtil/IDateUtil";
import { BasisCoreDateUtil } from "./BasisCoreDateUtil/BasisCoreDateUtil";
import { PersianDateUtil } from "./PersianDateUtil/PersianDateUtil";
import { UiCalendar } from "./UiCalendar/UiCalendar";
export class DateRange {
  public readonly dateUtil: IDateUtil;
  public readonly months: Array<Month> = new Array<Month>();
  public readonly options: ICalenderOptions;
  private readonly monthValues: MonthValue[];
  public note: INote[];
  public rKey: string;
  public wrapper: Element;
  public activeIndex: number;
  public userId : number =0
  private static readonly defaultCalenderOptions: Partial<ICalenderOptions> = {
    dateProvider: "basisCalendar",
    displayNote: true,
    culture: "fa",
    secondCulture: "en",
    lid: 1,
  };

  public constructor(
    from: DayValue,
    to: DayValue,
    options?: ICalenderOptions,
    rkey?: string
  ) {
    this.activeIndex = 0;
    this.options = { ...DateRange.defaultCalenderOptions, ...(options as any) };
    this.dateUtil =
      this.options.dateProvider == "basisCalendar"
        ? new BasisCoreDateUtil()
        : new PersianDateUtil();
    this.note = new Array<INote>();
    this.monthValues = this.dateUtil.getMonthValueList(from, to);
    this.monthValues.map((x) => this.months.push(new Month(this, x)));
    this.rKey = rkey;
    this.getRKey();
    this.getUserId()
    
   
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
    const form = new FormData();
    form.append("rkey", this.rKey);
    form.append("dmnid", this.options.dmnid.toString());
    let apiLink = this.options.baseUrl
    let userIdObj = await this.sendAsyncData(form, apiLink["userid"] );
    this.userId =parseInt(userIdObj[0].userid) 
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
  protected async syncNotesAsync(from: DayValue, to: DayValue): Promise<void> {
    //fetch push new data to server and fetch all data from server
    const fromDateId = this.dateUtil.getBasisDayId(from);
    const toDateId = this.dateUtil.getBasisDayId(to);
    const form = new FormData();
    form.append("userid", this.userId.toString());
    form.append("ownerid", "0");
    form.append("from", `${fromDateId}`);
    form.append("to", `${toDateId}`);
    let apiLink = this.options.baseUrl["usernotes"]
    apiLink = apiLink.toString().replace("${rkey}" , this.rKey)
    const data = await this.sendAsyncData(
      form,
      apiLink
    );
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
    this.renderAsync();
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
    this.renderAsync();
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
    this.renderAsync();
  }
  protected createMountHeader(): Node {
    const headerElement = document.createElement("div");
    const monthNameElement = document.createElement("div");
    const controlElement = document.createElement("div");
    const monthsControlElement = document.createElement("div");
    headerElement.setAttribute("data-calendar-Header", "");
    monthNameElement.setAttribute("data-calendar-title", "");
    controlElement.setAttribute("data-calendar-tools", "");
    monthsControlElement.setAttribute("data-months-tools", "");
    monthNameElement.textContent =
      this.months[this.activeIndex].monthName +
      this.months[this.activeIndex].value.year;
    if (this.monthValues.length == 1) {
      const nextButton = document.createElement("button");
      const prevButton = document.createElement("button");
      nextButton.addEventListener("click", (e) => {
        this.nextMonth();
      });
      prevButton.addEventListener("click", (e) => {
        this.prevMonth();
      });
      nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path></svg>`;
      prevButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path></svg>`;
      nextButton.setAttribute("data-calendar-next", "");
      prevButton.setAttribute("data-calendar-prev", "");
      controlElement.appendChild(nextButton);
      controlElement.appendChild(prevButton);
      const todayButton = document.createElement("button");
      todayButton.addEventListener("click", (e) => {
        this.goToday();
      });
      todayButton.setAttribute("data-calendar-today-btn", "");
      todayButton.innerHTML = this.options.lid == 1 ? "امروز" : "Today";
      controlElement.appendChild(todayButton);
    } else {
      const monthsBtnWrapper = document.createElement("div");
      this.monthValues.map((x, index) => {
        const monthBtn = document.createElement("button");
        monthBtn.setAttribute("data-calendar-month-btn", "");
        monthBtn.textContent = this.dateUtil.getMonthName(
          x,
          this.options.culture,
          this.options.lid
        );
        monthBtn.addEventListener("click", (e) => {
          this.months[this.activeIndex] = this.months[index];
          this.renderAsync();
        });
        monthsBtnWrapper.appendChild(monthBtn);
      });
      monthsControlElement.appendChild(monthsBtnWrapper);
    }
    headerElement.appendChild(controlElement);
    headerElement.appendChild(monthsControlElement);
    headerElement.appendChild(monthNameElement);
    return headerElement;
  }
  protected generateDaysName(): Node {
    const daysName = this.dateUtil.getDayNames(this.options.lid);
    const weekNameWrapper: Element = document.createElement("div");
    weekNameWrapper.setAttribute("data-calendar-day-names", "");
    for (const index in daysName) {
      const dayWrapper: Element = document.createElement("div");
      const faSpan: Element = document.createElement("span");
      dayWrapper.setAttribute("data-calendar-day-name", "");
      faSpan.textContent = daysName[index];
      dayWrapper.appendChild(faSpan);
      weekNameWrapper.appendChild(dayWrapper);
    }
    return weekNameWrapper;
  }
  protected createMountBody(): Node {
    const monthsContainer = document.createElement("div");
    monthsContainer.setAttribute("data-calendar-month-container", "");
    const bodyElement = document.createElement("div");
    const mainElement = document.createElement("div");
    bodyElement.setAttribute("data-calendar-body", "");
    mainElement.setAttribute("data-calendar-days", "");
    const firstDayInMonth = this.months[this.activeIndex].firstDayInMonth;
    const lastDayInMonth = this.months[this.activeIndex].lastDayInMonth;
    bodyElement.append(this.generateDaysName());
    for (var j = 0; j < firstDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-calendar-day", "");
      mainElement.appendChild(dayElement);
    }
    this.months[this.activeIndex].days.map((x) => {
      const dayElement = new UiCalendar(this, x).generateDaysUi();
      mainElement.appendChild(dayElement);
    });

    for (var j = 0; j < 6 - lastDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-calendar-day", "");
      mainElement.appendChild(dayElement);
    }
    bodyElement.append(mainElement);
    monthsContainer.appendChild(bodyElement);
    return monthsContainer;
  }
  protected createMountFooter(): Node {
    //create related element
    var footerElement = document.createElement("div");
    return footerElement;
  }
  async renderAsync(): Promise<void> {
    this.wrapper.innerHTML = "";
    this.wrapper.setAttribute("id", "basis-calendar");
    const headerPart = this.createMountHeader();
    const bodyPart = this.createMountBody();
    const footerPart = this.createMountFooter();
    //Extra process..
    this.wrapper.appendChild(headerPart);
    this.wrapper.appendChild(bodyPart);
    this.wrapper.appendChild(footerPart);
  }
  public async createUIAsync(container: Element): Promise<void> {
    if (this.options.displayNote) {
      //load notes from server;
      await this.refreshNotesAsync();
    }
    this.wrapper = container;
    return this.renderAsync();
  }
  async sendAsyncData(form: FormData, url: string ) {
    const response = await fetch(url, {
      method: "POST",
      body: form,
    });
    return response.json();
  }
}
