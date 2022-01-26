import "../asset/date-picker-style.css";
import { Month } from "./Month/Month";
import { DayValue, MonthNumber, MonthValue, YearValue } from "./type-alias";
import { IDatePickerOptions } from "./Interface/Interface";
import { IDateUtil } from "./IDateUtil/IDateUtil";
import { BasisCoreDateUtil } from "./BasisCoreDateUtil/BasisCoreDateUtil";
import { PersianDateUtil } from "./PersianDateUtil/PersianDateUtil";
import { UiDatePicker } from "./UiDatePicker/UiDatePicker";
import { Day } from "./Day/Day";
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
  public datesArray : DayValue[] = [];
  private static readonly defaultCalenderOptions: Partial<IDatePickerOptions> =
    {
      dateProvider: "basisCalendar",
      culture: "fa",
      secondCulture: "en",
      lid: 1,
      todayButton: false,
      selectDate: false,
      yearsList : false,
      monthList : false,
      rangeDates : false,
      switchType : false
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

    this.monthValues = this.dateUtil.getMonthValueList(from, to);
    this.monthValues.map((x) => this.months.push(new Month(this, x)));
    this.bodyElement =  document.createElement("div");
  }

  nextMonth(): void {
    let nextMonthValues: MonthValue;
    nextMonthValues = this.dateUtil.nextMonth(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);

    this.renderAsync();
  }
  prevMonth(): void {
    let nextMonthValues: MonthValue;
    nextMonthValues = this.dateUtil.prevMonth(
      this.months[this.activeIndex],
      this.options.culture
    );
    this.months[this.activeIndex] = new Month(this, nextMonthValues);
    this.renderAsync();
  }
  goToday(): void {
    let todayMonthValues: MonthValue = {
      year: this.months[this.activeIndex].currentDate.year,
      month: this.months[this.activeIndex].currentDate.month,
    };
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
    const headerButtons = document.createElement("div")
    this.headerElement.setAttribute("data-datepicker-header", "");    
    monthNameElement.setAttribute("data-datepicker-title", "");
    yearNumber.setAttribute("data-datepicker-year-number" , "")
    headerButtons.setAttribute("data-datepicker-buttons" , "")
    yearNumber.textContent= this.months[this.activeIndex].value.year + ""
    monthName.textContent = this.months[this.activeIndex].monthName 
    monthNameElement.appendChild(monthName)
    monthNameElement.appendChild(yearNumber)
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
        this.nextMonth();
      });
      prevButton.addEventListener("click", (e) => {
        this.prevMonth();
    });
    nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path></svg>`;
    prevButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path></svg>`;
    nextButton.setAttribute("data-datepicker-next", "");
    prevButton.setAttribute("data-datepicker-prev", "");
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
    this.headerElement.appendChild(monthNameElement);
    headerButtons.appendChild(nextButton);
    headerButtons.appendChild(prevButton); 
    if(this.options.switchType){
      const changeTypeButton = document.createElement("div")
      changeTypeButton.textContent= (this.options.culture == "en" ? "شمسی" : "میلادی")
      changeTypeButton.addEventListener("click" , e =>{
        this.goToday()
        if(this.options.culture == "en"){
          var convertDate :DayValue= this.dateUtil.convertToJalali(this.months[this.activeIndex].value)   
        }
        else{
          var convertDate :DayValue=  this.dateUtil.convertToGregorian(this.months[this.activeIndex].value)
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
    
    this.headerElement.appendChild(headerButtons)
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
    const daysName = this.dateUtil.getDayShortNames(this.options.lid , this.options.culture);
    const weekNameWrapper: Element = document.createElement("div");
    weekNameWrapper.setAttribute("datepicker-header", "");
    if(this.options.culture == "en"){
      weekNameWrapper.setAttribute("datepicker-header-en" , "")
    }
    for (const index in daysName) {
      const dayWrapper: Element = document.createElement("div");
      const faSpan: Element = document.createElement("span");
      dayWrapper.setAttribute("data-datepicker-day-name", "");
      faSpan.textContent = daysName[index];
      dayWrapper.appendChild(faSpan);
      weekNameWrapper.appendChild(dayWrapper);
    }
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
      mainElement.appendChild(dayElement);
    }
    this.months[this.activeIndex].days.map((x) => {
      if(this.options.rangeDates == false){
        new UiDatePicker(this, x ).generateDaysUi(mainElement);
      }
      else{
        new UiDatePicker(this, x ).generateDaysUiWithDateRange(mainElement);
       

      }
      
    });

    for (var j = 0; j < 6 - lastDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-datepicker-day", "");
      mainElement.appendChild(dayElement);
    }
    this.bodyElement.append(mainElement);
    monthsContainer.appendChild(this.bodyElement);
    return monthsContainer;
  }
  protected createMountFooter(): Node {
    //create related element
    var footerElement = document.createElement("div");
    if (this.options.todayButton == true) {
      const todayButton = document.createElement("button");
      todayButton.addEventListener("click", (e) => {
        this.goToday();
      });
      todayButton.setAttribute("data-datepicker-today-btn", "");
      todayButton.innerHTML = this.options.lid == 1 ? "امروز" : "Today";
      footerElement.appendChild(todayButton);
    }

    return footerElement;
  }
  async renderAsync(): Promise<void> {
    this.wrapper.innerHTML = "";
    this.bodyElement.innerHTML=""
    this.wrapper.setAttribute("id", "basis-datepicker");
    const headerPart = this.createMountHeader();
    const bodyPart = this.createMountBody();
    const footerPart = this.createMountFooter();
    //Extra process..
    this.wrapper.appendChild(headerPart);
    this.wrapper.appendChild(bodyPart);
    this.wrapper.appendChild(footerPart);
  }
  public async createUIAsync(container?: Element): Promise<void> {
    this.datePickerInput = container as HTMLInputElement;

    this.wrapper = document.createElement("div");

    container.addEventListener("click", (e) => {
      e.stopPropagation();
      container.parentNode.insertBefore(this.wrapper, container.nextSibling);
    });
    this.wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    window.addEventListener("click", () => {
      this.wrapper.remove();
    });
    return this.renderAsync();
  }
}
