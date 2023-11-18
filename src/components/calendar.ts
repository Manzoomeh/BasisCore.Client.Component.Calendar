
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
import { UiMbobile } from "./mobile/UiMobile";
import IUserDefineComponent from "../basiscore/IUserDefineComponent";
export class DateRange {
  public readonly dateUtil: IDateUtil;
  public readonly months: Array<Month> = new Array<Month>();
  public readonly options: ICalenderOptions;
  private readonly monthValues: MonthValue[];
  public note: INote[];
  public rKey: string;
  public wrapper: HTMLElement;
  public activeIndex: number;
  public userId : number =0;
  public todayId : number=0
  public readonly Owner?:IUserDefineComponent;
  private runHeader : boolean = false
  public categories : Array<ICatNote> = new Array<ICatNote>();
  private static readonly defaultCalenderOptions: Partial<ICalenderOptions> = {
    dateProvider: "basisCalendar",
    displayNote: true,
    culture: "fa",
    secondCulture: "en",
    lid: 1,
    theme : "basic",
    mode:"desktop",
    level:"user"
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
    let userIdObj = await this.sendAsyncDataGetMethod( apiLink["userid"] );    
    this.userId =parseInt(userIdObj.userid) 
    return null;
  }
  public async getCategories(){
    // this.Owner.addTrigger("")
    if(this.options.displayNote == true){
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
        creatoruser : x.creatoruser,
        sharinginfo : x.sharinginfo
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
    this.runAsync();
  }
  protected createMountHeader(): Node {
    const headerElement = document.createElement("div");
    const monthNameElement = document.createElement("div");
    const currentYear = document.createElement("div")
    const controlElement = document.createElement("div");
    const secondMonthName = document.createElement("div")
    const calendarHeader : HTMLElement = document.createElement("div")
    headerElement.setAttribute("data-calendar-Header", "");
    monthNameElement.setAttribute("data-calendar-title", "");
    monthNameElement.setAttribute("data-sys-text","")
    controlElement.setAttribute("data-calendar-tools", "");
    secondMonthName.setAttribute("data-calendar-second-culture","")
    currentYear.setAttribute("data-calendar-year","")
    currentYear.textContent = " " + this.months[this.activeIndex].value.year;
    monthNameElement.textContent =
      this.months[this.activeIndex].monthName + " " + this.months[this.activeIndex].currentYear
    secondMonthName.textContent= this.months[this.activeIndex].secondMonthName 
    monthNameElement.appendChild(secondMonthName)
    const todayButton = document.createElement("button");
    const todayWrapper = document.createElement("div")
    todayButton.addEventListener("click", (e) => {
      this.goToday();
    });
    const todayIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9H4V11H6V9ZM10 9H8V11H10V9ZM14 9H12V11H14V9ZM16 2H15V0H13V2H5V0H3V2H2C0.89 2 0.00999999 2.9 0.00999999 4L0 18C0 19.1 0.89 20 2 20H16C17.1 20 18 19.1 18 18V4C18 2.9 17.1 2 16 2ZM16 18H2V7H16V18Z" fill="white"/>
    </svg>
    `
    const todayText = document.createElement("span")
    todayText.innerText = this.options.labels.todayTitle
    todayButton.setAttribute("data-calendar-today-btn", "");
    todayButton.innerHTML = todayText.innerText + todayIcon
    if(this.options.mode == "mobile"){
      todayButton.innerHTML = ""
      todayButton.removeAttribute("data-calendar-today-btn")
      todayButton.setAttribute("data-calendar-today-btn-mobile","")
      todayButton.innerHTML = todayIcon
      
    }
    else{
      todayButton.setAttribute("data-sys-button","")
    }
    todayWrapper.appendChild(todayButton);
    if (this.monthValues.length == 1) {
      
      const nextButton = document.createElement("button");
      const prevButton = document.createElement("button");
      const nextYear = document.createElement("button")
      const prevYear = document.createElement("button")
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
      </svg>`
      prevYear.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="20" height="20" viewBox="0 0 256 256" xml:space="preserve">

      <defs>
      </defs>
      <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
        <path d="M 7.161 90 c -1.792 0 -3.583 -0.684 -4.95 -2.05 c -2.734 -2.734 -2.734 -7.166 0 -9.9 L 35.262 45 L 2.211 11.95 c -2.734 -2.733 -2.734 -7.166 0 -9.899 c 2.733 -2.733 7.166 -2.733 9.899 0 l 38 38 c 2.733 2.733 2.733 7.166 0 9.9 l -38 38 C 10.744 89.316 8.953 90 7.161 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill:#767676; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
        <path d="M 44.839 90 c -1.792 0 -3.583 -0.684 -4.95 -2.05 c -2.734 -2.734 -2.734 -7.166 0 -9.9 L 72.939 45 l -33.05 -33.05 c -2.734 -2.733 -2.734 -7.166 0 -9.899 c 2.733 -2.732 7.166 -2.733 9.9 0 l 38 38 c 2.733 2.733 2.733 7.166 0 9.9 l -38 38 C 48.422 89.316 46.63 90 44.839 90 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #767676; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
      </g>
      </svg>`
      nextButton.setAttribute("data-calendar-next", "");
      prevButton.setAttribute("data-calendar-prev", "");
      nextYear.setAttribute("data-calendar-next-year","")
      prevYear.setAttribute("data-calendar-prev-year","")
      controlElement.appendChild(nextYear)
      controlElement.appendChild(nextButton);
      controlElement.appendChild(monthNameElement)
      controlElement.appendChild(prevButton);
      controlElement.appendChild(prevYear);
     
    } else {
      
      const monthsBtnWrapper = document.createElement("select");
      monthsBtnWrapper.setAttribute("data-calendar-month-wrapper" , "")
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
          this.runAsync();
        });
        monthsBtnWrapper.appendChild(monthBtn);
      });
      controlElement.appendChild(monthsBtnWrapper)
    }
    
    calendarHeader.setAttribute("bc-calendar-calendar-header","")
    // calendarHeader.appendChild(controlElement);
    // calendarHeader.appendChild(monthNameElement);
    // controlElement.appendChild(currentYear)
    calendarHeader.appendChild(controlElement)
    headerElement.appendChild(todayButton)
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
      dayWrapper.setAttribute("data-sys-text", "");
      dayWrapper.setAttribute("data-sys-bg","")
      enSpan.setAttribute("data-calendar-second-day-name" , "")
      enSpan.setAttribute("data-sys-text","")
      faSpan.setAttribute("data-calendar-first-day-name" , "")
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
    
    let firstDayInMonth = this.months[this.activeIndex].firstDayInMonth ;
    let lastDayInMonth = this.months[this.activeIndex].lastDayInMonth ;
    if(this.options.culture == "en"){
       firstDayInMonth = this.months[this.activeIndex].firstDayInMonth - 1;
       lastDayInMonth = this.months[this.activeIndex].lastDayInMonth - 1;
    }
 
    bodyElement.append(this.generateDaysName());
    for (var j = 0; j < firstDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-calendar-day", "");
      dayElement.setAttribute("data-sys-inherit","")
      dayElement.setAttribute("data-sys-text","")
      mainElement.appendChild(dayElement);
    }
    this.months[this.activeIndex].days.map((x) => {
      if(this.options.mode=="desktop"){
        const dayElement = new UiCalendar(this, x).generateDaysUi();
        mainElement.appendChild(dayElement);
      }
      else if(this.options.mode=="mobile"){
        const dayElement = new UiMbobile(this, x).generateDaysUi();
        mainElement.appendChild(dayElement);
      }
      
    });

    for (var j = 0; j < 6 - lastDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-calendar-day", "");
      dayElement.setAttribute("data-sys-inherit","")
      dayElement.setAttribute("data-sys-text","")
      mainElement.appendChild(dayElement);
    }
    bodyElement.append(mainElement);
    monthsContainer.appendChild(bodyElement);
    return monthsContainer;
  }
  protected createMountFooter(): Node {
    //create related element
    var footerElement = document.createElement("div");
    this.runHeader = true
    return footerElement;
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
    const style=  document.createElement("link")
    style.setAttribute("href" , this.options.style)
    style.setAttribute("rel" , "stylesheet")
    style.setAttribute("type" , "text/css")
    await document.querySelector("head").appendChild(style)
    this.wrapper = container;   
    // this.wrapper.style.display = "none"
    if (this.options.displayNote) {
      await this.refreshNotesAsync();
      this.runAsync();
    }
    else{
      this.runAsync();
    }
   
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
