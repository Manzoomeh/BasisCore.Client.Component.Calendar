
import { Month } from "./Month/Month";
import {
  Culture,
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
  async goToday(culture: Culture): Promise<void> {
    if(this.options.culture == "fa"){
      var todayMonthValues: MonthValue = {
        year: this.months[this.activeIndex].currentDate.year,
        month: this.months[this.activeIndex].currentDate.month,
      };
    }
    else{
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
    const currentYear = document.createElement("div")
    const controlElement = document.createElement("div");
    const secondMonthName = document.createElement("div")
    const calendarHeader : HTMLElement = document.createElement("div")
    headerElement.setAttribute("data-calendar-Header", "");
    monthNameElement.setAttribute("data-calendar-title", "");
    monthNameElement.setAttribute("data-sys-text","")
    controlElement.setAttribute("data-calendar-tools", "");
    currentYear.setAttribute("data-calendar-year","")
    currentYear.textContent = " " + this.months[this.activeIndex].value.year;
    monthNameElement.textContent =
    this.months[this.activeIndex].monthName + " " + this.months[this.activeIndex].currentYear
    if(this.options.culture == "fa"){
      secondMonthName.setAttribute("data-calendar-second-culture","")
      secondMonthName.textContent= this.months[this.activeIndex].secondMonthName 
    }
    
    monthNameElement.appendChild(secondMonthName)
    const todayButton = document.createElement("button");
    const todayWrapper = document.createElement("div")
    todayButton.addEventListener("click", (e) => {
      this.goToday(this.options.culture);
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
      nextButton.innerHTML = `
      <svg width="8" height="16" viewBox="0 0 8 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.51192 0.430571C0.826414 0.161005 1.29989 0.197426 1.56946 0.51192L7.56946 7.51192C7.8102 7.79279 7.8102 8.20724 7.56946 8.48811L1.56946 15.4881C1.29989 15.8026 0.826414 15.839 0.51192 15.5695C0.197426 15.2999 0.161005 14.8264 0.430571 14.5119L6.01221 8.00001L0.430571 1.48811C0.161005 1.17361 0.197426 0.700138 0.51192 0.430571Z" fill="#1C274C"/>
      </svg>
      
      `;
      prevButton.innerHTML = `
      <svg width="8" height="16" viewBox="0 0 8 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.48809 0.430571C7.80259 0.700138 7.83901 1.17361 7.56944 1.48811L1.98781 8.00001L7.56944 14.5119C7.83901 14.8264 7.80259 15.2999 7.48809 15.5695C7.1736 15.839 6.70012 15.8026 6.43056 15.4881L0.430558 8.48811C0.189814 8.20724 0.189814 7.79279 0.430558 7.51192L6.43056 0.51192C6.70012 0.197426 7.1736 0.161005 7.48809 0.430571Z" fill="#1C274C"/>
      </svg>
      
      `;
      nextYear.innerHTML = `
     
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.51192 0.430571C0.826414 0.161005 1.29989 0.197426 1.56946 0.51192L7.56946 7.51192C7.8102 7.79279 7.8102 8.20724 7.56946 8.48811L1.56946 15.4881C1.29989 15.8026 0.826414 15.839 0.51192 15.5695C0.197426 15.2999 0.161005 14.8264 0.430571 14.5119L6.01221 8.00001L0.430571 1.48811C0.161005 1.17361 0.197426 0.700138 0.51192 0.430571ZM4.51212 0.430675C4.82661 0.161108 5.30008 0.19753 5.56965 0.512024L11.5697 7.51202C11.8104 7.79289 11.8104 8.20734 11.5697 8.48821L5.56965 15.4882C5.30008 15.8027 4.82661 15.8391 4.51212 15.5696C4.19762 15.3 4.1612 14.8265 4.43077 14.512L10.0124 8.00012L4.43077 1.48821C4.1612 1.17372 4.19762 0.700242 4.51212 0.430675Z" fill="#1C274C"/>
      </svg>
      `
      prevYear.innerHTML = `
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M11.488 0.430571C11.8025 0.700138 11.8389 1.17361 11.5693 1.48811L5.98771 8.00001L11.5693 14.5119C11.8389 14.8264 11.8025 15.2999 11.488 15.5695C11.1735 15.839 10.7 15.8026 10.4305 15.4881L4.43046 8.48811C4.18972 8.20724 4.18972 7.79279 4.43046 7.51192L10.4305 0.51192C10.7 0.197426 11.1735 0.161005 11.488 0.430571ZM7.48809 0.430674C7.80259 0.70024 7.83901 1.17372 7.56944 1.48821L1.98781 8.00012L7.56944 14.512C7.83901 14.8265 7.80259 15.3 7.48809 15.5696C7.1736 15.8391 6.70012 15.8027 6.43056 15.4882L0.430558 8.48821C0.189814 8.20734 0.189814 7.79289 0.430558 7.51202L6.43056 0.512023C6.70012 0.197528 7.1736 0.161107 7.48809 0.430674Z" fill="#1C274C"/>
      </svg>
      `
      nextButton.setAttribute("data-calendar-next", "");
      nextButton.setAttribute("type","button")
      prevButton.setAttribute("data-calendar-prev", "");
      prevButton.setAttribute("type","button")
      nextYear.setAttribute("data-calendar-next-year","")
      nextYear.setAttribute("type","button")
      prevYear.setAttribute("data-calendar-prev-year","")
      prevYear.setAttribute("type","button")
      prevButton.setAttribute("data-tree-tooltip","")
      prevButton.setAttribute("data-tree-tooltip",this.options.labels.previousLabel)
      nextButton.setAttribute("data-tree-tooltip","")
      nextButton.setAttribute("data-tree-tooltip",this.options.labels.nextLabel)
      nextYear.setAttribute("data-tree-tooltip","")
      nextYear.setAttribute("data-tree-tooltip",this.options.labels.nextYear)
      prevYear.setAttribute("data-tree-tooltip","")
      prevYear.setAttribute("data-tree-tooltip",this.options.labels.previousYear)
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
