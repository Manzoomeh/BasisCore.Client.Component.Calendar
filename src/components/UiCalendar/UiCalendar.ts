import { Day } from "../Day/Day";
import { Modal } from "../Modal/Modal";
import { DateRange } from "../calendar";
import { INote } from "../Interface/Interface";
import layout from "../UiCalendar/asset/shareForm.html";
import listLayout from "../../asset/reminderList.html";
import IWidget from "../../basiscore/BasisPanel/IWidget";
import newForm from "../UiCalendar/asset/layout.html";
import moreBox from "../UiCalendar/asset/more.html";
import emailBox from "../UiCalendar/asset/emailBox.html";

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
    secondCulture.setAttribute("data-calendar-second-day", "");
    dateWrapper.setAttribute("bc-calendar-date-wrppaer", "");
    secondCulture.textContent = this.day.secondValue + "";
    spanElement.textContent = this.day.currentDay.day + "";
    dayElement.setAttribute("data-id1", this.day.dateId.toString());
    dateWrapper.appendChild(spanElement);
    dateWrapper.appendChild(secondCulture);
    dayElement.appendChild(dateWrapper);
    let ulElement = document.createElement("ul");
    let noteElement = document.createElement("div");
    var todayNote = this.range.getDayNotes(this.day.dateId);
    noteElement.setAttribute("data-calendar-note-lists", "");
    noteElement.appendChild(ulElement);
    if (todayNote != undefined) {
      todayNote.map((x) => {
        let liElement = document.createElement("li");
        liElement.textContent = x.note;
        const color: object = this.hexToRgb(`#${x.color}`);
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
  generateNoteForm(note?: INote): HTMLElement {
    const editCodeWrapper: HTMLElement = document.createElement("div");
    editCodeWrapper.innerHTML = newForm;

    let titleInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[data-calendar-title-input]"
    );
    
    let descInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[data-calendar-description-textarea]"
    );
    let timeInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[bc-calendar-time]"
    );
    let submitBtn =  editCodeWrapper.querySelector(
      "[new-form-submit-button]"
    );
   
    let btnWrapper = document.createElement("div");
    
    let cancelBtn = document.createElement("button");

   
    cancelBtn.textContent = "لغو";
    if (note) {
      titleInput.value = note.note;
      descInput.value = note.description;
      timeInput.value = note.time;
    }

    submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      let formData = new FormData();
      formData.append("usedforid", (note.id).toString());
      formData.append("time", timeInput.value ? timeInput.value : "00:00");
      formData.append("userid", this.range.userId.toString());
      formData.append("ownerid", "0");
      formData.append("note", titleInput.value ? titleInput.value : "");
      formData.append("description", descInput.value ? descInput.value : "");
      let apiLink = this.range.options.baseUrl;
      this.range.sendAsyncData(formData, `https://api-ticketing.basiscore.com/${this.range.rKey}/editnote`);
      if (this.range.options.displayNote) {
        await this.range.refreshNotesAsync();
      }
      // this.modal.closeModal();
      this.range.renderAsync();
    });


    const dropDowns = editCodeWrapper.querySelectorAll("[bc-calendar-drop-down-btn]");
    dropDowns.forEach((el) => {
      el.addEventListener("click", function (element) {
        this.nextElementSibling.classList.toggle("open_drop_down");
      });
    });
   

    return editCodeWrapper;
  }
  async loadReminderList(form: HTMLElement, note: INote): Promise<void> {
    let formData = new FormData();
    let reminderListWrapper = document.createElement("div");
    formData.append("creatoruser", this.range.userId.toString());
    formData.append("usedforid", note.id.toString());
    formData.append("userid", this.range.userId.toString());
    let apiLink = this.range.options.baseUrl["viewnote"]
    const data = await this.range.sendAsyncData(
      formData,
      apiLink
    );
    const reminderList = data[0].reminder;
    if (reminderList.length > 0) {
      reminderList.map((x) => {
        reminderListWrapper.innerHTML = listLayout;
        let reminderNumber = reminderListWrapper.querySelector(
          "[data-calendar-reminder-input]"
        ) as HTMLInputElement;
        let reminderTimeType = reminderListWrapper.querySelector(
          "[data-calendar-reminder-select]"
        ) as HTMLInputElement;
        let reminderAction = reminderListWrapper.querySelector(
          "[data-calendar-reminder-action]"
        ) as HTMLInputElement;
        reminderNumber.value = x.num;
        reminderTimeType.value = x.timetype;
        reminderAction.value = x.actionID;
        // reminderListWrapper.appendChild(reminderNumber)
      });
    }
    let formInside = form.querySelector("[data-calendar-reminder-list]");
    formInside.appendChild(reminderListWrapper);
    return null;
  }
  generateReminderForm(note? : INote): Node{
    let formWrapper = document.createElement("form");
    formWrapper.innerHTML = layout;
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
    newBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.9 4.5H8.1V8.1H4.5V9.9H8.1V13.5H9.9V9.9H13.5V8.1H9.9V4.5ZM9 0C4.032 0 0 4.032 0 9C0 13.968 4.032 18 9 18C13.968 18 18 13.968 18 9C18 4.032 13.968 0 9 0ZM9 16.2C5.031 16.2 1.8 12.969 1.8 9C1.8 5.031 5.031 1.8 9 1.8C12.969 1.8 16.2 5.031 16.2 9C16.2 12.969 12.969 16.2 9 16.2Z" fill="#004B85"/>
    </svg>
    `;
    closeBtn.innerHTML = `<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.8" d="M8.05223 7.49989L13.3519 13.3409C13.6968 13.7208 13.6968 14.3351 13.3519 14.7151C13.0072 15.095 12.4498 15.095 12.1051 14.7151L6.80521 8.87405L1.50552 14.7151C1.16063 15.095 0.603404 15.095 0.258671 14.7151C-0.0862237 14.3351 -0.0862237 13.7208 0.258671 13.3409L5.55836 7.49989L0.258671 1.65889C-0.0862237 1.27896 -0.0862237 0.66466 0.258671 0.284728C0.430473 0.0952063 0.656366 0 0.882097 0C1.10783 0 1.33356 0.0952063 1.50552 0.284728L6.80521 6.12572L12.1051 0.284728C12.277 0.0952063 12.5028 0 12.7285 0C12.9542 0 13.18 0.0952063 13.3519 0.284728C13.6968 0.66466 13.6968 1.27896 13.3519 1.65889L8.05223 7.49989Z" fill="black"/>
    </svg>
    `;

    closeBtn.addEventListener("click", (e) => {
      this.modal.closeModal();
    });
    currentDate.innerHTML = `<span>${this.day.currentDay.day}</span> <span>${this.day.month.monthName}</span> <span>${this.day.currentDay.year}</span>`;
    modalBtns.appendChild(closeBtn);
    modalBtns.appendChild(newBtn);
    modalHeader.appendChild(modalBtns);
    modalHeader.appendChild(currentDate);

    newBtn.addEventListener("click", (e) => {
      if (this.range?.Owner?.dc?.isRegistered("widget") ) {
        const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
        widgetName.title = this.range.options.labels["new"];
      }
      const newBox: Element = document.createElement("div");
      modalBody.innerHTML = "";
      newBox.innerHTML = newForm;
      const dropDowns = newBox.querySelectorAll("[bc-calendar-drop-down]");
      dropDowns.forEach((el) => {
        const dropDownBtn  = el.querySelector("[bc-calendar-drop-down-btn]")
        const liItems = el.querySelectorAll("li")
        liItems.forEach((LIelement) => {
          LIelement.addEventListener("click" , function(element){
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
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("id", this.day.dateId.toString());
        formData.append("time", timeInput.value ? timeInput.value : "00:00");
        formData.append("userid", this.range.userId.toString());
        formData.append("ownerid", "0");
        formData.append("note", titleInput.value ? titleInput.value : "");
        formData.append("description", descInput.value ? descInput.value : "");
        let apiLink = this.range.options.baseUrl["addnote"]
        this.range.sendAsyncData(formData, apiLink);
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
      const emptyListText = "هیچ یادآوری در این روز وجود ندارد.";
      const emptyListIcon = `<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30.6 47.6C30.6 45.7222 32.1222 44.2 34 44.2C35.8778 44.2 37.4 45.7222 37.4 47.6C37.4 49.4778 35.8778 51 34 51C32.1222 51 30.6 49.4778 30.6 47.6ZM30.6 20.4C30.6 18.5222 32.1222 17 34 17C35.8778 17 37.4 18.5222 37.4 20.4V34C37.4 35.8778 35.8778 37.4 34 37.4C32.1222 37.4 30.6 35.8778 30.6 34V20.4ZM33.966 0C15.198 0 0 15.232 0 34C0 52.768 15.198 68 33.966 68C52.768 68 68 52.768 68 34C68 15.232 52.768 0 33.966 0ZM34 61.2C18.972 61.2 6.8 49.028 6.8 34C6.8 18.972 18.972 6.8 34 6.8C49.028 6.8 61.2 18.972 61.2 34C61.2 49.028 49.028 61.2 34 61.2Z" fill="#D0D0D0"/>
      </svg>
      `;
      divElement.innerHTML = emptyListIcon + emptyListText;
      modalBody.appendChild(divElement);
    }
    todayNote.map((x) => {
      const delBtn = document.createElement("div");

      const divElement: HTMLElement = document.createElement("div");
      const divElementHeader: HTMLElement = document.createElement("div");
      const textSpan: HTMLElement = document.createElement("div");
      const description: HTMLElement = document.createElement("div");
      const moreButton: HTMLElement = document.createElement("div");
      const color: object = this.hexToRgb(`#${x.color}`);
      if(color){
        divElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.2)`;
        divElement.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
      }
      else{
        divElement.style.background = `#999999`;
        divElement.style.color = `#fff`;
        description.style.color= "#fff"
      }      
      textSpan.textContent = x.note;
      description.textContent = x.description;
      moreButton.innerHTML = `<svg width="5" height="17" viewBox="0 0 5 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.35707 6.63415C1.28564 6.63415 0.428502 7.46341 0.428502 8.5C0.428502 9.53658 1.28564 10.3659 2.35707 10.3659C3.4285 10.3659 4.28564 9.53658 4.28564 8.5C4.28564 7.46341 3.4285 6.63415 2.35707 6.63415ZM4.28564 1.86585C4.28564 2.90244 3.4285 3.73171 2.35707 3.73171C1.28564 3.73171 0.428502 2.90244 0.428502 1.86585C0.428502 0.829268 1.28564 0 2.35707 0C3.4285 0 4.28564 0.829268 4.28564 1.86585ZM4.28564 15.1341C4.28564 16.1707 3.4285 17 2.35707 17C1.28564 17 0.428502 16.1707 0.428502 15.1341C0.428502 14.0976 1.28564 13.2683 2.35707 13.2683C3.4285 13.2683 4.28564 14.0976 4.28564 15.1341Z" fill="#525252"/>
      </svg>
      `;
      textSpan.setAttribute("bc-calendar-note-title", "");
      description.setAttribute("bc-calendar-note-description", "");
      divElement.setAttribute("data-calendar-note-item", "");
      divElementHeader.setAttribute("data-calendar-note-header", "");
      moreButton.setAttribute("data-calendar-more-button", "");
      const moreButtonBox = document.createElement("div");
      moreButtonBox.innerHTML = moreBox;
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
      const editBtn: HTMLElement = moreButtonBox.querySelector(
        "[bc-calendar-edit-note]"
      );
      const removeBtn: HTMLElement = moreButtonBox.querySelector(
        "[bc-calendar-delete-note]"
      );
      shareBtn.addEventListener("click", (e) => {
        modalBody.innerHTML = "";
        modalBody.appendChild(this.generateReminderForm(x));
        const shareHeader = modalHeader.querySelector("[data-calendar-modal-header-date]")
        shareHeader.innerHTML=""
        shareHeader.textContent= `به اشتراک گذاری`
        const shareSubmit = modalBody.querySelector("[data-calendar-submit]")
        const emailInput = modalBody.querySelector("[data-calendar-share-input]") as HTMLInputElement
        const emailWrapper= modalBody.querySelector("[data-calendar-share-note-wrapper]")
        shareSubmit.addEventListener("click" , function(e){
          e.preventDefault()
          const newEmail = document.createElement("div")
          newEmail.innerHTML = emailBox
          newEmail.querySelector("span").innerHTML = emailInput.value
          emailWrapper.appendChild(newEmail)
        })
      });

      editBtn.addEventListener("click", (e) => {
        if (this.range?.Owner?.dc?.isRegistered("widget") ) {
          const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
          widgetName.title = this.range.options.labels["edit"];
        }
        modalBody.innerHTML = "";
        modalBody.appendChild(this.generateNoteForm(x));  

      
      const timeInput = modalBody.querySelector("[bc-calendar-time]") as HTMLInputElement
      const titleInput = modalBody.querySelector("[data-calendar-title-input]") as HTMLInputElement
      const descInput = modalBody.querySelector("[data-calendar-description-textarea]") as HTMLInputElement
      



      });
      removeBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("userid", this.range.userId.toString());
        formData.append("ownerid", `0`);
        formData.append("usedforid", `${x.id}`);
        let apilink = this.range.options.baseUrl["removenote"]
        this.range.sendAsyncData(
          formData,
          apilink     
        );
        if (this.range.options.displayNote) {
          await this.range.refreshNotesAsync();
        }
        this.range.renderAsync();
        this.modal.closeModal()
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
}
