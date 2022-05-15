import "../asset/style.css";
import "../asset/calendar-basic.css";
import { Month } from "./Month/Month";
import {
  DayValue,
  MonthValue,
  ReminderType,
} from "./type-alias";
import { ICalenderOptions, INote, ICatNote } from "./Interface/Interface";
import { IDateUtil } from "./IDateUtil/IDateUtil";
import { BasisCoreDateUtil } from "./BasisCoreDateUtil/BasisCoreDateUtil";
import { PersianDateUtil } from "./PersianDateUtil/PersianDateUtil";
import { UiCalendar } from "./UiCalendar/UiCalendar";
import IUserDefineComponent from "../basiscore/IUserDefineComponent";
export class DateRange {
  public readonly dateUtil: IDateUtil;
  public readonly months: Array<Month> = new Array<Month>();
  public readonly options: ICalenderOptions;
  private readonly monthValues: MonthValue[];
  public note: INote[];
  public rKey: string;
  public wrapper: Element;
  public activeIndex: number;
  public userId : number =0;
  public readonly Owner?:IUserDefineComponent;
  public categories : Array<ICatNote> = new Array<ICatNote>();
  private static readonly defaultCalenderOptions: Partial<ICalenderOptions> = {
    dateProvider: "basisCalendar",
    displayNote: true,
    culture: "fa",
    secondCulture: "en",
    lid: 1,
    theme : "basic"
  };

