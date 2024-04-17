
import { Month } from "./Month/Month";
import { Culture, DayValue, MonthNumber, MonthValue } from "./type-alias";
import { IDatePickerOptions } from "./Interface/Interface";
import { IDateUtil } from "./IDateUtil/IDateUtil";
import { BasisCoreDateUtil } from "./BasisCoreDateUtil/BasisCoreDateUtil";
import { PersianDateUtil } from "./PersianDateUtil/PersianDateUtil";
import { UiDatePicker } from "./UiDatePicker/UiDatePicker";
import {DatePickerThemes} from "./DatePickerThemes/DatePickerThemes"
import {UiDatePickerMobile} from "./UiDatePickerMobile/UiDatePickerMobile"
export class DatePicker {
  public readonly dateUtil: IDateUtil;
  public  months: Array<Month> = new Array<Month>();
  public readonly options: IDatePickerOptions;
  private  monthValues: MonthValue[];
  private bodyElement : HTMLElement
  private headerElement : HTMLElement
  public wrapper: Element;
  public datePickerInput: HTMLInputElement;
  public activeIndex: number;
  public todayId : number=0
  public datesArray : DayValue[] = [];
  fromdate : string 
  private static readonly defaultCalenderOptions: Partial<IDatePickerOptions> =
    {
      dateProvider: "basisCalendar",
      culture: "fa",
      lid: 1,
      todayButton: false,
      yearsList : false,
      monthList : false,
      rangeDates : false,
      switchType : false,
      theme :"basic",
      type: "load",
      disabledPrevButton: false,
      rangeDatesSeparated: false
    };

  public constructor(
    from: DayValue,
    to: DayValue,
    options?: IDatePickerOptions,
   
  ) {
    this.activeIndex = 0;
    this.options = {
      ...DatePicker.defaultCalenderOptions,
      ...(options as any),
    };
    this.dateUtil =
      this.options.dateProvider == "basisCalendar"
        ? new BasisCoreDateUtil()
        : new PersianDateUtil();
    const style=  document.createElement("link")
    style.setAttribute("href" , this.options.style)
    style.setAttribute("rel" , "stylesheet")
    style.setAttribute("type" , "text/css")
    document.querySelector("head").appendChild(style)
    this.monthValues = this.dateUtil.getMonthValueList(from, to);
    this.monthValues.map((x) => this.months.push(new Month(this, x)));
    this.bodyElement =  document.createElement("div");
 

  }

