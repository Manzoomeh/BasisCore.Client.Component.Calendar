import { Day } from "../Day/Day";
import { DatePicker } from "../DatePicker";
import { Month } from "../Month/Month";
declare const $bc: any;
export class UiDatePicker {
  private readonly day: Day;
  readonly range: DatePicker;
  constructor(owner: DatePicker, day: Day) {
    this.day = day;
    this.range = owner;
  }
  generateDaysUi(parentElement: HTMLElement): void {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    let secondDayNumber = document.createElement("span");
    dayElement.setAttribute("data-datepicker-day", "");
    secondDayNumber.setAttribute("data-datepicker-second-culture-day", "");
    secondDayNumber.textContent = this.day.secondValue
      ? this.day.secondValue + ""
      : "";
    spanElement.textContent = this.day.currentDay.day + "";
    dayElement.setAttribute("data-datepicker-id", this.day.dateId.toString());
    dayElement.setAttribute("data-sys-inherit", "");
    dayElement.appendChild(spanElement);
    dayElement.appendChild(secondDayNumber);
    if (this.day.isToday == true) {
      dayElement.setAttribute("data-datepicker-today", "");
    }
    dayElement.addEventListener("click",async (e) => {
      
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

      this.range.datePickerInput.value =
        this.range.options.culture === "fa" ? selectDate : mselectDate;

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
      
      if (this.range.options.isFilter == true) {
        this.range.range.fromdate =
          this.range.dateUtil.convertStringToDayValue(selectDate);

        this.range.range.from = this.day.currentDay
        this.range.range.to =this.day.currentDay
        this.range.range.monthValues = this.range.dateUtil.getMonthValueList(
          this.range.range.from,
          this.range.range.to
        );

        this.range.range.months = [];
        this.range.range.monthValues.map((x) => {
          this.range.range.months.push(new Month(this.range, x));
        });
        if (this.range.range.options.displayNote) {
          //load notes from server;

          await this.range.range.refreshNotesAsync();
        }
        this.range.range.runAsync();
        if (this.range.options.action) {
            e.preventDefault();
            this.range.options.action(dayElement);
         
          }

      
      }
      this.range.wrapper.remove();
    });
    
    parentElement.appendChild(dayElement);
  }

