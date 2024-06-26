import { DateRange } from "../calendar";
import IWidget from "../../basiscore/BasisPanel/IWidget";


export class Modal {
  public cover: HTMLElement;
  public readonly owner : DateRange
  constructor(owner : DateRange) {
    this.cover = document.createElement("div");
    this.owner = owner
    window.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });
  }
  openModal(modalContent: HTMLElement) {
    
    let modalBody = document.createElement("div");
    // let modalInside = this.generateNoteList();
    let modalInside = modalContent;
    this.cover.setAttribute("data-cover", "");
    if(document.querySelector("[data-bc-bp-main-container]")){
      this.cover.setAttribute("style", `height:${ document.querySelector("[data-bc-bp-main-container]").clientHeight}px`)
    }
    
    this.cover.addEventListener("click", (e) => {
    if(this.owner?.Owner?.dc?.isRegistered("widget")){        
        const widgetName = this.owner.Owner.dc.resolve<IWidget>("widget");
         widgetName.title= this.owner.options.labels["mainTitle"]       
    }
      this.closeModal();
    });
    modalBody.setAttribute("data-modal-form", "");
    modalBody.setAttribute("data-sys-popup","")
    modalBody.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    modalBody.appendChild(modalInside);
    this.cover.appendChild(modalBody);
    document.body.appendChild(this.cover);
  }

  closeModal() {
    this.cover.innerHTML= ""
    this.cover.remove();
    
  }
  
}
