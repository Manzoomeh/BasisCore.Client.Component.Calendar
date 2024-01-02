import { DateRange } from "../calendar";
import IComponentManager from "../../basiscore/IComponentManager";
import ISource from "../../basiscore/ISource";
import IUserDefineComponent from "../../basiscore/IUserDefineComponent";
import { SourceId } from "../../basiscore/type-alias";
import { DayNumber, DayValue, MonthNumber } from "../type-alias";

export default class BcComponent implements IComponentManager {
  readonly owner: IUserDefineComponent;
  private dateRange: DateRange;
  private from: DayValue;
  private to: DayValue;
  private container: HTMLElement;
  private sourceId: SourceId;
  private options: object;
  private rKey: string;
  private resetSourceId: SourceId = null;
  constructor(owner: IUserDefineComponent) {
    this.owner = owner;
  }
  public async initializeAsync(): Promise<void> {
    this.container = document.createElement("div");
    this.owner.setContent(this.container);
    this.sourceId = await this.owner.getAttributeValueAsync("sourceid");
    this.rKey = await this.owner.getAttributeValueAsync("rkey");
    this.owner.addTrigger([this.sourceId]);
    const settingObject = await this.owner.getAttributeValueAsync(
      "options"
    );
    this.options = eval(settingObject);
    const initFrom = await this.owner.getAttributeValueAsync("from");
    const initTo = await this.owner.getAttributeValueAsync("to");
    if ((!initFrom || !initTo) && this.options["culture"] == "fa") {
      const from = new Date()
        .toLocaleDateString("fa-IR")
        .replace(/([۰-۹])/g, (token) =>
          String.fromCharCode(token.charCodeAt(0) - 1728)
        );
      this.loadCalendar(from, from, this.options, this.rKey );
    }
    if ((!initFrom || !initTo) && this.options["culture"] == "en") {
      let dateObj = new Date();
      let month = dateObj.getUTCMonth() + 1; //months from 1-12
      let day = dateObj.getUTCDate();
      let year = dateObj.getUTCFullYear();
      
      let newdate = year + "/" + month + "/" + day;
        
      this.loadCalendar(newdate, newdate, this.options, this.rKey );
    }
     else {
      this.loadCalendar(initFrom, initTo, this.options, this.rKey);
    }
    
    const resetSourceId = await this.owner.getAttributeValueAsync(
      "ResetSourceId"
    );
    
    if (resetSourceId) {
      this.resetSourceId = resetSourceId.toLowerCase();
      this.owner.addTrigger([this.resetSourceId]);
    }  
    
  }
  private async displayDataIfExistsAsync(): Promise<void> {
    if (this.sourceId) {
      const source = this.owner.tryToGetSource(this.sourceId);
      await this.initializeAsync()
    }
  }

  public async runAsync(source?: ISource): Promise<boolean> {
    if (source?.id == this.resetSourceId) {
      // this.grid = null;
      // this.container = null
      await this.displayDataIfExistsAsync();
    } else{
  if (source?.id === this.sourceId) {  
      const from = source.rows[0].from;
      const to = source.rows[0].to;
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
      this.loadCalendar(from, to, this.options, this.rKey);
    }
  }
 
 
    return true;
  }
  async loadCalendar(from: string, to: string, obj: object, rKey: string) {
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
    this.dateRange = new DateRange(this.from, this.to, obj, rKey,this.owner);
    this.dateRange.createUIAsync(this.container);
  }
}
