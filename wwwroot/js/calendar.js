function PersianCalendar(year , month){
    var title ;    
    year= parseInt(year)
    month= parseInt(month)
    var result = Month(year , month)
}

function Month(year , month){
    var monthsNameArray  =
    [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند"
    ]
    var numberDayOfMonth =[
        31,31,31,31,31,31,30,30,30,30,30,29
    ]
    var firstDay = (moment(`${year}-${month}-01`, 'jYYYY/jMM/jDD').weekday()) + 1
    var monthName = monthsNameArray[month - 1]    
    var NumberOfDays= numberDayOfMonth[month - 1 ]
    var days = []
    for(var i =0 ; i < NumberOfDays ; i++ ){
        days.push(Day (i , month , firstDay)) 
        firstDay++
        if(firstDay == 7){
            firstDay = 0 
        }
    }
    return ({
        "id" : month,
        "monthName":monthName,
        "days" : days
    })

}
function Day(day , month , firstDay){
    var weeksName  = 
    [       
        "یکشنبه",
        "دوشنبه",
        "سه‌شنبه",
        "چهارشنبه",
        "پنج‌شنبه",
        "جمعه",
        "شنبه",
    ] 
    var title = weeksName[firstDay];
    var dayOfWeek = firstDay  + 1 ;
    var dayOfMonth = parseInt(day + 1);
    var isHoliday =false 
    if(firstDay == 5){
        isHoliday = true
    }
    return {
        "dayOfMonth" : dayOfMonth ,
        "title" :title,
        "isHoliday" : isHoliday,
        "dayOfWeek" : dayOfWeek
    }
}
PersianCalendar("1400" , "06")