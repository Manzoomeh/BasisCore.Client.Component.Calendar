import { DatePicker } from "./components/DatePicker";

const container = document.getElementById("datepickerCalendar");

var from: any = {
  year: 1400,
  month: 6,
  day: 1,
};

var to: any = {
  year: 1400,
  month: 6,
  day: 31,
};

const range = new DatePicker(from, to, {
  dateProvider: "basisCalendar",
  culture: "fa",
  lid: 1,
});
range.createUIAsync(container);


