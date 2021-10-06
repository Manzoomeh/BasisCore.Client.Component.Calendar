import { Day } from "../Day/Day";
import { DatePicker } from "../DatePicker";

export class UiDatePicker {
  private readonly day: Day;
  readonly range: DatePicker;
  constructor(owner: DatePicker, day: Day) {
    this.day = day;
    this.range = owner;
  }
  generateDaysUi(): Node {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    dayElement.setAttribute("data-datepicker-day", "");
    spanElement.textContent = this.day.currentDay.day + "";
    dayElement.setAttribute("data-datepicker-id", this.day.dateId.toString());
    dayElement.appendChild(spanElement);
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
    return dayElement;
  }
}
