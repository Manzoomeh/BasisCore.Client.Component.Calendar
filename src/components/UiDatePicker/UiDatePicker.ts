import { Day } from "../Day/Day";
import { DatePicker } from "../DatePicker";
declare const $bc: any;
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
    secondDayNumber.setAttribute("data-sys-text" , "")
    spanElement.setAttribute("data-sys-text","")
    secondDayNumber.textContent= (this.day.secondValue ? this.day.secondValue +"" : "") ;
    spanElement.textContent = this.day.currentDay.day + "";
    dayElement.setAttribute("data-datepicker-id", this.day.dateId.toString());
    dayElement.setAttribute("data-sys-inherit","")
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

      const mselectDate =
        this.day.mcurrentDay.year +
        "/" +
        this.day.mcurrentDay.month +
        "/" +
        this.day.mcurrentDay.day;
      
      this.range.datePickerInput.value = selectDate;
      
      this.range.datePickerInput.setAttribute(
        "data-datepicker-dateid",
        this.day.dateId.toString()
      );
      this.range.datePickerInput.setAttribute(
        "data-datepicker-sstring",
        selectDate
      );
      this.range.datePickerInput.setAttribute(
        "data-datepicker-mstring",
        mselectDate
      );
      if(this.range.options.action){
        // dayElement.addEventListener("click", e => {
              e.preventDefault();
              this.range.options.action(dayElement);
          // });
      }
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
    secondDayNumber.setAttribute("data-sys-text" , "")
    spanElement.setAttribute("data-sys-text","")
    secondDayNumber.textContent= (this.day.secondValue ? this.day.secondValue +"" : "") ;
    spanElement.textContent = this.day.currentDay.day + "";    
    dayElement.setAttribute("data-datepicker-id", this.day.dateId.toString());
    dayElement.setAttribute("data-sys-inherit","")
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
      if(this.range.datesArray.length == 1){
        if(parentElement.querySelector("[data-datepicker-start-day]")){
          parentElement.querySelector("[data-datepicker-start-day]").removeAttribute("data-datepicker-start-day")
        }
        dayElement.setAttribute("data-datepicker-start-day","") 
        this.disabledDays(parentElement)
        this.range.datePickerInput.value = selectDate;
        this.range.datePickerInput.setAttribute(
          "data-datepicker-dateid",
          this.day.dateId.toString()
        );
        this.range.datePickerInput.setAttribute(
          "data-datepicker-sstring",
          selectDate
        );
        
        this.range.fromdate = selectDate
        
      }
      else if(this.range.datesArray.length > 1){
       
        if(parentElement.querySelector("[data-datepicker-end-day]")){
          parentElement.querySelector("[data-datepicker-end-day]").removeAttribute("data-datepicker-end-day")
        }
        this.range.datePickerInput.value += " - " + selectDate;
        this.range.datePickerInput.setAttribute(
          "data-datepicker-to-dateid",
          this.day.dateId.toString()
        );
        this.range.datePickerInput.setAttribute(
          "data-datepicker-to-sstring",
          selectDate
        );
        dayElement.setAttribute("data-datepicker-end-day","")
        const spans = dayElement.querySelectorAll("span")
          spans.forEach(e => {
            e.setAttribute("data-sys-text-white","")     
          })
        const startDayId = this.range.dateUtil.getBasisDayId(this.range.datesArray[0])
        const lastDayId = this.range.dateUtil.getBasisDayId(this.range.datesArray[1])
        this.range.datesArray=[]
        this.enableDays(parentElement , startDayId, lastDayId)
        if(this.range.options.type == "click"){
          this.range.wrapper.remove();
        }
        
        if(this.range.options.sourceid){
          $bc.setSource(this.range.options.sourceid ,  [{"from": this.range.fromdate, "to" : selectDate }]);
        }
        if(this.range.options.action){
          // dayElement.addEventListener("change", e => {
                e.preventDefault();
                this.range.options.action(dayElement);
            // });
        }
       
      }
    });
    parentElement.appendChild(dayElement);
   
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
        else if(parseInt(dateId) == selectedDateId){
          x.setAttribute("data-datepicker-selected" , "")  
          const spans = x.querySelectorAll("span")
          spans.forEach(e => {
            e.setAttribute("data-sys-text-white","")     
          })
        }
     
      })

    }
    return null
  }
  private enableDays(parentElement:HTMLElement , startDay : number , lastDayId : number): void{
    if(this.range.datesArray.length == 0){
      const dates =Array.from(parentElement.querySelectorAll("[data-datepicker-day]"))
      dates.map((x) => { 
          const dateId = x.getAttribute("data-datepicker-id")
          x.removeAttribute("data-disabled")
          if(parseInt(dateId) < lastDayId && parseInt(dateId) > startDay){
            x.setAttribute("data-datepicker-hover" , "")
          
          }
      })

    }
    return null
  }
}