  generateDaysUiWithMultipleChoices(parentElement: HTMLElement): void {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    const dayValue =
      this.range.options.culture === "fa"
        ? this.day.currentDay
        : this.day.mcurrentDay;
    dayElement.setAttribute("data-datepicker-day", "");

    spanElement.textContent = dayValue.day + "";
    dayElement.setAttribute("data-datepicker-id", this.day.dateId.toString());
    dayElement.setAttribute("data-sys-inherit", "");
    dayElement.appendChild(spanElement);
    if (this.day.isToday == true) {
      dayElement.setAttribute("data-datepicker-today", "");
    }
    if (
      this.range.datesArray.find(
        (e) =>
          e.day == dayValue.day &&
          e.month == dayValue.month &&
          e.year == dayValue.year
      )
    ) {
      dayElement.setAttribute("data-datepicker-start-day", "");
    }
 
    dayElement.addEventListener("click", async (e) => {
      
      const selected =
        this.range.options.culture === "fa"
          ? this.day.currentDay
          : this.day.mcurrentDay;
      const selectDate =
        selected.year + "/" + selected.month + "/" + selected.day;

      if (!this.range.datesArray.includes(selected)) {
        this.range.datesArray.push(selected);
        this.range.datesIds.push(this.day.dateId);
        // if (parentElement.querySelector("[data-datepicker-start-day]")) {
        //   parentElement
        //     .querySelector("[data-datepicker-start-day]")
        //     .removeAttribute("data-datepicker-start-day");
        // }
        dayElement.setAttribute("data-datepicker-start-day", "");
        if (this.range.options.isModalPicker) {
          (
            document.querySelector(
              "[data-modal-input-dates]"
            ) as HTMLInputElement
          ).value = this.range.datesArray
            .map(
              (e) =>
                String(e.year) + "/" + String(e.month) + "/" + String(e.day)
            )
            .join(",");
        }
        this.range.fromdate = selectDate;
      } else {
        dayElement.removeAttribute("data-datepicker-start-day");
        this.range.datesArray = this.range.datesArray.filter(
          (e) => e != selected
        );
        this.range.datesIds = this.range.datesIds.filter(
          (e) => e != this.day.dateId
        );
        if (this.range.options.isModalPicker) {
          (
            document.querySelector(
              "[data-modal-input-dates]"
            ) as HTMLInputElement
          ).value = this.range.datesArray
            .map(
              (e) =>
                String(e.year) + "/" + String(e.month) + "/" + String(e.day)
            )
            .join(",");
        }
      }
    });
    parentElement.appendChild(dayElement);
  }
  generateDaysUiWithDateRange(parentElement: HTMLElement): void {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    let secondDayNumber = document.createElement("span");
    dayElement.setAttribute("data-datepicker-day", "");
    secondDayNumber.setAttribute("data-datepicker-second-culture-day", "");
    secondDayNumber.textContent =
      this.range.options.culture === "fa"
        ? this.day.mcurrentDay.day + ""
        : this.day.currentDay.day + "";

    spanElement.textContent =
      this.range.options.culture === "fa"
        ? this.day.currentDay.day + ""
        : this.day.mcurrentDay.day + "";
    dayElement.setAttribute("data-datepicker-id", this.day.dateId.toString());
    dayElement.setAttribute("data-sys-inherit", "");
    dayElement.appendChild(spanElement);
    dayElement.appendChild(secondDayNumber);
    if (this.day.isToday == true) {
      dayElement.setAttribute("data-datepicker-today", "");
    }

    dayElement.addEventListener("click", async (e) => {
      const selected =
        this.range.options.culture === "fa"
          ? this.day.currentDay
          : this.day.mcurrentDay;
      const selectDate =
        selected.year + "/" + selected.month + "/" + selected.day;

      this.range.datesArray.push(selected);
      if (this.range.datesArray.length == 1) {
        if (parentElement.querySelector("[data-datepicker-start-day]")) {
          parentElement
            .querySelector("[data-datepicker-start-day]")
            .removeAttribute("data-datepicker-start-day");
        }
        dayElement.setAttribute("data-datepicker-start-day", "");
        this.disabledDays(parentElement);
        this.range.datePickerInput.value = selectDate;
        document.querySelector("[data-datepicker-month-main]").innerHTML =
          String(this.range.datesArray[0].day) +
          " " +
          this.range.months[this.range.activeIndex].monthName;
        this.range.datePickerInput.setAttribute(
          "data-datepicker-dateid",
          this.day.dateId.toString()
        );
        this.range.datePickerInput.setAttribute(
          "data-datepicker-sstring",
          selectDate
        );

        this.range.fromdate = selectDate;
      } else if (this.range.datesArray.length > 1) {
        
        if (parentElement.querySelector("[data-datepicker-end-day]")) {
          parentElement
            .querySelector("[data-datepicker-end-day]")
            .removeAttribute("data-datepicker-end-day");
        }
        if (this.range.options.rangeDatesSeparated) {
          this.range.datePickerInput.value += " " + selectDate;
        } else {
          this.range.datePickerInput.value += " - " + selectDate;
        }
        this.range.datePickerInput.setAttribute(
          "data-datepicker-to-dateid",
          this.day.dateId.toString()
        );
        this.range.datePickerInput.setAttribute(
          "data-datepicker-to-sstring",
          selectDate
        );
        dayElement.setAttribute("data-datepicker-end-day", "");
        const spans = dayElement.querySelectorAll("span");
        spans.forEach((e) => {
          e.setAttribute("data-sys-text-white", "");
        });
        const startDayId = this.range.dateUtil.getBasisDayId(
          this.range.datesArray[0]
        );
        const lastDayId = this.range.dateUtil.getBasisDayId(
          this.range.datesArray[1]
        );
        this.range.datesArray = [];
        this.enableDays(parentElement, startDayId, lastDayId);
        if (this.range.options.type == "click") {
          this.range.wrapper.remove();
        }
       
      }
    });
    parentElement.appendChild(dayElement);
  }
  private disabledDays(parentElement: HTMLElement): void {
    if (this.range.datesArray.length >= 1) {
      const selectedDateId: number = this.range.dateUtil.getBasisDayId(
        this.range.datesArray[0]
      );
      const dates = Array.from(
        parentElement.querySelectorAll("[data-datepicker-day]")
      );
      dates.map((x) => {
        const dateId = x.getAttribute("data-datepicker-id");
        const spans = x.querySelectorAll("span");
        x.removeAttribute("data-datepicker-selected");
        spans.forEach((e) => {
          e.removeAttribute("data-sys-text-white");
        });
        if (parseInt(dateId) < selectedDateId) {
          x.setAttribute("data-disabled", "");
        } else if (parseInt(dateId) == selectedDateId) {
          x.setAttribute("data-datepicker-selected", "");
          spans.forEach((e) => {
            e.setAttribute("data-sys-text-white", "");
          });
        }
      });
    }
    return null;
  }
  private enableDays(
    parentElement: HTMLElement,
    startDay: number,
    lastDayId: number
  ): void {
    if (this.range.datesArray.length == 0) {
      const dates = Array.from(
        parentElement.querySelectorAll("[data-datepicker-day]")
      );
      dates.map((x) => {
        x.removeAttribute("data-datepicker-hover");
        const dateId = x.getAttribute("data-datepicker-id");
        x.removeAttribute("data-disabled");
        if (parseInt(dateId) < lastDayId && parseInt(dateId) > startDay) {
          x.setAttribute("data-datepicker-hover", "");
        }
      });
    }
    return null;
  }
}
