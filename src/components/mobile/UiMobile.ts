import { Day } from "../Day/Day";
import { Modal } from "../Modal/Modal";
import { DateRange } from "../calendar";
import { INote } from "../Interface/Interface";
import layout from "../UiCalendar/asset/shareForm.html";
import IWidget from "../../basiscore/BasisPanel/IWidget";
import newForm from "../UiCalendar/asset/layout.html";
import moreBox from "../mobile/asset/more.html";
import moreShareBox from "../UiCalendar/asset/moreShare.html";
import reminderForm from "../UiCalendar/asset/reminderForm.html"

export class UiMbobile {
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
          // liElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.3)`;
          liElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
        }
        else{
          // liElement.style.background = `#999999`;
          liElement.style.background = `#999999`;
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
    const sharingParent= formWrapper.querySelector("[data-calendar-share-form-uniqe]")
    const submitShareForm = formWrapper.querySelector("[data-reminder-submit]")
    const sharingInputUniqe = formWrapper.querySelector("#data-calendar-share-input-uniqe") as HTMLInputElement
    sharingInputUniqe.addEventListener("keyup", (e) =>{
      submitShareForm.removeAttribute("disabled")
    })
    return formWrapper
  }
  generateReminderForm(note? : INote): Node{
    let formWrapper = document.createElement("form");
    formWrapper.innerHTML = reminderForm;
    const dropDowns = formWrapper.querySelectorAll("[bc-calendar-drop-down]");
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
    newBtn.innerHTML = `<svg width="19" height="20" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.0714 8.67857H8.42857V13.3214C8.42857 13.8321 8.01071 14.25 7.5 14.25C6.98929 14.25 6.57143 13.8321 6.57143 13.3214V8.67857H1.92857C1.41786 8.67857 1 8.26071 1 7.75C1 7.23929 1.41786 6.82143 1.92857 6.82143H6.57143V2.17857C6.57143 1.66786 6.98929 1.25 7.5 1.25C8.01071 1.25 8.42857 1.66786 8.42857 2.17857V6.82143H13.0714C13.5821 6.82143 14 7.23929 14 7.75C14 8.26071 13.5821 8.67857 13.0714 8.67857Z" fill="#ffffff"/>
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
      divElement.innerHTML =  emptyListText;
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
        divElement.style.borderRight = `20px solid rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
      }
      else{
        divElement.style.background = `#999999`;
        divElement.style.color = `#fff`;
        description.style.color= "#fff"
      }      
      let deleteAlert = document.createElement("div")
      deleteAlert.innerHTML= deleteAlert.innerHTML=`
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
      // const reminderBtn : HTMLElement = moreButtonBox.querySelector("[bc-calendar-reminder-note]")
      const reminderBtn : HTMLElement = document.createElement("div")
      shareBtn.addEventListener("click", async (e) => {
        this.modal.cover.querySelector("[data-calendar-new-btn]").remove()        
        modalBody.innerHTML = "";
        modalBody.appendChild(this.generateShareForm(x));
        const shareHeader = modalHeader.querySelector("[data-calendar-modal-header-date]")
        shareHeader.innerHTML=""
        shareHeader.textContent= this.range.options.labels.shareBoxTitle
        const shareSubmit = modalBody.querySelector("[data-calendar-submit]")
        const shareListWrapper = modalBody.querySelector("[data-calendar-share-note-wrapper]") as HTMLElement
        shareListWrapper.innerHTML = ""
        this.getSharingList(x, modalBody,shareListWrapper)
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
      });
      reminderBtn.addEventListener("click", async (e) => {
        modalBody.innerHTML = "";
        modalBody.appendChild(this.generateReminderForm(x));
        const switchButtons = modalBody.querySelectorAll("[bc-calendar-change-button]")
        const reminderSubmit = modalBody.querySelector("[data-calendar-submit]")
        const actionId = modalBody.querySelector("[bc-calendar-action-id]") as HTMLInputElement
        const timeType = modalBody.querySelector("[bc-calendar-dropdown-id]") as HTMLInputElement
        const num = modalBody.querySelector("[bc-calendar-time-num]") as HTMLInputElement
        const obj = { 
          noteid : x.id,
          creatoruser:  this.range.userId
        }
        const viewNote =await this.range.sendAsyncDataPostJson(obj , this.range.options.baseUrl["viewnote"])
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

        if(viewNote[0].reminder.length > 0){
          
          const actionidVal = viewNote[0].reminder[0].actionID
          const timetypeVal = viewNote[0].reminder[0].timetype
          const numVal = viewNote[0].reminder[0].num
          const timeTypes= modalBody.querySelectorAll("li")
          const timeTypeInput = modalBody.querySelector("[bc-calendar-dropdown-id]") as HTMLInputElement
          timeTypeInput.value = timetypeVal
          timeTypes.forEach((e) => {
            if(e.getAttribute("data-id") == timetypeVal){
              modalBody.querySelector("[bc-calendar-drop-down-btn]").textContent= e.textContent
            }
          })
          num.value = numVal

        }
        reminderSubmit.addEventListener("click" , (e) => {
          e.preventDefault()
          const obj = { 
            noteid : x.id,
            reminder: [
              {
                id : 0,
                actionid : actionId.value,
                timetype : timeType.value,
                num : num.value
              }
            ]
          }
          let apiLink = this.range.options.baseUrl["reminder"]
        this.range.sendAsyncDataPostJson(obj, apiLink);
        })
      })
    
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
   
    viewNote[0].sharing.forEach((e) => {
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
      shareUserName.setAttribute("data-calendar-sharing-username","")
      shareUserName.setAttribute("data-sys-text","")
      shareUserName.textContent = e.name
      shareItemSpan.textContent =`( ${e.username} )` 
      shareUserName.appendChild(shareItemSpan)
      shareItem.appendChild(shareUserName)
      shareItem.appendChild(removeSharing)

      wrapper.appendChild(shareItem)
     
    })
  }
}
