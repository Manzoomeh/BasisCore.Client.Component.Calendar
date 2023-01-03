import { Day } from "../Day/Day";
import { Modal } from "../Modal/Modal";
import { DateRange } from "../calendar";
import { INote } from "../Interface/Interface";
import layout from "../UiCalendar/asset/shareForm.html";
import serviceShareLayout from "../UiCalendar/asset/shareFormForService.html";
import IWidget from "../../basiscore/BasisPanel/IWidget";
import newForm from "../UiCalendar/asset/layout.html";
import moreBox from "../UiCalendar/asset/more.html";
import moreShareBox from "../UiCalendar/asset/moreShare.html";
import reminderForm from "../UiCalendar/asset/reminderForm.html"
import reminderList from "../UiCalendar/asset/reminderList.html"
import { TimepickerUI } from "timepicker-ui";
import { OptionTypes } from "timepicker-ui";



export class UiCalendar {
  private readonly day: Day;
  readonly range: DateRange;
  modal: Modal;
  constructor(owner: DateRange, day: Day) {
    this.day = day;
    this.range = owner;
    this.modal = new Modal(owner);
    if (this.range?.Owner?.dc?.isRegistered("widget") ) {
      const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
      widgetName.title = this.range.options.labels["mainTitle"];
    }
    
  }
  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
  generateDaysUi(): Node {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    let secondCulture = document.createElement("span");
    const dateWrapper = document.createElement("div");
    dayElement.setAttribute("data-calendar-day", "");
    dayElement.setAttribute("data-sys-inherit","")
    secondCulture.setAttribute("data-calendar-second-day", "");
    dateWrapper.setAttribute("bc-calendar-date-wrppaer", "");
    secondCulture.textContent = this.day.secondValue + "";
    spanElement.textContent = this.day.currentDay.day + "";
    dayElement.setAttribute("data-id1", this.day.dateId.toString());
    dateWrapper.appendChild(spanElement);
    dateWrapper.appendChild(secondCulture);
    dayElement.appendChild(dateWrapper);
    if(this.day.isHoliday){
      dayElement.setAttribute("data-calendar-holiday" ,"")
      dayElement.setAttribute("data-sys-text-secondary" ,"")      
    }
    else{
      dayElement.setAttribute("data-sys-text","")
    }
    let ulElement = document.createElement("ul");
    let noteElement = document.createElement("div");
    var todayNote = this.range.getDayNotes(this.day.dateId);
    noteElement.setAttribute("data-calendar-note-lists", "");
    noteElement.appendChild(ulElement);
    if (todayNote != undefined) {
      todayNote.map((x) => {
        let liElement = document.createElement("li");
        liElement.textContent = x.note;
        const color: object = this.hexToRgb(`${x.color}`);
        if(color){
          liElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.3)`;
          liElement.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
        }
        else{
          liElement.style.background = `#999999`;
          liElement.style.color = `#fff`;
        }
       
        ulElement.appendChild(liElement);
      });
      dayElement.appendChild(noteElement);
    }
    if (this.day.isToday == true) {
      dayElement.setAttribute("data-today", "");
    }
    dayElement.addEventListener("click", (e) => {
      if (this.range?.Owner?.dc?.isRegistered("widget") ) {
        const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
        widgetName.title = this.range.options.labels["list"];
      }
      let modalInside = this.generateNoteList();
      this.modal.openModal(modalInside);
    });
    return dayElement;
  }
  generateNoteForm(note?: INote, creator? : number): HTMLElement {

    const editCodeWrapper: HTMLElement = document.createElement("div");
    
    editCodeWrapper.innerHTML = newForm;
    editCodeWrapper.querySelector("[data-calendar-title-input]").setAttribute("placeholder",this.range.options.labels.titrTitle) 
    editCodeWrapper.querySelector("[data-calendar-description-textarea]").setAttribute("placeholder",this.range.options.labels.noteTitle) 
    editCodeWrapper.querySelector("[bc-calendar-time]").setAttribute("placeholder",this.range.options.labels.timeTitle) 
    editCodeWrapper.querySelector("[bc-calendar-drop-down-btn]").innerHTML=this.range.options.labels.categoryTitle
    editCodeWrapper.querySelector("[new-form-submit-button]").innerHTML=this.range.options.labels.submitKeyTitle
    let titleInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[data-calendar-title-input]"
    );
    
    let descInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[data-calendar-description-textarea]"
    );
    let timeInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[bc-calendar-time]"
    );
    let catidInput : HTMLInputElement= editCodeWrapper.querySelector("[bc-calendar-dropdown-id]")
    let submitBtn =  editCodeWrapper.querySelector(
      "[new-form-submit-button]"
    );
    
    let cancelBtn = document.createElement("button");
    const catsList= editCodeWrapper.querySelector("#da-bc-calendar-cats-list")
    this.range.categories.forEach((e) => {
      const catLi = document.createElement("li")
      catLi.setAttribute("data-sys-input-text","")
      const catSpan=document.createElement("span")
      const catTitle = document.createElement("span")
      catSpan.setAttribute("style",`background-color:${e.color}`)
      catSpan.setAttribute("bc-calendar-cat-color","")
      catTitle.textContent= e.title
      catTitle.setAttribute("data-sys-text","")
      catLi.appendChild(catSpan)
      catLi.appendChild(catTitle)
      catLi.setAttribute("data-id" , e.id.toString())
      catsList.appendChild(catLi)
    })
   
    cancelBtn.textContent = "لغو";
    if (note) {
      titleInput.value = note.note;
      descInput.value = note.description;
      timeInput.value = note.time;
      catidInput.value = note.catid.toString()
      const catsLi = editCodeWrapper.querySelectorAll("li")
      const catsText = editCodeWrapper.querySelector("[bc-calendar-drop-down-btn]")
      catsLi.forEach((e) => {
        if(parseInt(e.getAttribute("data-id")) == note.catid){
          catsText.textContent = e.innerText
        }
      })
    }
    const catId = editCodeWrapper.querySelector("[bc-calendar-dropdown-id]") as HTMLInputElement
    submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const newNoteObj = {
        "dateid": this.day.dateId.toString(),
        "noteid":(note.id).toString(),
        "time": timeInput.value ? timeInput.value : "00:00",
        "note": titleInput.value ? titleInput.value : "",
        "description": descInput.value ? descInput.value : "",
        "catid" : catId.value ? catId.value : ""
      }

      let apiLink = this.range.options.baseUrl["addnote"]
      this.range.sendAsyncDataPostJson(newNoteObj, apiLink);
      if (this.range.options.displayNote) {
        await this.range.refreshNotesAsync();
      }
      this.range.renderAsync();
      this.modal.closeModal()
    });


    if(creator == 1){
    const dropDowns = editCodeWrapper.querySelectorAll("[bc-calendar-drop-down]");
    dropDowns.forEach((el) => {
      const dropDownBtn  = el.querySelector("[bc-calendar-drop-down-btn]")
      const liItems = el.querySelectorAll("li")
     
      liItems.forEach((LIelement) => {
        LIelement.addEventListener("click" , function(element){
          const dropdownValue = el.querySelector("[bc-calendar-dropdown-id]") as HTMLInputElement
          dropdownValue.value = this.getAttribute("data-id")
          const liText = element.target as HTMLElement
          dropDownBtn.textContent = liText.innerText
        })
      })
      el.addEventListener("click", function (element) {
        dropDownBtn.nextElementSibling.classList.toggle("open_drop_down");       
       
      });
    });
  }
    if(creator == 0){
      editCodeWrapper.querySelector("[new-form-submit-cancel-buttons]").remove()
      const readonlyInputs = editCodeWrapper.querySelectorAll("input,textarea")
      readonlyInputs.forEach((e) => {
        e.setAttribute("readonly" , "true")
      })
    }
    return editCodeWrapper;
  }

  generateShareForm(note? : INote): Node{
    let formWrapper = document.createElement("form");
    formWrapper.innerHTML = layout;
    formWrapper.querySelector("[data-calendar-share-input]").setAttribute("placeholder",this.range.options.labels.shareTextTitle)
    formWrapper.querySelector("[data-reminder-submit]").setAttribute("placeholder",this.range.options.labels.submitKeyTitle)
    const submitShareForm = formWrapper.querySelector("[data-reminder-submit]")
    const sharingInputUniqe = formWrapper.querySelector("#data-calendar-share-input-uniqe") as HTMLInputElement
    sharingInputUniqe.addEventListener("keyup", (e) =>{
      submitShareForm.removeAttribute("disabled")
    })
    return formWrapper
  }
  async initReciverData(id:number, formWrapper : HTMLElement) {  
    
    const reciverData=await this.range.sendAsyncDataGetMethod(this.range.options.baseUrl["reciver"].replace("${catid}" , id))
    if(reciverData.length == 0){      
          const errors = formWrapper.querySelectorAll("[data-calendar-tooltip-flag]")
          errors.forEach( ee => {
            ee.remove()
          })
          const error = document.createElement("div")
          error.setAttribute("data-calendar-tooltip-flag","")
          error.setAttribute("data-sys-message-danger","")
          error.setAttribute("data-sys-message-danger-fade-in","")
          error.setAttribute("style","display: block")
          error.innerHTML=`
         <span>
         هیچ گروه کاربری برای گروه فرستنده تعریف نشده است
         <i class="lni lni-close"></i>
         </span> `
          
        formWrapper.querySelector("#errors").appendChild(error)
          setTimeout(function() {
            error.setAttribute("data-sys-message-danger-fade-out","")
        }, 3000);
        formWrapper.querySelector("[bc-calendar-drop-down-reciver-title]").setAttribute("bc-calendar-drop-down-reciver-deactive","")         
    }
    else{
      formWrapper.querySelector("[bc-calendar-drop-down-reciver-title]").removeAttribute("bc-calendar-drop-down-reciver-deactive")
    }
    const reciverUl = formWrapper.querySelector("#reciver")
    reciverUl.innerHTML = ""
    reciverData.forEach(element => {
      const reciverLi : HTMLElement = document.createElement("li")
      reciverLi.addEventListener("click", (e) => {
        const dropdownValue = formWrapper.querySelector("[bc-calendar-dropdown-reciver]") as HTMLInputElement
        dropdownValue.value = element.id
        formWrapper.querySelector("[data-calendar-submit]").removeAttribute("disabled")
        formWrapper.querySelector("[bc-calendar-drop-down-reciver-title]").textContent=element.title
      
      })
      reciverLi.textContent = element.title
      reciverUl.appendChild(reciverLi)
 
    });
  }
  async generateShareFormForService(note? : INote) : Promise<Node> {
    const senderData=await this.range.sendAsyncDataGetMethod(this.range.options.baseUrl["sender"])
    let formWrapper = document.createElement("form");
    formWrapper.innerHTML = serviceShareLayout;
    const senderUl = formWrapper.querySelector("#sender")   
    senderUl.innerHTML = ""
    senderData.forEach(element => {
      const senderLi : HTMLElement = document.createElement("li")
      senderLi.addEventListener("click", e => {
        const dropdownValue = formWrapper.querySelector("[bc-calendar-dropdown-sender]") as HTMLInputElement
        dropdownValue.value = element.id
        this.initReciverData(element.id , formWrapper)
        formWrapper.querySelector("[bc-calendar-drop-down-sender-title]").textContent=element.title
      })
      senderLi.textContent = element.title
      senderUl.appendChild(senderLi)
    });

    const dropDownBtns = formWrapper.querySelectorAll("[bc-calendar-drop-down-btn]")
    dropDownBtns.forEach(el => {
      el.addEventListener("click" , e => {
        const openDropDowns = document.querySelectorAll(".open_drop_down")
        openDropDowns.forEach(item => {
          item.classList.remove("open_drop_down")
        
        })
        el.nextElementSibling.classList.add("open_drop_down");       
       
       
      })
    })
    
    
    // formWrapper.querySelector("[data-calendar-share-input]").setAttribute("placeholder",this.range.options.labels.shareTextTitle)
    // formWrapper.querySelector("[data-reminder-submit]").setAttribute("placeholder",this.range.options.labels.submitKeyTitle)
    // const sharingParent= formWrapper.querySelector("[data-calendar-share-form-uniqe]")
    // const submitShareForm = formWrapper.querySelector("[data-reminder-submit]")
    // const sharingInputUniqe = formWrapper.querySelector("#data-calendar-share-input-uniqe") as HTMLInputElement
    // sharingInputUniqe.addEventListener("keyup", (e) =>{
    //   submitShareForm.removeAttribute("disabled")
    // })
    return formWrapper
  }
  generateReminderForm(note? : INote): Node{
    let formWrapper = document.createElement("form");
    formWrapper.innerHTML = reminderForm;
    let unitId = 1
   
    
    return formWrapper
  }
 

  generateNoteList(): HTMLElement {
    let listWrapper = document.createElement("div");
    listWrapper.setAttribute("data-calendar-note-list", "");
    let boxElement = document.createElement("div");
    const modalHeader = document.createElement("div");
    const modalBody = document.createElement("div");
    const newBtn = document.createElement("div");
    const currentDate = document.createElement("div");
    const closeBtn = document.createElement("div");
    const modalBtns = document.createElement("div");
    
    modalHeader.setAttribute("data-calendar-modal-header", "");
    modalBody.setAttribute("data-calendar-modal-body", "");
    newBtn.setAttribute("data-calendar-new-btn", "");
    closeBtn.setAttribute("data-calendar-close-btn", "");
   
    
    modalBtns.setAttribute("data-calendar-modal-btns", "");
    currentDate.setAttribute("data-calendar-modal-header-date", "");
    currentDate.setAttribute("data-calendar-modal-header-date", "");
    currentDate.setAttribute("data-sys-text","")
    newBtn.innerHTML = `<svg  width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path data-sys-text="" d="M9.9 4.5H8.1V8.1H4.5V9.9H8.1V13.5H9.9V9.9H13.5V8.1H9.9V4.5ZM9 0C4.032 0 0 4.032 0 9C0 13.968 4.032 18 9 18C13.968 18 18 13.968 18 9C18 4.032 13.968 0 9 0ZM9 16.2C5.031 16.2 1.8 12.969 1.8 9C1.8 5.031 5.031 1.8 9 1.8C12.969 1.8 16.2 5.031 16.2 9C16.2 12.969 12.969 16.2 9 16.2Z" fill="#004B85"/>
    </svg>
    `;
    closeBtn.innerHTML = `<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path data-sys-text="" opacity="0.8" d="M8.05223 7.49989L13.3519 13.3409C13.6968 13.7208 13.6968 14.3351 13.3519 14.7151C13.0072 15.095 12.4498 15.095 12.1051 14.7151L6.80521 8.87405L1.50552 14.7151C1.16063 15.095 0.603404 15.095 0.258671 14.7151C-0.0862237 14.3351 -0.0862237 13.7208 0.258671 13.3409L5.55836 7.49989L0.258671 1.65889C-0.0862237 1.27896 -0.0862237 0.66466 0.258671 0.284728C0.430473 0.0952063 0.656366 0 0.882097 0C1.10783 0 1.33356 0.0952063 1.50552 0.284728L6.80521 6.12572L12.1051 0.284728C12.277 0.0952063 12.5028 0 12.7285 0C12.9542 0 13.18 0.0952063 13.3519 0.284728C13.6968 0.66466 13.6968 1.27896 13.3519 1.65889L8.05223 7.49989Z" fill="black"/>
    </svg>
    `;

    closeBtn.addEventListener("click", (e) => {
      this.modal.closeModal();
    });
    currentDate.innerHTML = `<span>${this.day.currentDay.day}</span> <span>${this.day.month.monthName}</span> <span>${this.day.month.currentYear}</span>`;
    modalBtns.appendChild(closeBtn);
    modalBtns.appendChild(newBtn);
    modalHeader.appendChild(modalBtns);
    modalHeader.appendChild(currentDate);
    
    newBtn.addEventListener("click", async (e) => {
      await this.range.getCategories()
      if (this.range?.Owner?.dc?.isRegistered("widget") ) {
        const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
        widgetName.title = this.range.options.labels["new"];
      }
      const newBox: Element = document.createElement("div");
      modalBody.innerHTML = "";
      newBox.innerHTML = newForm;
      const timeInputt : HTMLElement= newBox.querySelector("[bc-calendar-time-input]") 
      const datePickerOptions : OptionTypes = {okLabel :"تایید" , cancelLabel:"کنسل",amLabel:"ق.ظ",pmLabel:"ب.ظ",clockType:"24h" ,timeLabel : "",delayHandler:10};
      const newTimepicker = new TimepickerUI(timeInputt, datePickerOptions);
      const modalParent : HTMLElement = modalBody.closest("[data-modal-form]") 
      timeInputt.addEventListener("click",timeElement => {        
      
       modalParent.style.display="none"
        newTimepicker.open();
      })
      timeInputt.addEventListener("accept", (event) => {
        setTimeout(timeoute => {
          modalParent.style.display="block"
        },300)
        
      });
      timeInputt.addEventListener("cancel", (event) => {
        setTimeout(timeoute => {
          modalParent.style.display="block"
        },300)
      });
    
      newBox.querySelector("[data-calendar-title-input]").setAttribute("placeholder",this.range.options.labels.titrTitle) 
      newBox.querySelector("[data-calendar-description-textarea]").setAttribute("placeholder",this.range.options.labels.noteTitle) 
      newBox.querySelector("[bc-calendar-time]").setAttribute("placeholder",this.range.options.labels.timeTitle) 
      newBox.querySelector("[bc-calendar-drop-down-btn]").innerHTML=this.range.options.labels.categoryTitle
      newBox.querySelector("[new-form-submit-button]").innerHTML=this.range.options.labels.submitKeyTitle
      const catsList= newBox.querySelector("#da-bc-calendar-cats-list")
      this.range.categories.forEach((e) => {
        const catLi = document.createElement("li")
        catLi.setAttribute("data-sys-input-text","")
        const catSpan=document.createElement("span")
        const catTitle = document.createElement("span")
        catSpan.setAttribute("style",`background-color:${e.color}`)
        catSpan.setAttribute("bc-calendar-cat-color","")
        catTitle.textContent= e.title
        catTitle.setAttribute("data-sys-text","")
        catLi.appendChild(catSpan)
        catLi.appendChild(catTitle)
        catLi.setAttribute("data-id" , e.id.toString())
        catsList.appendChild(catLi)
      })
      this.range.Owner.processNodesAsync(
        Array.from(newBox.childNodes)
      );
      const dropDowns = newBox.querySelectorAll("[bc-calendar-drop-down]");
      dropDowns.forEach((el) => {
        const dropDownBtn  = el.querySelector("[bc-calendar-drop-down-btn]")
        const liItems = el.querySelectorAll("li")
        liItems.forEach((LIelement) => {
          LIelement.addEventListener("click" , function(element){
            const dropdownValue = el.querySelector("[bc-calendar-dropdown-id]") as HTMLInputElement
            dropdownValue.value = this.getAttribute("data-id")
            const liText = element.target as HTMLElement
            dropDownBtn.textContent = liText.innerText
          })
        })
        el.addEventListener("click", function (element) {
          dropDownBtn.nextElementSibling.classList.toggle("open_drop_down");       
         
        });
      });

      modalBody.appendChild(newBox);
      const submitBtn:HTMLElement =modalBody.querySelector("[new-form-submit-button]")
      const timeInput = modalBody.querySelector("[bc-calendar-time]") as HTMLInputElement
      const titleInput = modalBody.querySelector("[data-calendar-title-input]") as HTMLInputElement
      const descInput = modalBody.querySelector("[data-calendar-description-textarea]") as HTMLInputElement
      const catId = modalBody.querySelector("[bc-calendar-dropdown-id]") as HTMLInputElement
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const newNoteObj = {
          "dateid": this.day.dateId.toString(),
          "noteid": (0).toString(),
          "time": timeInput.value ? timeInput.value : "00:00",
          "note": titleInput.value ? titleInput.value : "",
          "description": descInput.value ? descInput.value : "",
          "catid" : catId.value ? catId.value : ""
        }
        
        let apiLink = this.range.options.baseUrl["addnote"]
        this.range.sendAsyncDataPostJson(newNoteObj, apiLink);
        if (this.range.options.displayNote) {
          await this.range.refreshNotesAsync();
        }
        // this.modal.closeModal();
        this.range.renderAsync();
        this.modal.closeModal()
      });


    });

    var todayNote = this.range.getDayNotes(this.day.dateId);
    if (todayNote.length == 0) {
      let divElement = document.createElement("div");
      divElement.setAttribute("data-calendar-no-message", "");
      divElement.setAttribute("data-sys-inherit", "");
      const emptyListText = this.range.options.labels.emptyNoteList
      const emptyListIcon = `<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30.6 47.6C30.6 45.7222 32.1222 44.2 34 44.2C35.8778 44.2 37.4 45.7222 37.4 47.6C37.4 49.4778 35.8778 51 34 51C32.1222 51 30.6 49.4778 30.6 47.6ZM30.6 20.4C30.6 18.5222 32.1222 17 34 17C35.8778 17 37.4 18.5222 37.4 20.4V34C37.4 35.8778 35.8778 37.4 34 37.4C32.1222 37.4 30.6 35.8778 30.6 34V20.4ZM33.966 0C15.198 0 0 15.232 0 34C0 52.768 15.198 68 33.966 68C52.768 68 68 52.768 68 34C68 15.232 52.768 0 33.966 0ZM34 61.2C18.972 61.2 6.8 49.028 6.8 34C6.8 18.972 18.972 6.8 34 6.8C49.028 6.8 61.2 18.972 61.2 34C61.2 49.028 49.028 61.2 34 61.2Z" fill="#D0D0D0"/>
      </svg>
      `;
      divElement.innerHTML = emptyListIcon + emptyListText;
      divElement.setAttribute("data-sys-text-disabled","")
      modalBody.appendChild(divElement);
    }
    todayNote.map((x) => {
      const delBtn = document.createElement("div");

      const divElement: HTMLElement = document.createElement("div");
      const divElementHeader: HTMLElement = document.createElement("div");
      const textSpan: HTMLElement = document.createElement("div");
      const description: HTMLElement = document.createElement("div");
      const moreButton: HTMLElement = document.createElement("div");
      const color: object = this.hexToRgb(`${x.color}`);
      if(color){
        divElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.2)`;
        divElement.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
      }
      else{
        divElement.style.background = `#999999`;
        divElement.style.color = `#fff`;
        description.style.color= "#fff"
      }      
      let deleteAlert = document.createElement("div")
      deleteAlert.innerHTML=`
      <p >${this.range.options.labels.deleteTextTitle} </p>
      <div class="modalButtons">
   <button type="button" class="modalButton remove" data-sys-button-delete="" data-sys-delete-calendar-note="" >
   ${this.range.options.labels.deleteKeyTitle}
   </button><button type="button" class="modalButton cancelBtn" data-sys-cancel-btn="" data-sys-cancel-delete-calendar-note="" >
   ${this.range.options.labels.cancelKeyTitle}
   </button>
   <div class="message"></div>
   </div>
      `
      deleteAlert.setAttribute("data-calendar-delete-alert","")
      textSpan.textContent = x.note;
      description.textContent = x.description;
      moreButton.innerHTML = `<svg width="5" height="17" viewBox="0 0 5 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path data-sys-text="" d="M2.35707 6.63415C1.28564 6.63415 0.428502 7.46341 0.428502 8.5C0.428502 9.53658 1.28564 10.3659 2.35707 10.3659C3.4285 10.3659 4.28564 9.53658 4.28564 8.5C4.28564 7.46341 3.4285 6.63415 2.35707 6.63415ZM4.28564 1.86585C4.28564 2.90244 3.4285 3.73171 2.35707 3.73171C1.28564 3.73171 0.428502 2.90244 0.428502 1.86585C0.428502 0.829268 1.28564 0 2.35707 0C3.4285 0 4.28564 0.829268 4.28564 1.86585ZM4.28564 15.1341C4.28564 16.1707 3.4285 17 2.35707 17C1.28564 17 0.428502 16.1707 0.428502 15.1341C0.428502 14.0976 1.28564 13.2683 2.35707 13.2683C3.4285 13.2683 4.28564 14.0976 4.28564 15.1341Z" fill="#525252"/>
      </svg>
      `;
      textSpan.setAttribute("bc-calendar-note-title", "");
      description.setAttribute("bc-calendar-note-description", "");
      divElement.setAttribute("data-calendar-note-item", "");
      divElementHeader.setAttribute("data-calendar-note-header", "");
      moreButton.setAttribute("data-calendar-more-button", "");
      const moreButtonBox = document.createElement("div");
    
      
      if(x.creator == 0){
        moreButtonBox.innerHTML = moreShareBox;
        if(this.range.options.level == "user"){

          moreButtonBox.querySelector("[bc-calendar-reminder-note]").remove()
          
        }
        moreButton.appendChild(moreButtonBox);
      moreButton.addEventListener("click", (e) => {
        const moreButtonDropDown = moreButtonBox.querySelector(
          "[bc-calendar-note-operation]"
        );
        moreButtonDropDown.classList.toggle("open_drop_down");
      });
      }
      else{
        
        moreButtonBox.innerHTML = moreBox;
        if(this.range.options.level == "user"){

          moreButtonBox.querySelector("[bc-calendar-reminder-note]").remove()
          
        }
        moreButtonBox.querySelector("[data-bc-edit-btn]").innerHTML = this.range.options.labels.editMenuTitle
        moreButtonBox.querySelector("[data-bc-delete-btn]").innerHTML = this.range.options.labels.deleteMenuTitle
        moreButtonBox.querySelector("[data-bc-share-btn]").innerHTML = this.range.options.labels.shareMenuTitle
       
        
      
      moreButton.appendChild(moreButtonBox);
      moreButton.addEventListener("click", (e) => {
        const moreButtonDropDown = moreButtonBox.querySelector(
          "[bc-calendar-note-operation]"
        );
        moreButtonDropDown.classList.toggle("open_drop_down");
      });
      const shareBtn: HTMLElement = moreButtonBox.querySelector(
        "[bc-calendar-share-note]"
      );
     
      const removeBtn: HTMLElement = moreButtonBox.querySelector(
        "[bc-calendar-delete-note]"
      );
     
      // const reminderBtn : HTMLElement = document.createElement("div")
      shareBtn.addEventListener("click", async (e) => {
        this.modal.cover.querySelector("[data-calendar-new-btn]").remove()        
        modalBody.innerHTML = "";
        if(this.range.options.level == "user"){
          modalBody.appendChild(this.generateShareForm(x));
          const shareSubmit = modalBody.querySelector("[data-calendar-submit]")
          shareSubmit.innerHTML = this.range.options.labels.submitKeyTitle
          shareSubmit.addEventListener("click" ,async (e) => {
            e.preventDefault()
            const users = []
            const usernames = modalBody.querySelectorAll("[data-calendar-share-input]") 
            usernames.forEach((e) => {
              const currentEmail = e as HTMLInputElement
              users.push(currentEmail.value)
            })
           
            let formData = new FormData();
            formData.append("usedforid", x.id.toString());
            formData.append("mid", `63`);
            formData.append("username", JSON.stringify(users));
            let apiLink = this.range.options.baseUrl["sharing"]
            const data = await this.range.sendAsyncData(
              formData,
              apiLink
            );
           
            if(data.errorid == 3){
              const inputs = modalBody.querySelectorAll("[data-calendar-share-form]")
              data.users.forEach((e,i) => {
                const errors = inputs[i].querySelectorAll("[data-calendar-tooltip-flag]")
                errors.forEach(e => {
                  e.remove()
                })
                if(e.errorid == 7) {
                  const error = document.createElement("div")
                  error.setAttribute("data-calendar-tooltip-flag","")
                  error.setAttribute("data-sys-message-danger","")
                  error.setAttribute("data-sys-message-danger-fade-in","")
                  error.setAttribute("style","display: block")
                  error.innerHTML=`
                 <span>
                 یکی از یوزرها اشتباه است 
                 لطفا مجددا بررسی کنید
                 <i class="lni lni-close"></i>
                 </span> `
                  inputs[i].appendChild(error)
                } 
                else if(e.errorid == 11) {
                  const error = document.createElement("div")
                  error.setAttribute("data-calendar-tooltip-flag","")
                  error.setAttribute("data-sys-message-danger","")
                  error.setAttribute("data-sys-message-danger-fade-in","")
                  error.setAttribute("style","display: block")
                  error.innerHTML=` 
                 <span>
                یادداشت قبلا با کاربر به اشتراک گذاشته شده است
                <i class="lni lni-close"></i>
                 </span> `
                  inputs[i].appendChild(error)
                } 
         
                else if(e.errorid == 12) {
                  const error = document.createElement("div")
                  error.setAttribute("data-calendar-tooltip-flag","")
                  error.setAttribute("data-sys-message-danger","")
                  error.setAttribute("data-sys-message-danger-fade-in","")
                  error.setAttribute("style","display: block")
                  error.innerHTML=` 
                 <span>
                کاربر تکراری است 
                <i class="lni lni-close"></i>
                 </span> `
                  inputs[i].appendChild(error)
                } 
                else if(e.errorid == 8) {
                  const error = document.createElement("div")
                  // error.setAttribute("data-calendar-tooltip","")
                  error.setAttribute("data-calendar-tooltip-flag","")
                  error.setAttribute("data-sys-message-danger","")
                  error.setAttribute("data-sys-message-danger-fade-in","")
                  error.setAttribute("style","display: block")
                  error.innerHTML=` 
                 <span>
                نام کاربری اشتباه است 
                <i class="lni lni-close"></i>
                 </span> `
                  inputs[i].appendChild(error)
                } 
              })
            }
            else if(data.errorid == 5){
  
              const inputs = modalBody.querySelectorAll("[data-calendar-share-form]")
              data.users.forEach((e,i) => {
                const errors = inputs[i].querySelectorAll("[data-calendar-tooltip-flag]")
                errors.forEach(e => {
                  e.remove()
                })
                if(e.errorid == 8) {
                  const error = document.createElement("div")
                  error.setAttribute("data-calendar-tooltip-flag","")
                  error.setAttribute("data-sys-message-danger","")
                  error.setAttribute("data-sys-message-danger-fade-in","")
                  error.setAttribute("style","display: block")
                  error.innerHTML=`                <span>
                 یکی از یوزرها اشتباه است 
                 لطفا مجددا بررسی کنید
                 <i class="lni lni-close"></i>
                 </span> `
                  inputs[i].appendChild(error)
                } 
                if(e.errorid == 7) {
                  const error = document.createElement("div")
                  error.setAttribute("data-calendar-tooltip-flag","")
                  error.setAttribute("data-sys-message-danger","")
                  error.setAttribute("data-sys-message-danger-fade-in","")
                  error.setAttribute("style","display: block")
                  error.innerHTML=`
                 <span>
                 یکی از یوزرها اشتباه است 
                 لطفا مجددا بررسی کنید
                 <i class="lni lni-close"></i>
                 </span> `
                  inputs[i].appendChild(error)
                } 
                else if(e.errorid == 11) {
                  const error = document.createElement("div")
                  error.setAttribute("data-calendar-tooltip-flag","")
                  error.setAttribute("data-sys-message-success","")
                  error.setAttribute("data-sys-message-success-fade-in","")
                  error.setAttribute("style","display: block")
                  error.innerHTML=`  <span>
                 اشتراک‌گذاری با موفقیت انجام شد
                  <i class="lni lni-checkmark"></i>
                  </span> 
                `
                  inputs[i].appendChild(error)
                  shareListWrapper.innerHTML = ""
                  this.getSharingList(x, modalBody,shareListWrapper)
                }
                else if(e.errorid == 12) {
                  const error = document.createElement("div")
                  error.setAttribute("data-calendar-tooltip-flag","")
                  error.setAttribute("data-sys-message-danger","")
                  error.setAttribute("data-sys-message-danger-fade-in","")
                  error.setAttribute("style","display: block")
                  error.innerHTML=`
                 <span>
                کاربر تکراری است 
                <i class="lni lni-close"></i>
                 </span> `
                  inputs[i].appendChild(error)
                } 
              })
              setTimeout(e => {
                // this.modal.closeModal()
              }, 2000);
            }
            const errors = modalBody.querySelectorAll("[data-calendar-tooltip-flag]")
            errors.forEach(e => {
              setTimeout(function() {
                e.setAttribute("data-sys-message-danger-fade-out","")
            }, 3000);
            })
       
          })
        }
        else{
           modalBody.appendChild( await this.generateShareFormForService(x));
           modalBody.querySelector("[data-calendar-submit]").addEventListener("click" ,async (e) => {
            e.preventDefault()
            const sender =  modalBody.querySelector("[bc-calendar-dropdown-sender]") as HTMLInputElement
            const reciver = modalBody.querySelector("[bc-calendar-dropdown-reciver]") as HTMLInputElement
            let formData = new FormData();
            formData.append("usedforid", x.id.toString());
            formData.append("ownercatid",  sender.value);
            formData.append("catid", reciver.value);
            let apiLink = this.range.options.baseUrl["sharingService"]
            const data = await this.range.sendAsyncData(
              formData,
              apiLink
            );
            if(data.errorid == 6){
              const error = document.createElement("div")
              error.setAttribute("data-calendar-tooltip-flag","")
              error.setAttribute("data-sys-message-success","")
              error.setAttribute("data-sys-message-success-fade-in","")
              error.setAttribute("style","display: block")
              error.innerHTML=`  <span>
             اشتراک‌گذاری با موفقیت انجام شد
              <i class="lni lni-checkmark"></i>
              </span> 
            `
            document.getElementById("errors").appendChild(error)
             
              setTimeout(function() {
                error.setAttribute("data-sys-message-danger-fade-out","")
            }, 3000);
          
              // modalBody.querySelector("[data-sys-message-success]").setAttribute("data-sys-message-success-fade-in","")
              // setTimeout(() => {
              //   modalBody.querySelector("[data-sys-message-success]").setAttribute("data-sys-message-danger-fade-out","")
              // }, 3000);
            }
          })
        }        
        const shareHeader = modalHeader.querySelector("[data-calendar-modal-header-date]")
        shareHeader.innerHTML=""
        shareHeader.textContent= this.range.options.labels.shareBoxTitle
       
        const shareListWrapper = modalBody.querySelector("[data-calendar-share-note-wrapper]") as HTMLElement
        shareListWrapper.innerHTML = ""
        this.getSharingList(x, modalBody,shareListWrapper)
      
      });
     
    
      removeBtn.addEventListener("click", (e) => {        
        e.preventDefault();
        modalBody.querySelector("[data-calendar-delete-alert]")?.remove()
        divElement.parentNode.insertBefore(deleteAlert, divElement)
        const submitRemoveButton = modalBody.querySelector("[data-sys-delete-calendar-note]")
      const cancelRemoveButton = modalBody.querySelector("[data-sys-cancel-delete-calendar-note]")     
      submitRemoveButton.addEventListener("click", async (removeEvent) => {    
        const obj ={
            noteid : x.id
          }
          let apilink = this.range.options.baseUrl["removenote"]
          this.range.sendAsyncDataPostJson(
            obj,
            apilink     
          );
        
          if (this.range.options.displayNote) {
            await this.range.refreshNotesAsync();
          }
          this.range.renderAsync();
          this.modal.closeModal()
      })
      cancelRemoveButton.addEventListener("click" , (cancelRemoveEvent) => {                
        modalBody.querySelector("[data-calendar-delete-alert]").remove()
      })
      });     

     
    }
    const reminderBtn : HTMLElement = moreButtonBox.querySelector("[bc-calendar-reminder-note]")
    reminderBtn?.addEventListener("click", async (e) => {
      modalBody.innerHTML = "";
      modalBody.appendChild(this.generateReminderForm(x));
      let unitId = 1
      const reminderSubmit = modalBody.querySelector("[data-calendar-submit]")
     
      const obj = { 
        noteid : x.id,
        creatoruser:  this.range.userId
      }
      const viewNote =await this.range.sendAsyncDataPostJson(obj , this.range.options.baseUrl["viewnote"])
     

      if(viewNote[0].reminder.length > 0){   
        viewNote[0].reminder.forEach( reminderItem => {
          const reminderItemDiv = document.createElement("div")
          reminderItemDiv.innerHTML = reminderList
          const actionidVal =reminderItem.actionID
          const timetypeVal = reminderItem.timetype
          const timeValueInput :HTMLInputElement = reminderItemDiv.querySelector("[data-calendar-time-value]") as HTMLInputElement
          const itemdropDown = reminderItemDiv.querySelector("[bc-calendar-drop-down]")
          timeValueInput.value = reminderItem.value  
          itemdropDown.setAttribute("data-id" , timetypeVal)
          itemdropDown.setAttribute("data-text" , reminderItem.timetitle)
          if(actionidVal == 2){
            reminderItemDiv.querySelector("[tab-button-status-mobile]").setAttribute("tab-button-status","active")
            reminderItemDiv.querySelector("[tab-button-status-email]").removeAttribute("tab-button-status")
            const tab = reminderItemDiv.querySelector(".tabActive") as HTMLElement
            tab.style.transform = `translateX(-100%)`;
          }
          modalBody.querySelector("[ data-calendar-reminder-note-wrapper]") .appendChild(reminderItemDiv)
        })
      

      }
      const switchButtons = modalBody.querySelectorAll("[bc-calendar-change-button]")
      switchButtons.forEach(x => {
        x.addEventListener("click" , function(e)  {
          const container = this.closest(".tabWrapper");
          const tabButton = container.querySelectorAll(".tabButton");
          let left = 0;
          tabButton.forEach((btn, index) => {
              btn.setAttribute("tab-button-status", "");
              if (btn == this) {
                  left = index;
              }
          });
          this.setAttribute("tab-button-status", "active");            
          const tab = container.querySelector(".tabActive") as HTMLElement
          tab.style.transform = `translateX(-${left}00%)`;
          const actionidInput = modalBody.querySelector("[bc-calendar-action-id]") as HTMLInputElement
          actionidInput.value = this.getAttribute("data-id")
        })
        
      })
      const dropDowns = modalBody.querySelectorAll("[bc-calendar-drop-down]");
      dropDowns.forEach((el) => {
        
        const dropDownBtn  = el.querySelector("[bc-calendar-drop-down-btn]")
        dropDownBtn.textContent =  el.getAttribute("data-text") ? el.getAttribute("data-text") : "دقیقه"
        const liItems = el.querySelectorAll("li")      
        liItems.forEach((LIelement) => {
          LIelement.addEventListener("click" , function(element){
            
            const dropdownValue = el.querySelector("[bc-calendar-dropdown-id]") as HTMLInputElement
            dropdownValue.value = this.getAttribute("data-id")
            const liText = element.target as HTMLElement
            dropDownBtn.textContent = liText.innerText
            unitId = parseInt( this.getAttribute("data-id"))
          })
        })
        el.addEventListener("click", function (element) {
          
          dropDowns.forEach(cel => {
            cel.querySelector("ul").classList.remove("open_drop_down"); 
            cel.closest("div").classList.remove("open_drop_down_wrapper");             
          })
          dropDownBtn.closest("div").classList.toggle("open_drop_down_wrapper");       
          dropDownBtn.nextElementSibling.classList.toggle("open_drop_down");       
         
        });
      });
      const newReminder = modalBody.querySelector("[data-calendar-new-reminder]")
      
      const timeType = newReminder.querySelector("[bc-calendar-dropdown-id]") as HTMLInputElement
      const num = newReminder.querySelector("[bc-calendar-time-num]") as HTMLInputElement
      reminderSubmit.addEventListener("click" ,async (e) => {
        e.preventDefault()
        const actionId = newReminder.querySelector('[tab-button-status="active"]') 
        
        let newNoteObj ={"id":0,
        "noteid":x.id,
        "unitid":timeType.value,
        "value":num.value,
        "actionid":actionId.getAttribute("data-id")
        
      }
        let apiLink = this.range.options.baseUrl["reminder"]
        const data =await this.range.sendAsyncDataPostJson(newNoteObj, apiLink);
        if(data.errorid == 5){
          const error = document.createElement("div")
          error.setAttribute("data-calendar-tooltip-flag","")
          error.setAttribute("data-sys-message-danger","")
          error.setAttribute("data-sys-message-danger-fade-in","")
          error.setAttribute("style","display: block")
          error.innerHTML=`  <span>
         ابتدا برای یادداشت خود، ساعت انتخاب کنید
         <i class="lni lni-close"></i>
          </span> 
        `
        modalBody.querySelector("#errors").appendChild(error)
          setTimeout(function() {
            error.setAttribute("data-sys-message-danger-fade-out","")
        }, 3000);
      
         
        }
        else if(data.errorid == 2){
          const error = document.createElement("div")
          error.setAttribute("data-calendar-tooltip-flag","")
          error.setAttribute("data-sys-message-danger","")
          error.setAttribute("data-sys-message-danger-fade-in","")
          error.setAttribute("style","display: block")
          error.innerHTML=`  <span>
          عملیات با خطا روبرو شد
         <i class="lni lni-close"></i>
          </span> 
        `
        modalBody.querySelector("#errors").appendChild(error)
          setTimeout(function() {
            error.setAttribute("data-sys-message-danger-fade-out","")
        }, 3000);
      
         
        }
        else if(data.errorid == 6){
          const error = document.createElement("div")
          error.setAttribute("data-calendar-tooltip-flag","")
          error.setAttribute("data-sys-message-success","")
          error.setAttribute("data-sys-message-success-fade-in","")
          error.setAttribute("style","display: block")
          error.innerHTML=`  <span>
          عملیات با موفقیت انجام شد
          <i class="lni lni-checkmark"></i>
          </span> 
        `
        modalBody.querySelector("#errors").appendChild(error)
          setTimeout(function() {
            error.setAttribute("data-sys-message-danger-fade-out","")
        }, 3000);
      
         
        }
   
      })
    })
    const editBtn: HTMLElement = moreButtonBox.querySelector(
      "[bc-calendar-edit-note]"
    );
    editBtn.addEventListener("click", (e) => {
      this.range.getCategories()
      if (this.range?.Owner?.dc?.isRegistered("widget") ) {
        const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
        widgetName.title = this.range.options.labels["edit"];
      }
      modalBody.innerHTML = "";
      modalBody.appendChild(this.generateNoteForm(x,x.creator));  
      const timeInputt : HTMLElement= modalBody.querySelector("[bc-calendar-time-input]") 
      const datePickerOptions : OptionTypes = {okLabel :"تایید" , cancelLabel:"کنسل",amLabel:"ق.ظ",pmLabel:"ب.ظ",clockType:"24h" ,timeLabel : ""};
      const newTimepicker = new TimepickerUI(timeInputt, datePickerOptions);
      const modalParent : HTMLElement = modalBody.closest("[data-modal-form]") 
      timeInputt.addEventListener("click",timeElement => {        

       modalParent.style.display="none"
        newTimepicker.open();
      })
      timeInputt.addEventListener("accept", (event) => {
        setTimeout(timeoute => {
          modalParent.style.display="block"
        },300)
      });
      timeInputt.addEventListener("cancel", (event) => {
        setTimeout(timeoute => {
          modalParent.style.display="block"
        },300)
      });
    const timeInput = modalBody.querySelector("[bc-calendar-time]") as HTMLInputElement
    const titleInput = modalBody.querySelector("[data-calendar-title-input]") as HTMLInputElement
    const descInput = modalBody.querySelector("[data-calendar-description-textarea]") as HTMLInputElement
    



    });
    divElementHeader.appendChild(textSpan);
      divElementHeader.appendChild(moreButton);
      divElement.appendChild(divElementHeader);
      divElement.appendChild(description);
      modalBody.appendChild(divElement);
    });
    boxElement.appendChild(modalHeader);
    boxElement.appendChild(modalBody);
    boxElement.setAttribute("data-calendar-drop-down-view", "");
    listWrapper.insertBefore(boxElement, listWrapper.nextSibling);
    boxElement.addEventListener("click" , function(element){
      const thisElement = element.target as HTMLLIElement
      const dropDowns = boxElement.querySelectorAll("[bc-calendar-drop-down] ul")
      dropDowns.forEach((el) => {
        if(thisElement.getAttribute("bc-calendar-drop-down-btn") == null ){
            el.classList.remove("open_drop_down")
          }
        
      });
   
    })
    return listWrapper;
  }
  
  async getSharingList(note:INote , body:HTMLElement, wrapper : HTMLElement){
    const obj = { 
      noteid : note.id,
      creatoruser:  this.range.userId
    }
    const viewNote =await this.range.sendAsyncDataPostJson(obj , this.range.options.baseUrl["viewnote"])
   
    viewNote[0]?.sharing.forEach((e) => {
      const shareItem = document.createElement("div")
      const shareUserName = document.createElement("div")
      const shareItemSpan = document.createElement("span")
      const removeSharing = document.createElement("div")
      removeSharing.setAttribute("data-calendar-remove-sharing","")
      removeSharing.setAttribute("data-sys-bg-secondary","")
      removeSharing.innerHTML=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.04028 0.0603034L0.0603845 2.0402L4.02018 6L0.0603845 9.9598L2.04028 11.9397L6.00008 7.9799L9.95988 11.9397L11.9398 9.9598L7.97998 6L11.9398 2.0402L9.95988 0.0603037L6.00008 4.0201L2.04028 0.0603034Z" fill="#B40020"/>
      </svg>
      `
      removeSharing.addEventListener("click" , async (eve) => {
        const obj = { 
          usedforid : note.id,
          userid : e.userid ,
          mid: 63,
          id:  e.id
        }
        const removeNote =await this.range.sendAsyncDataPostJson(obj ,  this.range.options.baseUrl["removesharing"])
        shareItem.remove()
      })
      shareItem.setAttribute("data-calendar-sharing-item","")
      shareUserName.setAttribute("data-calendar-sharing-username-service","")
      shareUserName.setAttribute("data-sys-text","")
      shareUserName.textContent = e.name
      shareItemSpan.textContent =`( ${e.username} )` 
      shareUserName.appendChild(shareItemSpan)
      
      if(this.range.options.level == "service"){
        const sender = document.createElement("div")
        const senderCatid = document.createElement("span")
        const senderTitle = document.createElement("div")
        senderCatid.innerHTML =`<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.70021 13.3C8.09021 12.91 8.09021 12.28 7.70021 11.89L3.83021 7.99998H19.0002C19.5502 7.99998 20.0002 7.54998 20.0002 6.99998C20.0002 6.44998 19.5502 5.99998 19.0002 5.99998H3.83021L7.71021 2.11998C8.10021 1.72998 8.10021 1.09998 7.71021 0.70998C7.32021 0.31998 6.69021 0.31998 6.30021 0.70998L0.700215 6.29998C0.310215 6.68998 0.310215 7.31998 0.700215 7.70998L6.29021 13.3C6.68021 13.68 7.32021 13.68 7.70021 13.3Z" fill="#323232"/>
        </svg>
        `
        senderTitle.textContent = e.ownername
        sender.appendChild(senderTitle)
        sender.appendChild(senderCatid)
        const reciver = document.createElement("div")
        const reciverCatid = document.createElement("span")
        const reciverTitle = document.createElement("div")
        reciverCatid.textContent =`( ${e.catid} )` 
        reciverTitle.textContent = e.name
        reciver.appendChild(reciverTitle)
        
        shareUserName.innerHTML = ""
        shareUserName.appendChild(sender)
        shareUserName.appendChild(reciver)
      }
      shareItem.appendChild(shareUserName)
      shareItem.appendChild(removeSharing)
      wrapper.appendChild(shareItem)
     
    })
  }
}
