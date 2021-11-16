import "../asset/date-picker-style.css";
import { Month } from "./Month/Month";
import { DayValue, MonthValue, YearValue } from "./type-alias";
import { IDatePickerOptions } from "./Interface/Interface";
import { IDateUtil } from "./IDateUtil/IDateUtil";
import { BasisCoreDateUtil } from "./BasisCoreDateUtil/BasisCoreDateUtil";
import { PersianDateUtil } from "./PersianDateUtil/PersianDateUtil";
import { UiDatePicker } from "./UiDatePicker/UiDatePicker";
import { library } from "webpack";
export class DatePicker {
  public readonly dateUtil: IDateUtil;
  public readonly months: Array<Month> = new Array<Month>();
  public readonly options: IDatePickerOptions;
  public wrapper: Element;
  public datePickerInput: HTMLInputElement;
  public activeIndex: number;
  private readonly monthValues: MonthValue[];
  private bodyElement : HTMLElement
  private headerElement : HTMLElement
  private static readonly defaultCalenderOptions: Partial<IDatePickerOptions> =
    {
      dateProvider: "basisCalendar",
      culture: "fa",
      secondCulture: "en",
      lid: 1,
      todayButton: false,
      selectDate: false,
      yearsList : false
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
    this.headerElement.setAttribute("data-datepicker-header", "");    
    monthNameElement.setAttribute("data-datepicker-title", "");
    yearNumber.setAttribute("data-datepicker-year-number" , "")
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
    this.headerElement.appendChild(prevButton);
    this.headerElement.appendChild(nextButton);

    return this.headerElement;
  }
  protected activeMonth(): Month{
   return this.months[this.activeIndex]

  }
  protected showYears(yearNumberWrapper : HTMLElement){
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
        console.log(currentMonth)   
        let m : MonthValue =  {
          year : parseInt(year)  ,
          month : currentMonth.value.month
        }  
          
        this.months[this.activeIndex] = new Month(this, m);
        this.renderAsync();
        this.bodyElement.removeAttribute("data-datepicker-body-years-list") 
      });
      yearList.appendChild(yearListLi)
    }
    closeBtnWrapper.addEventListener("click", e => {
      this.bodyElement.removeAttribute("data-datepicker-body-years-list") 
      yearList.remove()
      this.bodyElement.innerHTML = lastOldData
    })
    this.bodyElement.appendChild(yearList)
  }

  protected generateDaysName(): Node {
    const daysName = this.dateUtil.getDayShortNames(this.options.lid);
    const weekNameWrapper: Element = document.createElement("div");
    weekNameWrapper.setAttribute("datepicker-header", "");
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
    const firstDayInMonth = this.months[this.activeIndex].firstDayInMonth;
    const lastDayInMonth = this.months[this.activeIndex].lastDayInMonth;
    this.bodyElement.append(this.generateDaysName());
    for (var j = 0; j < firstDayInMonth; j++) {
      let dayElement = document.createElement("div");
      dayElement.setAttribute("data-datepicker-day", "");
      mainElement.appendChild(dayElement);
    }
    this.months[this.activeIndex].days.map((x) => {
      const dayElement = new UiDatePicker(this, x).generateDaysUi();
      mainElement.appendChild(dayElement);
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
  public async createUIAsync(container: Element): Promise<void> {
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
