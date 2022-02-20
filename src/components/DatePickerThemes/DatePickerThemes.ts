import styleLayout_basic from "../../asset/datepicker-basic.csss"; 
export class DatePickerThemes {
    themeStyle : string
    lookup  = new Map()
    themeName : string
    constructor(themeName : string){
        this.themeStyle = themeName
        this.lookup.set("styleLayout_basic" ,styleLayout_basic )
        this.lookup.set("default" ,'' )
    }
    getStyle() : string{
        const returnStyle = this.lookup.has(this.themeStyle) ? this.lookup.get(this.themeStyle) : this.lookup.get("default")
        return returnStyle
    }
}