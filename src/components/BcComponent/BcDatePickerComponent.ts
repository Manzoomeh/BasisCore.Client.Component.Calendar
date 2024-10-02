import { DatePicker } from "../DatePicker";
import IComponentManager from "../../basiscore/IComponentManager";
import ISource from "../../basiscore/ISource";
import IUserDefineComponent from "../../basiscore/IUserDefineComponent";
import { SourceId } from "../../basiscore/type-alias";
import { DayNumber, DayValue, MonthNumber } from "../type-alias";
import { IDatePickerOptions } from "../Interface/Interface";
import { IPartValue } from "../../basiscore/ISchemaBaseComponent";

export default class BcComponent implements IComponentManager {
  readonly owner: IUserDefineComponent;
  private dateRange: DatePicker;
  private from: DayValue;
  private to: DayValue;
  private container: HTMLElement;
  private sourceId: SourceId;
  private options: IDatePickerOptions = {
    culture: "fa",
    lid: 1,
    type: "click",
  };
  constructor(owner: IUserDefineComponent) {
    this.owner = owner;
  }

  public async initializeAsync(): Promise<void> {
    const name = await this.owner.getAttributeValueAsync("name");
    this.sourceId = await this.owner.getAttributeValueAsync("sourceid");
    this.owner.addTrigger([this.sourceId]);
    const settingObject = await this.owner.getAttributeValueAsync("options");
    settingObject ? (this.options = eval(settingObject)) : null;

    if (this.options.type == "load") {
      this.container = document.createElement("div");
    } else {
      this.container = document.createElement("input");
    }
    this.container.setAttribute("readonly", "");
    this.container.classList.add("date-picker-input");
    this.container.setAttribute("name", name);

    this.owner.setContent(this.container);
    const initFrom = await this.owner.getAttributeValueAsync("from");
    const initTo = await this.owner.getAttributeValueAsync("to");

    if (!initFrom || !initTo) {
      if (this.options.culture == "fa" || !this.options.culture) {
        this.loadDefaultFaCalendar();
      } else if (this.options.culture == "en") {
        this.loadDefaultEnCalendar();
      }
    } else {
      this.loadCalendar(initFrom, initTo, this.options);
    }
  }
  public async runAsync(source?: ISource): Promise<boolean> {
    return true;
  }
  async loadCalendar(from: string, to: string, obj: object) {
    const fromParts = from.split("/");
    const toParts = to.split("/");
    this.from = {
      year: parseInt(fromParts[0]),
      month: parseInt(fromParts[1]) as MonthNumber,
      day: parseInt(fromParts[2]) as DayNumber,
    };
    this.to = {
      year: parseInt(toParts[0]),
      month: parseInt(toParts[1]) as MonthNumber,
      day: parseInt(toParts[2]) as DayNumber,
    };
    this.dateRange = new DatePicker(this.from, this.to, obj);
    this.dateRange.createUIAsync(this.container);
  }
  loadDefaultFaCalendar() {
    const from = new Date()
      .toLocaleDateString("fa-IR")
      .replace(/([۰-۹])/g, (token) =>
        String.fromCharCode(token.charCodeAt(0) - 1728)
      );
    this.loadCalendar(from, from, this.options);
  }
  loadDefaultEnCalendar() {
    var date = new Date();
    var curr_date = date.getDate();
    var curr_month = date.getMonth() + 1; //Months are zero based
    var curr_year = date.getFullYear();
    const from: string = curr_year + "/" + curr_month + "/" + curr_date;
    this.loadCalendar(from, from, this.options);
  }

  setValues(values: IPartValue[]) {
    if (values && values.length == 1) {
      this.dateRange.datePickerInput.value = this.options.culture =="en" ? values[0].value?.mstring :values[0].value?.sstring;
    }
  }

  getValuesForValidate() {
    return this.dateRange.datePickerInput.value;
  }

  getAddedValuesAsync(): IPartValue[] {
    let retVal: IPartValue[] = null;
    const value = this.dateRange.datePickerInput.value;
    console.log(value,this.dateRange.data)
    if (this.dateRange.data) {
      if (value?.length > 0) {
        retVal = new Array<IPartValue>();
        retVal.push({ value: {
          dateid : this.dateRange.datePickerInput.getAttribute(
            "data-datepicker-dateid"
          ),
          sstring : this.dateRange.datePickerInput.getAttribute(
            "data-datepicker-sstring"
          ),
          mstring :this.dateRange.datePickerInput.getAttribute(
            "data-datepicker-mstring",
          ),
        } });
      }
    } else {
      if (value?.length > 0) {
        retVal = new Array<IPartValue>();
        retVal.push({ value: value });
      }
    }

    return retVal;
  }

  getEditedValuesAsync(baseValues: IPartValue[]): IPartValue[] {
    let retVal: IPartValue[] = null;
    const baseValue = baseValues[0].value;
    const baseId = baseValues[0].id;
    const value = this.dateRange.datePickerInput.value;
    if (this.dateRange.data) {
      if (value?.length > 0) {
        retVal = new Array<IPartValue>();
        retVal = new Array<IPartValue>();
        retVal.push({ id :baseId , value: {
          dateid : this.dateRange.datePickerInput.getAttribute(
            "data-datepicker-dateid"
          ),
          sstring : this.dateRange.datePickerInput.getAttribute(
            "data-datepicker-sstring"
          ),
          mstring :this.dateRange.datePickerInput.getAttribute(
            "data-datepicker-mstring",
          ),
        } });
        console.log(retVal)
      }
    } else {
      if (value?.length > 0 && value != baseValue) {
        retVal = new Array<IPartValue>();
        retVal.push({ id: baseId, value: value });
      }
    }
    return retVal;
  }

  getDeletedValuesAsync(baseValues: IPartValue[]): IPartValue[] {
    let retVal: IPartValue[] = null;
    const value = this.dateRange.datePickerInput.value;
    if (value?.length == 0) {
      retVal = baseValues;
    }
    return retVal;
  }
}
