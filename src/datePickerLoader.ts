import { DatePicker } from "./components/DatePicker";
// import * from "./app7"
console.log("start");
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
console.log(range);

// var dDate= {
//   year: 1400,
//   month: 2,
//   day: 2,
// };
// var cal = new DateRange.testCalendar(dDate , "fa")
// console.log(cal)
// var cal = new Calendar("basisCalendar").getMonth(1400 , 3 ,8 , 'fa')

// console.log(cal)

// var wrapper = document.getElementById("basisCalendar")
// var ui = new CreateUI(cal , wrapper)

// var b = new DateRange({
//   dateProvider: "basisCalendar",
//   displayNote: true,
//   culture: "fa",
//   secondCulture: "en",
// } , "basisCalendar")

// console.log(ui)
import { DateTime } from "luxon";

// var dt = DateTime.fromISO("2021-07-28", { locale: "fa" });
// console.log("month : ", dt.toFormat("L LL LLL LLLL"));
// console.log("day of Week : ", dt.toFormat("c ccc cccc ccccc"));
// console.log("year : ", dt.toFormat("y yy  yyyy"));
// console.log(dt.toFormat("D"));
// console.log(dt.toLocaleString({ month: "numeric" }));
// console.log(dt.toLocaleString({ day: "numeric" }));
// console.log(dt.toLocaleString({ year: "numeric" }));
// console.log("injssss : " , DateTime.utc('2021', '7', '28').setLocale('fa').toFormat("cccc"))

// var moment = require('moment-jalaali')
// moment = moment().locale("fa").format('jMMMM')
// console.log(moment)

// var theOption :ICalenderOptions=  {
//   displayNote: true,
//   dateProvider: "basisCalendar",
//   culture: "fa",
//   secondCulture: "en",
// };
// var day : DayValue = {
//   year: 1400,
//   month: 2,
//   day: 2,
// };
// var mm : MonthValue = {
//   year : 1400 ,
//   month : 2
// }
// var dUtil = new BasisCoreDateUtil()

// var cal = new SingleMonthRange(mm , dUtil , theOption)
// console.log(cal)

// var  userNote =[{"id":202,"dateid":11387,"time":"21:45","note":"Hello khordad","description":"","color":"EC1717FF","creator":1,"creatoruser":122504},{"id":208,"dateid":11389,"time":"19:40","note":"ffffffor test","description":"for test for test for test","color":"f9a2d8","creator":1,"creatoruser":122504},{"id":210,"dateid":11388,"time":"","note":"heelllooooo edit","description":"","color":"d8d1fc","creator":1,"creatoruser":122504},{"id":211,"dateid":11392,"time":"","note":"Hello from new version","description":"","color":"f4a8d0","creator":1,"creatoruser":122504},{"id":212,"dateid":11388,"time":"","note":"tttttt","description":"","color":"000000","creator":1,"creatoruser":122504},{"id":213,"dateid":11390,"time":"","note":"sssss","description":"","color":"000000","creator":1,"creatoruser":122504}]
// var note : any[]=[]
// userNote.map((x) => note.push( {year : 1400,
//   month : 12,
//   day : 12,
//   hour : "14:00",
//   comment : "ssss",
//   color : "55",
//   isNew : false,
//   hasReminder: false,
//   reminderType : "none"})

// )
// console.log("noteeeeeeeeeeeee",note)