  public  constructor(
    from: DayValue,
    to: DayValue,
    options?: ICalenderOptions,
    rkey?: string,
    owner?:IUserDefineComponent
  ) {
    this.activeIndex = 0;
    this.options = { ...DateRange.defaultCalenderOptions, ...(options as any) };
    this.rKey = rkey;
    this.Owner = owner;
    this.dateUtil =
      this.options.dateProvider == "basisCalendar"
        ? new BasisCoreDateUtil()
        : new PersianDateUtil();
    
    this.note = new Array<INote>();
    this.monthValues = this.dateUtil.getMonthValueList(from, to);
    this.monthValues.map((x) => this.months.push(new Month(this, x)));
    this.getCategories()
  }
  public  getRKey(): string {
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
    let apiLink = this.options.baseUrl
    let userIdObj = await this.sendAsyncData(form, apiLink["userid"] );    
    this.userId =parseInt(userIdObj[0].userid) 
    return null;
  }
  public async getCategories(){
    let apiLink =this.options.baseUrl["catlist"]
   const data=await this.sendAsyncDataGetMethod(apiLink)
   this.categories = [];
   data.map((x: ICatNote) =>
     this.categories.push({
       id: x.id ,
       color: x.color,
       count : x.count,
       title: x.title
     })
   );
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
    this.getCategories()
    const fromDateId = this.dateUtil.getBasisDayId(from);
    const toDateId = this.dateUtil.getBasisDayId(to);
    const form = new FormData();
    const useridd  =await this.getUserId()
    form.append("shared", "0");
    // form.append("catid", "");
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
        catid : x.catid,
        creator : x.creator,
        creatoruser : x.creatoruser
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
    const secondMonthName = document.createElement("div")
    const calendarHeader : HTMLElement = document.createElement("div")
    headerElement.setAttribute("data-calendar-Header", "");
    monthNameElement.setAttribute("data-calendar-title", "");
    monthNameElement.setAttribute("sys-text","")
    controlElement.setAttribute("data-calendar-tools", "");
    secondMonthName.setAttribute("data-calendar-second-culture","")
    monthNameElement.textContent =
      this.months[this.activeIndex].monthName + " " +
      this.months[this.activeIndex].value.year;
    secondMonthName.textContent= this.months[this.activeIndex].secondMonthName
    monthNameElement.appendChild(secondMonthName)
    if (this.monthValues.length == 1) {
      const nextButton = document.createElement("button");
      const prevButton = document.createElement("button");
      nextButton.addEventListener("click", (e) => {
        this.nextMonth();
      });
      prevButton.addEventListener("click", (e) => {
        this.prevMonth();
      });

      nextButton.innerHTML = `<svg width="11"  height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path sys-text=""  d="M0.37999 19.01C0.86999 19.5 1.65999 19.5 2.14999 19.01L10.46 10.7C10.85 10.31 10.85 9.68005 10.46 9.29005L2.14999 0.980049C1.65999 0.490049 0.86999 0.490049 0.37999 0.980049C-0.11001 1.47005 -0.11001 2.26005 0.37999 2.75005L7.61999 10L0.36999 17.25C-0.11001 17.73 -0.11001 18.5301 0.37999 19.01Z" fill="#323232"/>
      </svg>
      `;
      prevButton.innerHTML = `<svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path sys-text=""  d="M10.6201 0.990059C10.1301 0.500059 9.34006 0.500059 8.85006 0.990059L0.540059 9.30006C0.150059 9.69006 0.150059 10.3201 0.540059 10.7101L8.85006 19.0201C9.34006 19.5101 10.1301 19.5101 10.6201 19.0201C11.1101 18.5301 11.1101 17.7401 10.6201 17.2501L3.38006 10.0001L10.6301 2.75006C11.1101 2.27006 11.1101 1.47006 10.6201 0.990059Z" fill="#323232"/>
      </svg>
      `;
      nextButton.setAttribute("data-calendar-next", "");
      prevButton.setAttribute("data-calendar-prev", "");
      controlElement.appendChild(nextButton);
      controlElement.appendChild(prevButton);
      const todayButton = document.createElement("button");
      todayButton.addEventListener("click", (e) => {
        this.goToday();
      });
      const todayIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9H4V11H6V9ZM10 9H8V11H10V9ZM14 9H12V11H14V9ZM16 2H15V0H13V2H5V0H3V2H2C0.89 2 0.00999999 2.9 0.00999999 4L0 18C0 19.1 0.89 20 2 20H16C17.1 20 18 19.1 18 18V4C18 2.9 17.1 2 16 2ZM16 18H2V7H16V18Z" fill="white"/>
      </svg>
      `
      const todayText = document.createElement("span")
      todayText.innerText= this.options.lid == 1 ? "امروز" : "Today";
      todayButton.setAttribute("data-calendar-today-btn", "");
      todayButton.setAttribute("sys-button","")
      todayButton.innerHTML = todayText.innerText + todayIcon
      headerElement.appendChild(todayButton);
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
    }
    calendarHeader.setAttribute("bc-calendar-calendar-header","")
    calendarHeader.appendChild(controlElement);
    calendarHeader.appendChild(monthNameElement);
    headerElement.appendChild(calendarHeader)
    
    return headerElement;
  }
  protected generateDaysName(): Node {
    const daysName = this.dateUtil.getDayNames(this.options.lid , this.options.culture);
    const secondDayName = this.dateUtil.getDayNames(2, "en");
    const weekNameWrapper: Element = document.createElement("div");
    weekNameWrapper.setAttribute("data-calendar-day-names", "");
   
    for (const index in daysName) {
      let enIndex = parseInt(index) - 1
      if(enIndex == -1){
        enIndex= 6
      }
      const dayWrapper: Element = document.createElement("div");
      const faSpan: Element = document.createElement("span");
      const enSpan: Element = document.createElement("span")
      dayWrapper.setAttribute("data-calendar-day-name", "");
      dayWrapper.setAttribute("sys-text", "");
      dayWrapper.setAttribute("sys-bg","")
      enSpan.setAttribute("data-calendar-second-day-name" , "")
      enSpan.setAttribute("sys-text","")
      faSpan.textContent = daysName[index];
      enSpan.textContent= secondDayName[enIndex]
      dayWrapper.appendChild(faSpan);
      dayWrapper.appendChild(enSpan)
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
      dayElement.setAttribute("sys-inherit","")
      dayElement.setAttribute("sys-text","")
      mainElement.appendChild(dayElement);
    }
    this.months[this.activeIndex].days.map((x) => {
      const dayElement = new UiCalendar(this, x).generateDaysUi();
      mainElement.appendChild(dayElement);
    });

    for (var j = 0; j < 6 - lastDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-calendar-day", "");
      dayElement.setAttribute("sys-inherit","")
      dayElement.setAttribute("sys-text","")
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
    var data = new URLSearchParams();
    for (var p of form) {
      let name = p[0];
      let value = p[1];
      data.append(name, value.toString());  }
    const response = await fetch(url, {
      method: "POST",
      body: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    });
    return response.json();
  }
  async sendAsyncDataGetMethod(url: string ) {
    const response = await fetch(url, {
      method: "Get",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    });
    return response.json();
  }
  async sendAsyncDataPostJson(json: object, url: string ) {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(json),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    return response.json();
  }
}