  nextMonth(nextButtonWrapper : HTMLElement): void {
    if(this.options.disabledPrevButton){nextButtonWrapper.previousElementSibling.previousElementSibling.removeAttribute("data-disabled-prev")};
    let nextMonthValues: MonthValue;
    nextMonthValues = this.dateUtil.nextMonth(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);

    this.renderAsync();
  }
  prevMonth(prevButtonWrapper : HTMLElement): void {
    if(this.options.disabledPrevButton){
      const objCurrentDate = {
        year: this.months[this.activeIndex].currentDate.year,
        month: this.months[this.activeIndex].currentDate.month
      }
      if (objCurrentDate.year == this.activeMonth().value.year && objCurrentDate.month == this.activeMonth().value.month) {
          prevButtonWrapper.setAttribute("data-disabled-prev", "")
      } else {
          prevButtonWrapper.removeAttribute("data-disabled-prev"),
          this.runPrevMonth()
      }
    }else{
        this.runPrevMonth()
    }
  }
  runPrevMonth(): void {
    let nextMonthValues: MonthValue;
    nextMonthValues = this.dateUtil.prevMonth(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);
    this.renderAsync();
  }
  goToday(culture? : Culture): void {
    let todayMonthValues: MonthValue = {
      year: this.months[this.activeIndex].currentDate.year,
      month: this.months[this.activeIndex].currentDate.month,
    };
    console.log("aaaaa",this.months[this.activeIndex].currentDate.year,this.months[this.activeIndex].currentDate.month)
    this.months[this.activeIndex] = new Month(this, todayMonthValues);

    this.renderAsync();
  }
  protected createMountHeader(): Node {
    this.headerElement = document.createElement("div");
    const monthNameElement = document.createElement("div");
    const nextButton = document.createElement("button");
    const prevButton = document.createElement("button");
    const yearNumber = document.createElement("span")
    const monthName = document.createElement("span")
    const headerTitles = document.createElement("div")
    headerTitles.setAttribute("data-datepicker-button-full" , "")
    const secondMonthNameElement = document.createElement("div")
    const secondMonthName = document.createElement("span")
    secondMonthName.setAttribute("data-datepicker-second-title","")
    secondMonthName.setAttribute("data-sys-text","")
    secondMonthName.textContent= this.months[this.activeIndex].secondMonthName
    secondMonthNameElement.appendChild(secondMonthName)
    this.headerElement.setAttribute("data-datepicker-header", "");    
    monthNameElement.setAttribute("data-datepicker-title", "");
    monthNameElement.setAttribute("data-sys-text" , "")
    yearNumber.setAttribute("data-datepicker-year-number" , "")
    yearNumber.textContent= this.months[this.activeIndex].value.year + ""
    monthName.textContent = this.months[this.activeIndex].monthName 
    monthNameElement.appendChild(monthName)
    monthNameElement.appendChild(yearNumber)
    headerTitles.appendChild(monthNameElement)
    headerTitles.appendChild(secondMonthName)
    if (this.options.yearsList == true) {
      yearNumber.setAttribute("data-datepicker-yearnumber-select" , "")
      yearNumber.addEventListener("click", (e) => {
        this.showYears(yearNumber);
      });
    }
    if (this.options.monthList == true) {
      monthName.setAttribute("data-datepicker-month-select" , "")
      monthName.addEventListener("click", (e) => {
        this.showMonth(monthName);
      });
    }
    if (this.monthValues.length == 1) {
      nextButton.addEventListener("click", (e) => {
        this.nextMonth(nextButton);
      });
      prevButton.addEventListener("click", (e) => {
        this.prevMonth(prevButton);
    });
    
    nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path></svg>`;
    prevButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path></svg>`;
    nextButton.setAttribute("data-datepicker-next", "");
    prevButton.setAttribute("data-datepicker-prev", "");
    nextButton.setAttribute("data-sys-inherit","")
    prevButton.setAttribute("data-sys-inherit","")
    nextButton.setAttribute("data-sys-text","")
    prevButton.setAttribute("data-sys-text","")
    } else {
      const monthsBtnWrapper = document.createElement("div");
      this.monthValues.map((x, index) => {
        const monthBtn = document.createElement("button");
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
    // headerTitles.appendChild(secondMonthName)

    const headerTitle = document.createElement("div")
    headerTitle.setAttribute("data-datepicker-header-title","")
    headerTitle.appendChild(prevButton)
    headerTitle.appendChild(headerTitles)
    headerTitle.appendChild(nextButton)
    this.headerElement.appendChild(headerTitle)
    //hello
    if(this.options.switchType){
      const changeTypeButton = document.createElement("button")
      changeTypeButton.setAttribute("data-datepicker-chaneType-btn" , "")
      changeTypeButton.innerHTML= `<svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path data-sys-text="" d="M18.6154 16.9231L16.9231 18.6154H18.1923C18.1923 20.0158 17.0542 21.1538 15.6538 21.1538C15.2265 21.1538 14.8204 21.0481 14.4692 20.8577L13.8515 21.4754C14.3719 21.8054 14.9896 22 15.6538 22C17.5238 22 19.0385 20.4854 19.0385 18.6154H20.3077L18.6154 16.9231ZM13.1154 18.6154C13.1154 17.215 14.2535 16.0769 15.6538 16.0769C16.0812 16.0769 16.4873 16.1827 16.8385 16.3731L17.4562 15.7554C16.9358 15.4254 16.3181 15.2308 15.6538 15.2308C13.7838 15.2308 12.2692 16.7454 12.2692 18.6154H11L12.6923 20.3077L14.3846 18.6154H13.1154Z" fill="#767676"/>
      <path data-sys-text="" d="M10.5299 8.37692H6.76923V12.1846H10.5299V8.37692ZM9.77778 0V1.52308H3.76068V0H2.25641V1.52308H1.50427C0.669402 1.52308 0.00752136 2.20846 0.00752136 3.04615L0 13.7077C0 14.5454 0.669402 15.2308 1.50427 15.2308H12.0342C12.8615 15.2308 13.5385 14.5454 13.5385 13.7077V3.04615C13.5385 2.20846 12.8615 1.52308 12.0342 1.52308H11.2821V0H9.77778ZM12.0342 13.7077H1.50427V5.33077H12.0342V13.7077Z" fill="#767676"/>
      </svg>
      `
      changeTypeButton.addEventListener("click" , e =>{
        this.goToday()
        if(this.options.culture == "en"){
          var convertDate :DayValue= this.dateUtil.convertToJalali(this.months[this.activeIndex].value)   
        }
        else{
          var convertDate :DayValue=  this.dateUtil.convertToGregorian(this.months[this.activeIndex].value)
        }
        if(this.options.secondCulture){
          this.options.secondCulture = (this.options.secondCulture == "en" ? "fa" : "en") 
        }
        this.options.lid=(this.options.culture == "en" ? 1: 2)
        this.options.culture = (this.options.culture == "en" ? "fa" : "en") 
        this.monthValues = this.dateUtil.getMonthValueList(convertDate, convertDate);
        this.months = []
        this.monthValues.map((x) => this.months.push(new Month(this, x)));
        this.renderAsync()
      })
      this.headerElement.appendChild(changeTypeButton)
    }

    // this.headerElement.appendChild(prevButton)
    // this.headerElement.appendChild(headerTitles)
    // this.headerElement.appendChild(nextButton)

    return this.headerElement;
  }
  protected activeMonth(): Month{
   return this.months[this.activeIndex]
  }
  protected showYears(yearNumberWrapper : HTMLElement): void{
    const lastOldData : string = this.bodyElement.innerHTML
    this.bodyElement.innerHTML = ""
    this.bodyElement.setAttribute("data-datepicker-body-years-list","")
    const closeBtnWrapper = document.createElement("span")
    closeBtnWrapper.setAttribute("data-bc-close-year-list" , "")
    closeBtnWrapper.textContent= 'x'
    this.headerElement.querySelector("[data-datepicker-title]").appendChild(closeBtnWrapper)
    const yearList = document.createElement("ul")
    yearList.setAttribute("data-datepicker-years-list" , "")
    for(var i = 1369 ; i <=1420 ; i++){
      const yearListLi = document.createElement("li")
      yearListLi.textContent = i+""
      yearListLi.setAttribute("year-number" , i.toString())
      yearListLi.addEventListener("click", e => {
        yearNumberWrapper.textContent=""
        yearNumberWrapper.textContent = yearListLi.getAttribute("year-number")
        const year = yearListLi.getAttribute("year-number")
        const currentMonth = this.activeMonth()
        let selectedYear : MonthValue =  {
          year : parseInt(year)  ,
          month : currentMonth.value.month
        }  
          
        this.months[this.activeIndex] = new Month(this, selectedYear);
        this.renderAsync();
        this.bodyElement.removeAttribute("data-datepicker-body-years-list") 
      });
      yearList.appendChild(yearListLi)
    }
    closeBtnWrapper.addEventListener("click", e => {
      this.bodyElement.removeAttribute("data-datepicker-body-years-list") 
      yearList.remove()
      this.bodyElement.innerHTML = lastOldData
      closeBtnWrapper.remove()
    })
    this.bodyElement.appendChild(yearList)
  }
  protected showMonth (monthWrapper : HTMLElement) : void{
    const lastOldData : string = this.bodyElement.innerHTML
    this.bodyElement.innerHTML = ""
    this.bodyElement.setAttribute("data-datepicker-body-years-list","")
    const closeBtnWrapper = document.createElement("span")
    closeBtnWrapper.setAttribute("data-bc-close-year-list" , "")
    closeBtnWrapper.textContent= 'x'
    this.headerElement.querySelector("[data-datepicker-title]").appendChild(closeBtnWrapper)
    const monthList = document.createElement("ul")
    monthList.setAttribute("data-datepicker-month-list" , "")
    for(var i = 1 ; i <=12 ; i++){
      const currentMonth = this.activeMonth()
      const currentMonthInLoop : MonthValue = {
        year : currentMonth.value.year,
        month : i as MonthNumber
      }
      const t = this.dateUtil.getMonthName(currentMonthInLoop , this.options.culture , this.options.lid)
      const monthListLi = document.createElement("li")
      monthListLi.textContent = t
      monthListLi.setAttribute("month-number" , i.toString())
      monthListLi.setAttribute("month-name" , t)
      monthListLi.addEventListener("click", e => {
        monthWrapper.textContent=""
        monthWrapper.textContent = monthListLi.getAttribute("month-name")
        const month = monthListLi.getAttribute("month-number")
        const currentMonth = this.activeMonth()
        let selectedMonth : MonthValue =  {
          year : currentMonth.value.year  ,
          month : parseInt(month) as MonthNumber
        }         
        this.months[this.activeIndex] = new Month(this, selectedMonth);
        this.renderAsync();
        this.bodyElement.removeAttribute("data-datepicker-body-years-list") 
      });
      monthList.appendChild(monthListLi)
    }
    closeBtnWrapper.addEventListener("click", e => {
      this.bodyElement.removeAttribute("data-datepicker-body-years-list") 
      monthList.remove()
      this.bodyElement.innerHTML = lastOldData
      closeBtnWrapper.remove()
    })
    this.bodyElement.appendChild(monthList)
  }
  protected generateDaysName(): Node {
    const daysName = this.dateUtil.getDayNames(this.options.lid , this.options.culture);
    const weekNameWrapper: Element = document.createElement("div");
    weekNameWrapper.setAttribute("datepicker-header", "");
    if(this.options.culture == "en"){
      weekNameWrapper.setAttribute("datepicker-header-en" , "")
    }
    for (const index in daysName) {
      const dayWrapper: Element = document.createElement("div");
      const faSpan: Element = document.createElement("span");
      dayWrapper.setAttribute("data-datepicker-day-name", "");
      faSpan.setAttribute("data-sys-text" , "")
      faSpan.textContent = daysName[index];
      dayWrapper.appendChild(faSpan);
      weekNameWrapper.appendChild(dayWrapper);
    }
    // if (this.options.action) {
    //   // const copyActionItemLayout = actionItemLayout
    //   // const actionUI = $bc.util.toHTMLElement(copyActionItemLayout) as HTMLAnchorElement;
    //                             actionUI.addEventListener("click", e => {
    //                                 e.preventDefault();
    //                                 object.action(node, actionUI);
    // }
   
    //                           });
    return weekNameWrapper;
  }
  protected createMountBody(): Node {
    const monthsContainer = document.createElement("div");    
    const mainElement = document.createElement("div");
    this.bodyElement.setAttribute("data-datepicker-body", "");
    mainElement.setAttribute("data-datepicker-days", "");
    if(this.options.culture == "en"){
      mainElement.setAttribute("data-datepicker-days-en", "");
    }
    let firstDayInMonth = this.months[this.activeIndex].firstDayInMonth;
    const lastDayInMonth = this.months[this.activeIndex].lastDayInMonth;
    this.bodyElement.append(this.generateDaysName());
    if(this.options.culture == "en"){
      firstDayInMonth = firstDayInMonth - 1 
      firstDayInMonth =  firstDayInMonth== -1 ? 6 : firstDayInMonth
    }
    for (var j = 0; j < firstDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-datepicker-day", "");
      dayElement.setAttribute("data-sys-inherit","")
      dayElement.setAttribute("data-sys-text-white","")
      mainElement.appendChild(dayElement);
    }
    if(this.options.mode == "desktop"){
      this.months[this.activeIndex].days.map((x) => {
      
        if(this.options.rangeDates == false){
          new UiDatePicker(this, x ).generateDaysUi(mainElement);
        }
        else {
          new UiDatePicker(this, x ).generateDaysUiWithDateRange(mainElement);
        }
      
        
      });
    }
    else{
      new UiDatePickerMobile(this).generateDaysUiAppModel(mainElement);
    }


    for (var j = 0; j < 6 - lastDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-datepicker-day", "");
      dayElement.setAttribute("data-sys-inherit","")
      mainElement.appendChild(dayElement);
    }
    this.bodyElement.append(mainElement);
    monthsContainer.appendChild(this.bodyElement);
    return monthsContainer;
  }
  protected createMountFooter(): Node {
    //create related element
    var footerElement = document.createElement("div");
    footerElement.setAttribute("data-datepicker-footer" , "")
    if (this.options.todayButton == true) {
      const todayButton = document.createElement("button");
      todayButton.addEventListener("click", (e) => {
        this.goToday();
      });
      todayButton.setAttribute("data-datepicker-today-btn", "");
      if(this.options.mode=="desktop"){
        todayButton.innerHTML = this.options.lid == 1 ? "امروز" : "Today";
      }
      
      footerElement.appendChild(todayButton);
    }

    if(this.options.switchType){
      const changeTypeButton = document.createElement("button")
      changeTypeButton.setAttribute("data-datepicker-chaneType-btn" , "")
      // changeTypeButton.textContent= (this.options.culture == "en" ? "شمسی" : "میلادی")
      changeTypeButton.addEventListener("click" , e =>{
        this.goToday()
        if(this.options.culture == "en"){
          var convertDate :DayValue= this.dateUtil.convertToJalali(this.months[this.activeIndex].value)   
        }
        else{
          var convertDate :DayValue=  this.dateUtil.convertToGregorian(this.months[this.activeIndex].value)
        }
        if(this.options.secondCulture){
          this.options.secondCulture = (this.options.secondCulture == "en" ? "fa" : "en") 
        }
        this.options.lid=(this.options.culture == "en" ? 1: 2)
        this.options.culture = (this.options.culture == "en" ? "fa" : "en") 
        this.monthValues = this.dateUtil.getMonthValueList(convertDate, convertDate);
        this.months = []
        this.monthValues.map((x) => this.months.push(new Month(this, x)));
        this.renderAsync()
      })
      footerElement.appendChild(changeTypeButton)
    }

    return footerElement;
  }
  async renderAsync(): Promise<void> {
    this.wrapper.innerHTML = "";
    this.bodyElement.innerHTML=""
    this.wrapper.setAttribute("id", "basis-datepicker");
    this.wrapper.setAttribute("data-sys-inherit","")
    const headerPart = this.createMountHeader();
    const bodyPart = this.createMountBody();
    const footerPart = this.createMountFooter();
    //Extra process..
    this.wrapper.appendChild(headerPart);
    this.wrapper.appendChild(bodyPart);
    this.wrapper.appendChild(footerPart);    
    const styles=document.createElement("style")
    const nameStyle = this.options.theme
    const styleName = `styleLayout_${nameStyle}`
    const themeStyle= new DatePickerThemes(styleName).getStyle()
    
    styles.innerHTML =themeStyle
      this.wrapper.appendChild(styles)

  }
  public async createUIAsync(container?: Element): Promise<void> {
    this.datePickerInput = container as HTMLInputElement;
    this.wrapper = document.createElement("div");
    if(this.options.type == "load"){
      container.parentNode.insertBefore(this.wrapper, container.nextSibling);
    }
    else{
      container.addEventListener("click", (e) => {
        const inputElement = e.target as HTMLInputElement;
        if(this.options.rangeDates == false){
          if(inputElement.getAttribute("data-datepicker-dateid") !== null){
            inputElement.value = "";
            inputElement.setAttribute("value","");inputElement.removeAttribute("data-datepicker-dateid");inputElement.removeAttribute("data-datepicker-sstring");
          }
        }else {
          if(inputElement.getAttribute("data-datepicker-to-dateid") !== null){
            inputElement.value = "";
            inputElement.setAttribute("value","");inputElement.removeAttribute("data-datepicker-dateid");inputElement.removeAttribute("data-datepicker-to-dateid");inputElement.removeAttribute("data-datepicker-sstring");inputElement.removeAttribute("data-datepicker-to-sstring");
          }
        }
        e.stopPropagation();
        container.parentNode.insertBefore(this.wrapper, container.nextSibling);
      });
      window.addEventListener("click", () => {
        this.wrapper.remove();
      });
      this.wrapper.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  
   
    
  
    return this.renderAsync();
  }

}
