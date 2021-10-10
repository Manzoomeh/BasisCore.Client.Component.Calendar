import { Day } from "../Day/Day";
import { Modal } from "../Modal/Modal";
import { DateRange } from "../calendar";
import { INote } from "../Interface/Interface";
import layout from  "../../asset/reminderForm.html"
import { node } from "webpack";
export class UiCalendar {
  private readonly day: Day;
  readonly range: DateRange;
  modal: Modal;
  constructor(owner: DateRange, day: Day) {
    this.day = day;
    this.range = owner;
    this.modal = new Modal();
  }
  generateDaysUi(): Node {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    dayElement.setAttribute("data-calendar-day", "");
    spanElement.textContent = this.day.currentDay.day + "";
    dayElement.setAttribute("data-id1", this.day.dateId.toString());
    dayElement.appendChild(spanElement);
    let ulElement = document.createElement("ul");
    let noteElement = document.createElement("div");
    var todayNote = this.range.getDayNotes(this.day.dateId);
    noteElement.setAttribute("data-calendar-note-list", "");
    noteElement.appendChild(ulElement);
    if (todayNote != undefined) {
      todayNote.map((x) => {
        let liElement = document.createElement("li");
        liElement.textContent = x.note;
        liElement.style.background = `#${x.color}`;
        ulElement.appendChild(liElement);
      });
      dayElement.appendChild(noteElement);
    }
    if (this.day.isToday == true) {
      dayElement.setAttribute("data-today", "");
    }
    dayElement.addEventListener("click", (e) => {
      let modalInside = this.generateNoteList();
      this.modal.openModal(modalInside);
    });
    return dayElement;
  }
  generateNoteForm(note?: INote): Node {
    let formWrapper = document.createElement("form");
    let titleWrapper = document.createElement("div");
    let descWrapper = document.createElement("div");
    let titleInput = document.createElement("textarea");
    let descInput = document.createElement("textarea");
    let colorTimeWrapper = document.createElement("div");
    let colorInput = document.createElement("input");
    let timeInput = document.createElement("input");
    let colorDiv = document.createElement("div");
    let colorSpan = document.createElement("span");
    let btnWrapper = document.createElement("div");
    let submitBtn = document.createElement("button");
    let cancelBtn = document.createElement("button");
    titleWrapper.setAttribute("data-calendar-form-row", "");
    descWrapper.setAttribute("data-calendar-form-row", "");
    btnWrapper.setAttribute("data-calendar-form-row", "");
    colorTimeWrapper.setAttribute("data-calendar-form-row", "");
    formWrapper.setAttribute("data-calendar-input-wrapper", "");
    colorSpan.setAttribute("data-calendar-code-color", "");
    colorInput.setAttribute("data-calendar-color-input", "");
    timeInput.setAttribute("data-calendar-time-input", "");
    colorDiv.setAttribute("data-calendar-color-add", "");
    submitBtn.setAttribute("data-calendar-submit", "");
    cancelBtn.setAttribute("data-calendar-cancel", "");
    titleInput.setAttribute("type", "text");
    descInput.setAttribute("type", "text");
    colorInput.setAttribute("type", "color");
    timeInput.setAttribute("type", "time");
    titleInput.setAttribute("placeHolder", "متن");
    descInput.setAttribute("placeHolder", "توضیحات");
    submitBtn.textContent = "ثبت";
    cancelBtn.textContent = "لغو";
    if (note) {
      titleInput.value = note.note;
      colorInput.value = `#${note.color}`;
      colorSpan.textContent = `#${note.color}`;
      descInput.value = note.description;
      timeInput.value = note.time;
    }
    submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      let formData = new FormData();
      formData.append("id", this.day.dateId.toString());
      formData.append("time", timeInput.value ? timeInput.value : "00:00");
      formData.append("userid", this.range.userId.toString());
      formData.append("ownerid", "0");
      formData.append("note", titleInput.value ? titleInput.value : "");
      formData.append("description", descInput.value ? descInput.value : "");
      formData.append("color", colorInput.value ? colorInput.value : "");
      this.range.sendAsyncData(
        formData,
        `/ticketing/${this.range.rKey}/addnote`
      );

      if (this.range.options.displayNote) {
        await this.range.refreshNotesAsync();
      }
      this.modal.closeModal();
      this.range.renderAsync();
    });
    titleWrapper.appendChild(titleInput);
    descWrapper.appendChild(descInput);
    colorDiv.appendChild(colorSpan);
    colorDiv.appendChild(colorInput);
    colorTimeWrapper.appendChild(colorDiv);
    colorTimeWrapper.appendChild(timeInput);
    btnWrapper.appendChild(submitBtn);
    btnWrapper.appendChild(cancelBtn);
    formWrapper.appendChild(colorTimeWrapper);
    formWrapper.appendChild(titleWrapper);
    formWrapper.appendChild(descWrapper);
    formWrapper.appendChild(btnWrapper);
    return formWrapper;
  }
  generateReminderForm(note?: INote): Node {
    let formWrapper = document.createElement("form");
    formWrapper.innerHTML = layout
    const reminderSubmit = formWrapper.querySelector("[data-reminder-submit]")
    let plusBtn = formWrapper.querySelector("[plus-row]")
    let formReminderWrapper = formWrapper.querySelector("[data-calendar-form-row-reminder]")
    plusBtn.addEventListener("click" , (e) =>{
      let rowContent = formWrapper.querySelector("[data-calendar-form-row-reminder-sample]")   
      let rowInside = document.createElement("div")
      let rowContentHtml = rowContent.outerHTML
      rowInside.innerHTML = rowContentHtml
      formReminderWrapper.appendChild(rowInside)
    })
    reminderSubmit.addEventListener("click" ,async (e) =>{
      e.preventDefault()
      let reminderObj = []
      let childs = formReminderWrapper.childNodes
      for(let i = 0 ; i < childs.length ; i++){
        if(childs[i].nodeName == "DIV"){
          let currentElement = childs[i] as HTMLElement
          let reminderNum = currentElement.querySelector("[data-calendar-reminder-input]")  as HTMLInputElement
          let reminderTimeType = currentElement.querySelector("[data-calendar-reminder-select]") as HTMLInputElement
          let reminderActionId = currentElement.querySelector("[data-calendar-reminder-action]") as HTMLInputElement
          reminderObj.push({"id":"0" , "num":`${reminderNum.value}`,"timetype":`${reminderTimeType.value}`,"actionID":`${reminderActionId.value}`})
        }
      }
      const form = new FormData();
      form.append("reminder", `${reminderObj}`);      
      const data = await this.range.sendAsyncData(
        form,
        `/ticketing/${this.range.rKey}/usernotes`
      );
    })
    
    return formWrapper;
  }
  
  generateNoteList(): HTMLElement {
    let listWrapper = document.createElement("div");
    listWrapper.setAttribute("data-calendar-note-list", "");
    let boxElement = document.createElement("div");
    const newBtn = document.createElement("div");
    newBtn.setAttribute("data-calendar-new-btn", "");
    newBtn.textContent = `ثبت یادداشت جدید`;
    newBtn.addEventListener("click", (e) => {
      boxElement.innerHTML = "";
      boxElement.appendChild(this.generateNoteForm());
      boxElement.classList.add("calendar-animated");
      boxElement.setAttribute("data-calendar-box-animated", "");
      boxElement.style.height = "0px";
      setTimeout(() => (boxElement.style.height = "260px"), 100);
    });
    var todayNote = this.range.getDayNotes(this.day.dateId);
    if (todayNote.length == 0) {
      let divElement = document.createElement("div");
      divElement.setAttribute("data-calendar-no-message", "");
      divElement.textContent = "یادداشتی ثبت نکرده اید.";
      listWrapper.appendChild(divElement);
    }
    todayNote.map((x) => {
      const editBtn = document.createElement("div");
      const reminderBtn = document.createElement("div");
      const delBtn = document.createElement("div");
      editBtn.setAttribute("data-calendar-event-btn", "");
      reminderBtn.setAttribute("data-calendar-event-btn", "");
      delBtn.setAttribute("data-calendar-event-btn", "");
      editBtn.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24">
        <title>edit</title>
        <path d="M11 3h-7c-0.828 0-1.58 0.337-2.121 0.879s-0.879 1.293-0.879 2.121v14c0 0.828 0.337 1.58 0.879 2.121s1.293 0.879 2.121 0.879h14c0.828 0 1.58-0.337 2.121-0.879s0.879-1.293 0.879-2.121v-7c0-0.552-0.448-1-1-1s-1 0.448-1 1v7c0 0.276-0.111 0.525-0.293 0.707s-0.431 0.293-0.707 0.293h-14c-0.276 0-0.525-0.111-0.707-0.293s-0.293-0.431-0.293-0.707v-14c0-0.276 0.111-0.525 0.293-0.707s0.431-0.293 0.707-0.293h7c0.552 0 1-0.448 1-1s-0.448-1-1-1zM17.793 1.793l-9.5 9.5c-0.122 0.121-0.217 0.28-0.263 0.465l-1 4c-0.039 0.15-0.042 0.318 0 0.485 0.134 0.536 0.677 0.862 1.213 0.728l4-1c0.167-0.041 0.33-0.129 0.465-0.263l9.5-9.5c0.609-0.609 0.914-1.41 0.914-2.207s-0.305-1.598-0.914-2.207-1.411-0.915-2.208-0.915-1.598 0.305-2.207 0.914zM19.207 3.207c0.219-0.219 0.504-0.328 0.793-0.328s0.574 0.109 0.793 0.328 0.328 0.504 0.328 0.793-0.109 0.574-0.328 0.793l-9.304 9.304-2.114 0.529 0.529-2.114z"></path>
        </svg>
        `;
      // reminderBtn.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24">
      //   <title>share-2</title>
      //   <path d="M16.214 18.098c0.025-0.033 0.048-0.067 0.070-0.104 0.020-0.035 0.038-0.071 0.054-0.107 0.073-0.108 0.156-0.209 0.248-0.301 0.363-0.363 0.861-0.586 1.414-0.586s1.051 0.223 1.414 0.586 0.586 0.861 0.586 1.414-0.223 1.051-0.586 1.414-0.861 0.586-1.414 0.586-1.051-0.223-1.414-0.586-0.586-0.861-0.586-1.414c0-0.325 0.077-0.631 0.214-0.902zM16.301 6.056c-0.009-0.017-0.018-0.034-0.028-0.051s-0.020-0.034-0.031-0.050c-0.154-0.283-0.242-0.608-0.242-0.955 0-0.553 0.223-1.051 0.586-1.414s0.861-0.586 1.414-0.586 1.051 0.223 1.414 0.586 0.586 0.861 0.586 1.414-0.223 1.051-0.586 1.414-0.861 0.586-1.414 0.586-1.051-0.223-1.414-0.586c-0.108-0.108-0.204-0.228-0.285-0.358zM7.699 10.944c0.009 0.017 0.018 0.034 0.028 0.051s0.020 0.034 0.031 0.050c0.154 0.283 0.242 0.608 0.242 0.955s-0.088 0.672-0.243 0.956c-0.011 0.016-0.021 0.033-0.031 0.050s-0.019 0.033-0.027 0.050c-0.081 0.13-0.177 0.25-0.285 0.358-0.363 0.363-0.861 0.586-1.414 0.586s-1.051-0.223-1.414-0.586-0.586-0.861-0.586-1.414 0.223-1.051 0.586-1.414 0.861-0.586 1.414-0.586 1.051 0.223 1.414 0.586c0.108 0.108 0.204 0.228 0.285 0.358zM14.15 6.088l-5.308 3.097c-0.004-0.005-0.009-0.009-0.014-0.014-0.722-0.722-1.724-1.171-2.828-1.171s-2.106 0.449-2.828 1.172-1.172 1.724-1.172 2.828 0.449 2.106 1.172 2.828 1.724 1.172 2.828 1.172 2.106-0.449 2.828-1.172c0.005-0.005 0.009-0.009 0.014-0.014l5.309 3.094c-0.098 0.347-0.151 0.714-0.151 1.092 0 1.104 0.449 2.106 1.172 2.828s1.724 1.172 2.828 1.172 2.106-0.449 2.828-1.172 1.172-1.724 1.172-2.828-0.449-2.106-1.172-2.828-1.724-1.172-2.828-1.172-2.106 0.449-2.828 1.172c-0.003 0.003-0.007 0.007-0.010 0.010l-5.312-3.095c0.098-0.346 0.15-0.71 0.15-1.087s-0.052-0.742-0.15-1.088l5.308-3.098c0.004 0.005 0.009 0.009 0.014 0.014 0.722 0.723 1.724 1.172 2.828 1.172s2.106-0.449 2.828-1.172 1.172-1.724 1.172-2.828-0.449-2.106-1.172-2.828-1.724-1.172-2.828-1.172-2.106 0.449-2.828 1.172-1.172 1.724-1.172 2.828c0 0.377 0.052 0.742 0.15 1.088z"></path>
      //   </svg>`;
       reminderBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f5f5f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell">
       <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
       </svg>`;
      delBtn.innerHTML = `<svg version="1.1"  width="15" height="15"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="533.333px" height="533.333px" viewBox="0 0 533.333 533.333" style="enable-background:new 0 0 533.333 533.333;"
        xml:space="preserve">
     <g>
       <path d="M100,533.333h333.333l33.333-366.667h-400L100,533.333z M333.334,66.667V0H200v66.667H33.333v100l33.333-33.333h400
         L500,166.667v-100H333.334z M300,66.667h-66.667V33.333H300V66.667z"/>
     </g>
     </svg>`;
      let divElement = document.createElement("div");
      let colorSpan = document.createElement("span");
      let textSpan = document.createElement("span");
      colorSpan.style.background = `#${x.color}`;
      textSpan.textContent = x.note;
      divElement.setAttribute("data-calendar-note-item", "");
      colorSpan.setAttribute("data-calendar-color-span", "");      
      reminderBtn.addEventListener("click", (e) => {
        boxElement.innerHTML = "";
        boxElement.classList.add("calendar-animated");
        boxElement.setAttribute("data-calendar-box-animated", "");
        boxElement.style.height = "0px";
        setTimeout(() => (boxElement.style.height = "260px"), 100);
        boxElement.appendChild(this.generateReminderForm(x));
      });
      editBtn.addEventListener("click", (e) => {
        boxElement.innerHTML = "";
        boxElement.classList.add("calendar-animated");
        boxElement.setAttribute("data-calendar-box-animated", "");
        boxElement.style.height = "0px";
        setTimeout(() => (boxElement.style.height = "260px"), 100);
        boxElement.appendChild(this.generateNoteForm(x));
      });
      delBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("userid", this.range.userId.toString());
        formData.append("ownerid", `0`);
        formData.append("usedforid", `${x.id}`);
        this.range.sendAsyncData(
          formData,
          `ticketing/${this.range.rKey}/removenote`
        );
        if (this.range.options.displayNote) {
          await this.range.refreshNotesAsync();
        }
        this.range.renderAsync();
      });
      reminderBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append("userid", this.range.userId.toString());
        formData.append("usedforid", `${x.id}`);
        formData.append("_root.reminder__1.id", `${x.id}`);
        formData.append("_root.reminder__1.num", `${x.id}`);
        formData.append("_root.reminder__1.timetype", `${x.id}`);
        formData.append("_root.reminder__1.actionID", `${x.id}`);
        this.range.sendAsyncData(
          formData,
          `ticketing/${this.range.rKey}/removenote`
        );
        if (this.range.options.displayNote) {
          await this.range.refreshNotesAsync();
        }
        this.range.renderAsync();
      });

      divElement.appendChild(colorSpan);
      divElement.appendChild(textSpan);
      divElement.appendChild(editBtn);
      divElement.appendChild(reminderBtn);
      divElement.appendChild(delBtn);
      listWrapper.appendChild(divElement);
    });
    boxElement.setAttribute("data-calendar-drop-down-view", "");
    listWrapper.appendChild(newBtn);
    listWrapper.insertBefore(boxElement, listWrapper.nextSibling);
    return listWrapper;
  }
}
