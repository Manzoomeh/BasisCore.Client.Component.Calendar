import { Day } from "../Day/Day";
import { DatePicker } from "../DatePicker";

export class UiDatePicker {
  private readonly day: Day;
  readonly range: DatePicker;
  constructor(owner: DatePicker, day: Day) {
    this.day = day;
    this.range = owner;
  }
  generateDaysUi(parentElement : HTMLElement): void {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    let secondDayNumber = document.createElement("span")
    dayElement.setAttribute("data-datepicker-day", "");
    secondDayNumber.setAttribute("data-datepicker-second-culture-day" , "")    
    secondDayNumber.textContent= (this.day.secondValue ? this.day.secondValue +"" : "") ;
    spanElement.textContent = this.day.currentDay.day + "";
    dayElement.setAttribute("data-datepicker-id", this.day.dateId.toString());
    dayElement.appendChild(spanElement);
    dayElement.appendChild(secondDayNumber)
    if (this.day.isToday == true) {
      dayElement.setAttribute("data-datepicker-today", "");
    }
    dayElement.addEventListener("click", (e) => {
      const selectDate =
        this.day.currentDay.year +
        "/" +
        this.day.currentDay.month +
        "/" +
        this.day.currentDay.day;
      this.range.datePickerInput.value = selectDate;
      this.range.datePickerInput.setAttribute(
        "data-datepicker-dateid",
        this.day.dateId.toString()
      );
      this.range.datePickerInput.setAttribute(
        "data-datepicker-sstring",
        selectDate
      );
      this.range.wrapper.remove();
    });
    parentElement.appendChild(dayElement);
  }
  generateDaysUiWithDateRange(parentElement : HTMLElement): void {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    let secondDayNumber = document.createElement("span")
    dayElement.setAttribute("data-datepicker-day", "");
    secondDayNumber.setAttribute("data-datepicker-second-culture-day" , "")    
    secondDayNumber.textContent= (this.day.secondValue ? this.day.secondValue +"" : "") ;
    spanElement.textContent = this.day.currentDay.day + "";    
    dayElement.setAttribute("data-datepicker-id", this.day.dateId.toString());
    dayElement.appendChild(spanElement);
    dayElement.appendChild(secondDayNumber)
    if (this.day.isToday == true) {
      dayElement.setAttribute("data-datepicker-today", "");
    }    
    dayElement.addEventListener("click", (e) => {
      const selectDate =
        this.day.currentDay.year +
        "/" +
        this.day.currentDay.month +
        "/" +
        this.day.currentDay.day;
      this.range.datesArray.push(this.day.currentDay)   
      this.disabledDays(parentElement)
      if(this.range.datesArray.length == 1){
        this.range.datePickerInput.value = selectDate;
        this.range.datePickerInput.setAttribute(
          "data-datepicker-dateid",
          this.day.dateId.toString()
        );
        this.range.datePickerInput.setAttribute(
          "data-datepicker-sstring",
          selectDate
        );
      }
      else if(this.range.datesArray.length > 1){
        this.range.datePickerInput.value += " - " + selectDate;
        this.range.datePickerInput.setAttribute(
          "data-datepicker-to-dateid",
          this.day.dateId.toString()
        );
        this.range.datePickerInput.setAttribute(
          "data-datepicker-to-sstring",
          selectDate
        );
        this.range.datesArray=[]
        this.enableDays(parentElement)
        this.range.wrapper.remove();
      }
     
    });
    parentElement.appendChild(dayElement);
    this.disabledDays(parentElement)

  }
  private disabledDays(parentElement:HTMLElement): void{
    if(this.range.datesArray.length >= 1){
      const selectedDateId :number = this.range.dateUtil.getBasisDayId(this.range.datesArray[0])
      const dates =Array.from(parentElement.querySelectorAll("[data-datepicker-day]"))
      dates.map((x) => {
        const dateId = x.getAttribute("data-datepicker-id")        
        if(parseInt(dateId) < selectedDateId){
          x.setAttribute("data-disabled" , "")
        }
      })

    }
    return null
  }
  private enableDays(parentElement:HTMLElement): void{
    if(this.range.datesArray.length == 0){
      const dates =Array.from(parentElement.querySelectorAll("[data-disabled]"))
      dates.map((x) => { 
          x.removeAttribute("data-disabled")
      })

    }
    return null
  }
}
