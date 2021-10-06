import { DatePicker } from "../DatePicker";
import IComponentManager from "../../basiscore/IComponentManager";
import ISource from "../../basiscore/ISource";
import IUserDefineComponent from "../../basiscore/IUserDefineComponent";
import { SourceId } from "../../basiscore/type-alias";
import { DayNumber, DayValue, MonthNumber } from "../type-alias";

export default class BcComponent implements IComponentManager {
  readonly owner: IUserDefineComponent;
  private dateRange: DatePicker;
  private from: DayValue;
  private to: DayValue;
  private container: HTMLElement;
  private sourceId: SourceId;
  private options: object;
  constructor(owner: IUserDefineComponent) {
    this.owner = owner;
    console.log("constructor");
  }
  public async initializeAsync(): Promise<void> {
    console.log("yes");
    const name = await this.owner.getAttributeValueAsync("name");
    this.container = document.createElement("input");
    this.container.classList.add("date-picker-input");
    this.container.setAttribute("name", name);
    this.owner.setContent(this.container);
    this.sourceId = await this.owner.getAttributeValueAsync("sourceid");
    this.owner.addTrigger([this.sourceId]);
    const settingObject = await this.owner.getAttributeValueAsync(
      "setting-object"
    );
    this.options = eval(settingObject);
    const initFrom = await this.owner.getAttributeValueAsync("from");
    const initTo = await this.owner.getAttributeValueAsync("to");
    if (!initFrom || !initTo) {
      const from = new Date()
        .toLocaleDateString("fa-IR")
        .replace(/([۰-۹])/g, (token) =>
          String.fromCharCode(token.charCodeAt(0) - 1728)
        );
      this.loadCalendar(from, from, this.options);
      
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
}
