import { Day } from "../Day/Day";
import { DatePicker } from "../DatePicker";
import layout from "./asset/layout.html"
import { DayValue,DayNumber, MonthNumber } from "../type-alias";
declare const $bc: any;
export class UiDatePickerMobile {
  private readonly day: Day;
  readonly range: DatePicker;
  private selectDay : DayNumber = 1;
  private selectMonth :MonthNumber = 1; 
  private selectYear :number = 0
  private selectRange : number = 15
  constructor(owner: DatePicker, day?: Day) {
    this.day = day;
    this.range = owner;
  }

  generateDaysUiAppModel(parentElement : HTMLElement): void {
    let today
    this.range.months[0].days.map((x) => {
      if(x.isToday == true){
        today = x
      }
    })
    const wheelDatePicker = document.createElement("div")
    wheelDatePicker.innerHTML = layout
    const submitDate : HTMLElement = wheelDatePicker.querySelector("[data-bc-datepicker-mobile-submit]")
    const days = wheelDatePicker.querySelector("[data-bc-datepicker-mobile-days-wrapper]")
    const months = wheelDatePicker.querySelector("[data-bc-datepicker-mobile-months-wrapper]")
    const years = wheelDatePicker.querySelector("[data-bc-datepicker-mobile-years-wrapper]")
    const dayList = document.createElement("ul")
    const monthList = document.createElement("ul")
    const yearList = document.createElement("ul")
    const dateRangeList = wheelDatePicker.querySelector("[data-bc-datepicker-daterange-list]") as HTMLElement
    const toadyNum = 6
    var positionTopDay = -40
    var currentDayPosition , currentMonthPosition , currentYearPosition= 0
    var currentPositionRange = 15
    for(var i = 1 ; i <= 31 ; i++){
      positionTopDay = positionTopDay +30
      const day = document.createElement("li")
      day.setAttribute("data-bc-datepicker-mobile-day","")
      day.innerHTML = i + ""
      if (i == toadyNum){
        day.setAttribute("data-bc-datepicker-mobile-wheel-curent","true")
        dayList.style.transform=`translate(0px, -${positionTopDay}px)  scale(1) translateZ(0px)`
        currentDayPosition = positionTopDay
        this.selectDay = i
      }
      dayList.appendChild(day)
    }
    var positionTopYear = -40
    for(var i = 1369 ; i <= 1420 ; i++){
      positionTopYear  = positionTopYear  + 30
      const year = document.createElement("li")
      year.setAttribute("data-bc-datepicker-mobile-year","")
      year.innerHTML = i + ""
      if (i == 1401){
        year.setAttribute("data-bc-datepicker-mobile-wheel-curent","true")
        yearList.style.transform=`translate(0px, -${positionTopYear }px)  scale(1) translateZ(0px)`
        currentYearPosition = positionTopYear
        this.selectYear = i
      }
      yearList.appendChild(year)
    }
    const monthTitle = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"]
    var positionTopMonth = -40
    for(var i = 0 ; i < monthTitle.length ; i++){
      positionTopMonth = positionTopMonth + 30
      const month = document.createElement("li")
      month.setAttribute("data-bc-datepicker-mobile-month","true")
      month.innerHTML = monthTitle[i]
      if (i == toadyNum){
        month.setAttribute("data-bc-datepicker-mobile-wheel-curent","true")
        monthList.style.transform=`translate(0px, -${positionTopMonth}px)  scale(1) translateZ(0px)`
        currentMonthPosition = positionTopMonth
        this.selectMonth = (i + 1) as MonthNumber 
      }
      monthList.appendChild(month)
    }
    dayList.setAttribute("draggable","true")
    monthList.setAttribute("draggable","true")
    yearList.setAttribute("draggable","true")
    let click = false
    var dayUnit , monthUnit , yearUnit , rangeUnit= 0
    var startPoint = 0
    var endPoint = 0
    let dayIndex  , monthIndex , yearIndex , rangeIndex  = 0
    
    dayList.addEventListener("touchstart", (e) => {
      e.preventDefault()     
      click = true
      dayUnit = 0
      startPoint = e.touches[0].pageY
    })
    monthList.addEventListener("touchstart", (e) => {
      e.preventDefault()     
      click = true
      monthUnit = 0
      startPoint = e.touches[0].pageY
    })
    yearList.addEventListener("touchstart", (e) => {
      e.preventDefault()     
      click = true
      yearUnit = 0
      startPoint = e.touches[0].pageY    
    })
    dateRangeList.addEventListener("touchstart", (e) => {
      e.preventDefault()     
      click = true
      rangeUnit = 0
      startPoint = e.touches[0].pageY    
    })

    dayList.addEventListener("mousemove", (e) => {
      e.preventDefault()       
    })
    dateRangeList.addEventListener("touchend", (e) => {
      e.preventDefault()     
      endPoint = e.changedTouches[0].pageY
      rangeUnit = endPoint-startPoint
      if( click == true){   
        dateRangeList.querySelectorAll("li").forEach( (currentLi , index) =>{
          const currentLiAttr = currentLi.getAttribute("data-bc-datepicker-mobile-wheel-curent")
          if(currentLiAttr == "true"){
            rangeIndex = 1
            currentLi.removeAttribute("data-bc-datepicker-mobile-wheel-curent")
          }
        })
        if(rangeUnit < 0){   
          dateRangeList.style.transform = `translate(0px,-${  currentPositionRange  +30}px)  scale(1) translateZ(0px)`;
          currentPositionRange =  currentPositionRange  +30
          rangeIndex = rangeIndex + 1      
        }
        else if (rangeUnit > 0){
          dateRangeList.style.transform = `translate(0px,-${ currentPositionRange  -30}px)  scale(1) translateZ(0px)`;
          currentPositionRange = currentPositionRange  -30
          rangeIndex = rangeIndex - 1
        }
        dateRangeList.querySelectorAll("li")[rangeIndex].setAttribute("data-bc-datepicker-mobile-wheel-curent","true")        
        this.selectRange = Number(dateRangeList.querySelectorAll("li")[rangeIndex].getAttribute("data-range")) 
      }
      click = false
    })
    dayList.addEventListener("touchend", (e) => {
      endPoint = e.changedTouches[0].pageY
      dayUnit = endPoint-startPoint
      if( click == true){   
        dayList.querySelectorAll("li").forEach( (currentLi , index) =>{
          const currentLiAttr = currentLi.getAttribute("data-bc-datepicker-mobile-wheel-curent")
          if(currentLiAttr == "true"){
            dayIndex = index
            currentLi.removeAttribute("data-bc-datepicker-mobile-wheel-curent")
          }
        })
        const unit =   Math.ceil( Math.abs(dayUnit)  /30)
        if(dayUnit < 0){         
          dayList.style.transform = `translate(0px,-${  currentDayPosition  + (unit * 30)}px)  scale(1) translateZ(0px)`;
          currentDayPosition =  currentDayPosition  +(unit *30)
          dayIndex = dayIndex + unit          
        }
        else if (dayUnit > 0){
          dayList.style.transform = `translate(0px,-${ currentDayPosition  -(unit *30)}px)  scale(1) translateZ(0px)`;
          currentDayPosition = currentDayPosition  -(unit * 30)
          dayIndex = dayIndex - unit
        }
        dayList.querySelectorAll("li")[dayIndex].setAttribute("data-bc-datepicker-mobile-wheel-curent","true")
        this.selectDay = dayIndex + 1
      }
      click = false
    })
    monthList.addEventListener("touchend", (e) => {
      e.preventDefault()     
      endPoint = e.changedTouches[0].pageY
      monthUnit = endPoint-startPoint
      if( click == true){   
        monthList.querySelectorAll("li").forEach( (currentLi , index) =>{
          const currentLiAttr = currentLi.getAttribute("data-bc-datepicker-mobile-wheel-curent")
          if(currentLiAttr == "true"){
            monthIndex = index
            currentLi.removeAttribute("data-bc-datepicker-mobile-wheel-curent")
          }
        })
        const unit =   Math.ceil( Math.abs(monthUnit)  /30)
        if(monthUnit < 0){         
          monthList.style.transform = `translate(0px,-${  currentMonthPosition  + (unit * 30)}px)  scale(1) translateZ(0px)`;
          currentMonthPosition =  currentMonthPosition  +(unit *30)
          monthIndex = monthIndex + unit          
        }
        else if (monthUnit > 0){
          monthList.style.transform = `translate(0px,-${ currentMonthPosition  -(unit *30)}px)  scale(1) translateZ(0px)`;
          currentMonthPosition = currentMonthPosition  -(unit * 30)
          monthIndex = monthIndex - unit
        }
        monthList.querySelectorAll("li")[monthIndex].setAttribute("data-bc-datepicker-mobile-wheel-curent","true")
        this.selectMonth = monthIndex + 1
      }
      click = false
    })
    yearList.addEventListener("touchend", (e) => {
      e.preventDefault()     
      endPoint = e.changedTouches[0].pageY
      yearUnit = endPoint-startPoint
      if( click == true){   
        yearList.querySelectorAll("li").forEach( (currentLi , index) =>{
          const currentLiAttr = currentLi.getAttribute("data-bc-datepicker-mobile-wheel-curent")
          if(currentLiAttr == "true"){
            yearIndex = index
            currentLi.removeAttribute("data-bc-datepicker-mobile-wheel-curent")
          }
        })
        const unit =   Math.ceil( Math.abs(yearUnit)  /30)
        if(yearUnit < 0){         
          yearList.style.transform = `translate(0px,-${  currentYearPosition  + (unit * 30)}px)  scale(1) translateZ(0px)`;
          currentYearPosition =  currentYearPosition  +(unit *30)
          yearIndex = yearIndex + unit          
        }
        else if (yearUnit > 0){
          yearList.style.transform = `translate(0px,-${ currentYearPosition  -(unit *30)}px)  scale(1) translateZ(0px)`;
          currentYearPosition = currentYearPosition  -(unit * 30)
          yearIndex = yearIndex - unit
        }
        yearList.querySelectorAll("li")[yearIndex].setAttribute("data-bc-datepicker-mobile-wheel-curent","true")
        this.selectYear =  Number(yearList.querySelectorAll("li")[yearIndex].textContent)  
      }
      click = false
    })
   
    days.appendChild(dayList)
    months.appendChild(monthList)
    years.appendChild(yearList)
    parentElement.appendChild(wheelDatePicker);

    submitDate.addEventListener("click" , e => {
      const selectDate  : DayValue= {
        year: this.selectYear ,
        month: this.selectMonth,
        day: this.selectDay,
      }      
      console.log("ok?")
      const nextDay = this.range.dateUtil.getRangeForDate(selectDate,"after",this.selectRange)
      const selectDateText  : string= this.selectYear +"/"+ this.selectMonth+"/"+ this.selectDay
      const nextDateText : string = nextDay.year+"/"+nextDay.month + "/" + nextDay.day  
      if(this.range.options.sourceid){
        $bc.setSource(this.range.options.sourceid ,  [{"from": selectDateText , "to" : nextDateText }]);
      }
      
    
    })


  }
  


}
