import { DateRange } from "./components/calendar";
// import * from "./app7"

const container = document.getElementById("basisCalendar");

var from: any = {
  year: 1400,
  month: 3,
  day: 1,
};

var to: any = {
  year: 1400,
  month: 3,
  day: 30,
};

const range = new DateRange(
  from,
  to,
  {
    dateProvider: "basisCalendar",
    displayNote: true,
    culture: "fa",
    lid: 1,
  },
  "0F21A34F-A613-4DAA-BA79-A02F021ADFE0"
);
range.createUIAsync(container);

