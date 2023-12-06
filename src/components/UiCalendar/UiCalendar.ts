import { DatePicker } from "./../DatePicker";
import { Day } from "../Day/Day";
import { Modal } from "../Modal/Modal";
import { DateRange } from "../calendar";
import { INote } from "../Interface/Interface";
import layout from "../UiCalendar/asset/shareForm.html";
import serviceShareLayout from "../UiCalendar/asset/shareFormForService.html";
import IWidget from "../../basiscore/BasisPanel/IWidget";
import newForm from "../UiCalendar/asset/layout.html";
import moreBox from "../UiCalendar/asset/more.html";
import reminderRow from "../UiCalendar/asset/reminderRow.html";
import moreShareBox from "../UiCalendar/asset/moreShare.html";
import reminderForm from "../UiCalendar/asset/reminderForm.html";
import reminderList from "../UiCalendar/asset/reminderList.html";
import reminderRowShare from "../UiCalendar/asset/reminderRowShare.html";
import { TimepickerUI } from "timepicker-ui";
import { OptionTypes } from "timepicker-ui";
import { ViewNote } from "./ViewNote";

declare const $bc: any;
export class UiCalendar {
  private viewNote: ViewNote;
  public modal: Modal;
  readonly range: DateRange;
  public readonly day: Day;
  private picker: DatePicker;
  constructor(owner: DateRange, day: Day) {
    this.day = day;
    this.range = owner;
    this.viewNote = new ViewNote(this);
    this.modal = new Modal(owner);
    if (this.range?.Owner?.dc?.isRegistered("widget")) {
      const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
      widgetName.title = this.range.options.labels["mainTitle"];
    }
  }
  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    if (hex) {
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
  }
  async createHolidayCategory(title) {
    const url = this.range.options.baseUrl["createholidaycategory"];

    // const body = {
    //   id: 0,
    //   typeid: 1,
    //   title,
    //   events: [{ id: 2, title: "a", dateids: this.picker.datesIds }],
    // };
    const body = {
      id: (
        document.querySelector(
          "[data-modal-select-category]"
        ) as HTMLSelectElement
      ).value,
      typeid: 1,
      title: (
        document.querySelector("[data-modal-title-input]") as HTMLInputElement
      ).value,
      events: [
        {
          id: "0",
          title: (
            document.querySelector(
              "[data-modal-title-input]"
            ) as HTMLInputElement
          ).value,
          dateids: this.picker.datesArray.map((e) =>
            this.range.dateUtil.getBasisDayId(e)
          ),
        },
      ],
    };

    const data = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const result = await data.json();
    if (result.message === "successful") {
      this.range.syncHolidayCategories();
    }
  }
  generateDaysUi(filters, holidays, categories): Node {
    let dayElement = document.createElement("div");
    let spanElement = document.createElement("span");
    let secondCulture = document.createElement("span");
    const dateWrapper = document.createElement("div");
    dayElement.setAttribute("data-calendar-day", "");
    dayElement.setAttribute("data-sys-inherit", "");
    secondCulture.setAttribute("data-calendar-second-day", "");
    dateWrapper.setAttribute("bc-calendar-date-wrppaer", "");
    secondCulture.textContent =
      this.range.options.culture === "fa"
        ? this.day.mcurrentDay.day + ""
        : this.day.currentDay.day + "";
    spanElement.textContent =
      this.range.options.culture === "fa"
        ? this.day.currentDay.day + ""
        : this.day.mcurrentDay.day + "";
    dayElement.setAttribute("data-id1", this.day.dateId.toString());
    dateWrapper.appendChild(spanElement);
    dateWrapper.appendChild(secondCulture);
    dayElement.appendChild(dateWrapper);
    if (this.day.isHoliday) {
      dayElement.setAttribute("data-calendar-holiday", "");
      dayElement.setAttribute("data-sys-button-delete-secondary", "");
    } else {
      dayElement.setAttribute("data-sys-text", "");
    }
    let ulElement = document.createElement("ul");
    let noteElement = document.createElement("div");
    var todayNote = this.range.getDayNotes(this.day.dateId);
    noteElement.setAttribute("data-calendar-note-lists", "");
    var displayNotes = this.range.options.displayNote;
    noteElement.appendChild(ulElement);
    console.log("this.day :>> ", this.day);
    if (holidays.length > 0) {
      const todaytHolidays = this.range.holidays.filter(
        (e) => e.dateID == this.day.dateId
      );
      console.log(
        "todaytHolidays,this.range.holidays :>> ",
        todaytHolidays,
        this.range.holidays
      );
      if (todaytHolidays.length > 0) {
        todaytHolidays.map((x) => {
          let liElement = document.createElement("li");
          liElement.textContent = x.eventName;
          const liIcon = document.createElement("div");
          liIcon.style.display = "flex";
          liIcon.style.alignItems = "center";
          liIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M6.3 9.8C6.3 9.4134 6.6134 9.1 7 9.1C7.3866 9.1 7.7 9.4134 7.7 9.8C7.7 10.1866 7.3866 10.5 7 10.5C6.6134 10.5 6.3 10.1866 6.3 9.8ZM6.3 4.2C6.3 3.8134 6.6134 3.5 7 3.5C7.3866 3.5 7.7 3.8134 7.7 4.2V7C7.7 7.3866 7.3866 7.7 7 7.7C6.6134 7.7 6.3 7.3866 6.3 7V4.2ZM6.993 0C3.129 0 0 3.136 0 7C0 10.864 3.129 14 6.993 14C10.864 14 14 10.864 14 7C14 3.136 10.864 0 6.993 0ZM7 12.6C3.906 12.6 1.4 10.094 1.4 7C1.4 3.906 3.906 1.4 7 1.4C10.094 1.4 12.6 3.906 12.6 7C12.6 10.094 10.094 12.6 7 12.6Z" fill="#B40020"/>
          </svg>`;
          liElement.style.borderRadius = "5px";
          liElement.style.background = "rgba(180, 0, 32, 0.20)";
          liElement.style.height = "26px";
          liElement.style.margin = "2px";
          liElement.style.display = "flex";
          liElement.style.lineHeight = "14px";
          liElement.style.justifyContent = "space-between";
          liElement.appendChild(liIcon);
          dayElement.style.background = `rgba(180, 0, 32, 0.05)`;
          dayElement.style.border = `0.5px solid #B40020`;
          dayElement.style.color = `#B40020`;
          ulElement.appendChild(liElement);
        });

        dayElement.appendChild(noteElement);
      }
    }
    if (displayNotes == true && todayNote != undefined) {
      if (todayNote.length > 3) {
        todayNote.map((x) => {
          if (filters.find((e) => e.id === x.catid)) {
            let liElement = document.createElement("li");
            // liElement.textContent = x.note;
            ulElement.setAttribute("data-calendar-more-note-parent", "");
            liElement.style.height = `100%`;
            liElement.setAttribute("data-calendar-more-note", "");

            const color: object =
              this.hexToRgb(`${x.color}`) ||
              this.hexToRgb(categories.find((i) => i.id === x.catid)?.color) ||
              null;
            if (color) {
              liElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
              liElement.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
            } else {
              liElement.style.background = `#999999`;
              liElement.style.color = `#fff`;
            }

            ulElement.appendChild(liElement);
          } else {
            let liElement = document.createElement("li");
            liElement.style.height = `100%`;
            // liElement.textContent = x.note;
            ulElement.setAttribute("data-calendar-more-note-parent", "");
            liElement.setAttribute("data-calendar-more-note", "");
            const color: object =
              this.hexToRgb(`${x.color}`) ||
              this.hexToRgb(categories.find((i) => i.id === x.catid)?.color) ||
              null;
            if (color) {
              liElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.05)`;
              liElement.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},0.05)`;
            } else {
              liElement.style.background = `#999`;
              liElement.style.color = `#fff`;
            }

            ulElement.appendChild(liElement);
          }
        });
      } else {
        todayNote.map((x) => {
          if (filters.find((e) => e.id === x.catid)) {
            let liElement = document.createElement("li");
            liElement.style.height = `100%`;

            liElement.textContent = filters.find((e) => e.id === x.catid).title;
            const color: object =
              this.hexToRgb(`${x.color}`) ||
              this.hexToRgb(categories.find((i) => i.id === x.catid)?.color) ||
              null;
            if (color) {
              liElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.6)`;
              liElement.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
            } else {
              liElement.style.background = `#999999`;
              liElement.style.color = `#fff`;
            }
            ulElement.appendChild(liElement);
          } else {
            let liElement = document.createElement("li");
            liElement.style.height = `100%`;

            liElement.textContent = x.note;
            const color: object =
              this.hexToRgb(`${x.color}`) ||
              this.hexToRgb(categories.find((i) => i.id === x.catid)?.color) ||
              null;
            if (color) {
              liElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.2)`;
              liElement.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},0.5)`;
            } else {
              liElement.style.background = `#ccc`;
              liElement.style.color = `#fff`;
            }
            ulElement.appendChild(liElement);
          }
        });
      }

      dayElement.appendChild(noteElement);
    }

    if (this.day.isToday == true) {
      dayElement.setAttribute("data-today", "");
    }
    dayElement.addEventListener("click", (e) => {
      if (this.range?.Owner?.dc?.isRegistered("widget")) {
        const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
        widgetName.title = this.range.options.labels["list"];
      }
      let modalInside = this.generateNoteList();
      this.modal.openModal(modalInside);
    });
    return dayElement;
  }
  generatePersonalHolidayForm(): HTMLElement {
    const datePickerModal = document.createElement("div");

    const container = document.createElement("div");
    datePickerModal.setAttribute("data-calendar-modal-picker", "");

    datePickerModal.appendChild(container);
    this.picker = new DatePicker(
      this.range.from,
      this.range.to,
      {
        dateProvider: "basisCalendar",
        isModalPicker: true,
        culture: this.range.options.culture,
        lid: this.range.options.lid,
        yearsList: true,
        monthList: true,
        pickerType: "multiple",
        theme: "basic",
        isFilter: true,
        mode: "desktop",
        style: "../css/datepicker-style.css",
      },
      this.range
    );
    this.picker.createUIAsync(container);
    const formContainer = document.createElement("div");

    const modalHeader = document.createElement("div");
    const modalBody = document.createElement("div");
    const modalFooter = document.createElement("div");
    const modalTitle = document.createElement("div");
    const submitBtn = document.createElement("button");
    const deviderLine = document.createElement("div");
    const cancelBtn = document.createElement("div");
    const categoriesRow = document.createElement("div");
    const firstInputRow = document.createElement("div");
    const secondInputRow = document.createElement("div");
    const categoriesOptionsTitle = document.createElement("div");
    const subCategoriesOptionsTitle = document.createElement("div");
    const firstInputTitle = document.createElement("div");
    const secondInputTitle = document.createElement("div");
    const categoriesOptions = document.createElement("select");
    const firstInput = document.createElement("input");
    const secondInput = document.createElement("input");
    deviderLine.setAttribute("data-calendar-footer-devider", "");
    modalFooter.setAttribute("data-modal-footer-container", "");
    modalFooter.appendChild(submitBtn);
    modalFooter.appendChild(cancelBtn);
    categoriesOptions.setAttribute("data-modal-input-element", "");
    categoriesOptions.setAttribute("data-modal-select-category", "");
    firstInput.setAttribute("data-modal-input-element", "");
    firstInput.setAttribute("data-modal-title-input", "");
    secondInput.setAttribute("data-modal-input-element", "");
    secondInput.setAttribute("data-modal-input-dates", "");
    secondInput.setAttribute("data-modal-calendar-icon", "");
    categoriesOptions.innerHTML = [
      { id: 0, title: "جدید" },
      ...this.range.holidayCategories,
    ]
      .map((e) => `<option value='${e.id}'>${e.title}</option>`)
      .join("");
    categoriesOptions.value = "0";
    secondInput.disabled = true;
    const inputIcon = document.createElement("div");
    inputIcon.setAttribute("data-modal-input-icon", "");
    inputIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.9987 16.6693C6.856 16.6693 5.28465 16.6693 4.30834 15.693C3.33203 14.7166 3.33203 13.1453 3.33203 10.0026C3.33203 6.85991 3.33203 5.28856 4.30834 4.31225C5.28465 3.33594 6.856 3.33594 9.9987 3.33594C13.1414 3.33594 14.7127 3.33594 15.6891 4.31225C16.6654 5.28856 16.6654 6.85991 16.6654 10.0026C16.6654 13.1453 16.6654 14.7166 15.6891 15.693C14.7127 16.6693 13.1414 16.6693 9.9987 16.6693ZM9.9987 7.16927C9.58448 7.16927 9.2487 7.50506 9.2487 7.91927C9.2487 8.19541 9.02484 8.41927 8.7487 8.41927C8.47256 8.41927 8.2487 8.19541 8.2487 7.91927C8.2487 6.95277 9.0322 6.16927 9.9987 6.16927C10.9652 6.16927 11.7487 6.95277 11.7487 7.91927C11.7487 8.39316 11.5597 8.82392 11.254 9.13858C11.1925 9.2019 11.1338 9.26052 11.0778 9.31644C10.934 9.46021 10.8079 9.58616 10.6973 9.72827C10.5513 9.91589 10.4987 10.0538 10.4987 10.1693V10.6693C10.4987 10.9454 10.2748 11.1693 9.9987 11.1693C9.72256 11.1693 9.4987 10.9454 9.4987 10.6693V10.1693C9.4987 9.73248 9.70204 9.3789 9.90814 9.11408C10.0606 8.91813 10.2523 8.72683 10.4079 8.57158C10.4548 8.52475 10.4984 8.48119 10.5367 8.44179C10.6684 8.30623 10.7487 8.12263 10.7487 7.91927C10.7487 7.50506 10.4129 7.16927 9.9987 7.16927ZM9.9987 13.3359C10.3669 13.3359 10.6654 13.0375 10.6654 12.6693C10.6654 12.3011 10.3669 12.0026 9.9987 12.0026C9.63051 12.0026 9.33203 12.3011 9.33203 12.6693C9.33203 13.0375 9.63051 13.3359 9.9987 13.3359Z" fill="#004B85"/>
  </svg>`;
    categoriesOptionsTitle.setAttribute("data-modal-input-title", "");
    subCategoriesOptionsTitle.setAttribute("data-modal-input-title", "");
    firstInputTitle.setAttribute("data-modal-input-title", "");
    secondInputTitle.setAttribute("data-modal-input-title", "");
    categoriesOptionsTitle.innerHTML = `نوع ${inputIcon.outerHTML}`;
    subCategoriesOptionsTitle.innerHTML = `دسته ${inputIcon.outerHTML}`;
    firstInputTitle.innerHTML = `عنوان ${inputIcon.outerHTML}`;
    secondInputTitle.innerHTML = `بازه زمانی ${inputIcon.outerHTML}`;
    modalTitle.setAttribute("data-calendar-modal-title", "");
    categoriesRow.setAttribute("data-calendar-modal-row", "");
    firstInputRow.setAttribute("data-calendar-modal-row", "");
    secondInputRow.setAttribute("data-calendar-modal-row", "");
    categoriesRow.appendChild(categoriesOptionsTitle);
    categoriesRow.appendChild(categoriesOptions);
    firstInputRow.appendChild(firstInputTitle);
    secondInputRow.appendChild(secondInputTitle);
    firstInputRow.appendChild(firstInput);
    secondInputRow.appendChild(secondInput);
    modalTitle.innerText = "شخصی سازی تعطیلات";
    const closeBtn = document.createElement("div");
    modalHeader.setAttribute("data-calendar-modal-header", "");
    modalBody.setAttribute("data-calendar-modal-body", "");
    closeBtn.setAttribute("data-calendar-close-btn", "");
    closeBtn.innerHTML = `<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path data-sys-text="" opacity="0.8" d="M8.05223 7.49989L13.3519 13.3409C13.6968 13.7208 13.6968 14.3351 13.3519 14.7151C13.0072 15.095 12.4498 15.095 12.1051 14.7151L6.80521 8.87405L1.50552 14.7151C1.16063 15.095 0.603404 15.095 0.258671 14.7151C-0.0862237 14.3351 -0.0862237 13.7208 0.258671 13.3409L5.55836 7.49989L0.258671 1.65889C-0.0862237 1.27896 -0.0862237 0.66466 0.258671 0.284728C0.430473 0.0952063 0.656366 0 0.882097 0C1.10783 0 1.33356 0.0952063 1.50552 0.284728L6.80521 6.12572L12.1051 0.284728C12.277 0.0952063 12.5028 0 12.7285 0C12.9542 0 13.18 0.0952063 13.3519 0.284728C13.6968 0.66466 13.6968 1.27896 13.3519 1.65889L8.05223 7.49989Z" fill="black"/>
    </svg>
    `;

    closeBtn.addEventListener("click", (e) => {
      this.modal.closeModal();
    });
    submitBtn.innerText = "ثبت";
    submitBtn.setAttribute("new-form-submit-button", "");
    submitBtn.addEventListener("click", async () => {
      await this.createHolidayCategory(firstInput.value);
    });
    cancelBtn.innerText = "انصراف";
    cancelBtn.setAttribute("new-form-cancel-buttons", "");
    cancelBtn.addEventListener("click", () => {
      this.modal.closeModal();
    });
    modalHeader.appendChild(closeBtn);
    modalHeader.appendChild(modalTitle);
    modalBody.append(categoriesRow);
    modalBody.append(firstInputRow);
    modalBody.append(secondInputRow);
    modalBody.append(datePickerModal);
    formContainer.appendChild(modalHeader);
    formContainer.appendChild(modalBody);
    formContainer.appendChild(deviderLine);
    formContainer.appendChild(modalFooter);
    return formContainer;
  }
  generateNoteForm(note?: INote, creator?: number): HTMLElement {
    const editCodeWrapper: HTMLElement = document.createElement("div");

    editCodeWrapper.innerHTML = newForm;
    editCodeWrapper
      .querySelector("[data-calendar-title-input]")
      .setAttribute("placeholder", this.range.options.labels.titrTitle);
    editCodeWrapper
      .querySelector("[data-calendar-description-textarea]")
      .setAttribute("placeholder", this.range.options.labels.noteTitle);
    editCodeWrapper
      .querySelector("[bc-calendar-time]")
      .setAttribute("placeholder", this.range.options.labels.timeTitle);
    // editCodeWrapper.querySelector("[bc-calendar-drop-down-btn]").innerHTML=this.range.options.labels.categoryTitle
    editCodeWrapper.querySelector("[new-form-submit-button]").innerHTML =
      this.range.options.labels.submitKeyTitle;
    let titleInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[data-calendar-title-input]"
    );

    let descInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[data-calendar-description-textarea]"
    );
    let timeInput: HTMLInputElement =
      editCodeWrapper.querySelector("[bc-calendar-time]");
    let catidInput: HTMLInputElement = editCodeWrapper.querySelector(
      "[bc-calendar-dropdown-id]"
    );
    let submitBtn = editCodeWrapper.querySelector("[new-form-submit-button]");

    let cancelBtn = document.createElement("button");
    const catsList = editCodeWrapper.querySelector("[data-bc-select-category]");
    if (this.range.categories.length == 0) {
      catsList.setAttribute("disabled", "true");
      const errDiv = document.createElement("din");
      errDiv.textContent = this.range.options.labels.noCategoryError;
      errDiv.classList.add("calendar-category-new");
      catsList.parentElement.after(errDiv);
    }
    this.range.categories.forEach((e) => {
      const catLi = document.createElement("option");
      catLi.textContent = e.title;
      catLi.setAttribute("value", e.id.toString());
      catsList.appendChild(catLi);
    });

    cancelBtn.textContent = "لغو";
    if (note) {
      titleInput.value = note.note;
      descInput.value = note.description;
      timeInput.value = note.time;
      catidInput.value = note.catid?.toString();
      // const catsLi = editCodeWrapper.querySelectorAll("li")
      // const catsText = editCodeWrapper.querySelector("[bc-calendar-drop-down-btn]")
      // catsLi.forEach((e) => {
      //   if(parseInt(e.getAttribute("data-id")) == note.catid){
      //     catsText.textContent = e.innerText
      //   }
      // })
    }
    const catId = editCodeWrapper.querySelector(
      "[bc-calendar-dropdown-id]"
    ) as HTMLInputElement;
    submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const newNoteObj = {
        dateid: this.day.dateId.toString(),
        noteid: note.id.toString(),
        time: timeInput.value ? timeInput.value : "00:00",
        note: titleInput.value ? titleInput.value : "",
        description: descInput.value ? descInput.value : "",
        catid: catId.value ? catId.value : "",
      };

      let apiLink = this.range.options.baseUrl["addnote"];
      this.range.sendAsyncDataPostJson(newNoteObj, apiLink);
      if (this.range.options.displayNote) {
        await this.range.refreshNotesAsync();
      }
      this.range.runAsync();
      this.modal.closeModal();
    });

    if (creator == 1) {
      const dropDowns = editCodeWrapper.querySelectorAll(
        "[bc-calendar-drop-down]"
      );
      dropDowns.forEach((el) => {
        const dropDownBtn = el.querySelector("[bc-calendar-drop-down-btn]");
        const liItems = el.querySelectorAll("li");

        liItems.forEach((LIelement) => {
          LIelement.addEventListener("click", function (element) {
            const dropdownValue = el.querySelector(
              "[bc-calendar-dropdown-id]"
            ) as HTMLInputElement;
            dropdownValue.value = this.getAttribute("data-id");
            const liText = element.target as HTMLElement;
            dropDownBtn.textContent = liText.innerText;
          });
        });
        el.addEventListener("click", function (element) {
          dropDownBtn.nextElementSibling.classList.toggle("open_drop_down");
        });
      });
    }
    if (creator == 0) {
      editCodeWrapper
        .querySelector("[new-form-submit-cancel-buttons]")
        .remove();
      const readonlyInputs = editCodeWrapper.querySelectorAll("input,textarea");
      readonlyInputs.forEach((e) => {
        e.setAttribute("readonly", "true");
      });
    }
    return editCodeWrapper;
  }

  generateShareForm(note?: INote): Node {
    let formWrapper = document.createElement("form");
    formWrapper.innerHTML = layout;
    formWrapper
      .querySelector("[data-calendar-share-input]")
      .setAttribute("placeholder", this.range.options.labels.shareTextTitle);
    formWrapper
      .querySelector("[data-reminder-submit]")
      .setAttribute("placeholder", this.range.options.labels.submitKeyTitle);
    const submitShareForm = formWrapper.querySelector("[data-reminder-submit]");
    const sharingInputUniqe = formWrapper.querySelector(
      "#data-calendar-share-input-uniqe"
    ) as HTMLInputElement;
    sharingInputUniqe.addEventListener("keyup", (e) => {
      if (
        sharingInputUniqe.value != "" &&
        sharingInputUniqe.value != undefined
      ) {
        submitShareForm.removeAttribute("data-bc-calendar-disable-button");
      } else {
        submitShareForm.setAttribute("data-bc-calendar-disable-button", "");
      }
    });
    return formWrapper;
  }
  async initReciverData(id: number, formWrapper: HTMLElement) {
    const reciverData = await this.range.sendAsyncDataGetMethod(
      this.range.options.baseUrl["reciver"].replace("${catid}", id)
    );
    if (reciverData.length == 0) {
      const errors = formWrapper.querySelectorAll(
        "[data-calendar-tooltip-flag]"
      );
      errors.forEach((ee) => {
        ee.remove();
      });
      const error = document.createElement("div");
      error.setAttribute("data-calendar-tooltip-flag", "");
      error.setAttribute("data-sys-message-danger", "");
      error.setAttribute("data-sys-message-danger-fade-in", "");
      error.setAttribute("style", "display: block");
      error.innerHTML = `
         <span>
         <i class="lni lni-close"></i>
         ${this.range.options.labels.noGrouoForReciver}
        
         </span> `;

      formWrapper.querySelector("#errors").appendChild(error);
      setTimeout(function () {
        error.setAttribute("data-sys-message-danger-fade-out", "");
      }, 3000);
      formWrapper
        .querySelector("[bc-calendar-drop-down-reciver-title]")
        .setAttribute("bc-calendar-drop-down-reciver-deactive", "");
    } else {
      formWrapper
        .querySelector("[bc-calendar-drop-down-reciver-title]")
        .removeAttribute("bc-calendar-drop-down-reciver-deactive");
    }
    const reciverUl = formWrapper.querySelector("#reciver");
    reciverUl.innerHTML = "";
    reciverData.forEach((element) => {
      const reciverLi: HTMLElement = document.createElement("li");
      reciverLi.addEventListener("click", (e) => {
        formWrapper
          .querySelector("[data-calendar-submit]")
          .removeAttribute("data-bc-calendar-disable-button");
        const dropdownValue = formWrapper.querySelector(
          "[bc-calendar-dropdown-reciver]"
        ) as HTMLInputElement;
        dropdownValue.value = element.id;
        // formWrapper.querySelector("[data-calendar-submit]").removeAttribute("disabled")
        formWrapper.querySelector(
          "[bc-calendar-drop-down-reciver-title]"
        ).textContent = element.title;
      });
      reciverLi.textContent = element.title;
      reciverUl.appendChild(reciverLi);
    });
  }
  async generateShareFormForService(note?: INote): Promise<Node> {
    const senderData = await this.range.sendAsyncDataGetMethod(
      this.range.options.baseUrl["sender"]
    );
    let formWrapper = document.createElement("form");
    formWrapper.innerHTML = serviceShareLayout;
    const senderUl = formWrapper.querySelector("#sender");
    senderUl.innerHTML = "";
    senderData.forEach((element) => {
      const senderLi: HTMLElement = document.createElement("li");
      senderLi.addEventListener("click", (e) => {
        const dropdownValue = formWrapper.querySelector(
          "[bc-calendar-dropdown-sender]"
        ) as HTMLInputElement;
        dropdownValue.value = element.id;
        this.initReciverData(element.id, formWrapper);
        formWrapper.querySelector(
          "[bc-calendar-drop-down-sender-title]"
        ).textContent = element.title;
      });
      senderLi.textContent = element.title;
      senderUl.appendChild(senderLi);
    });

    const dropDownBtns = formWrapper.querySelectorAll(
      "[bc-calendar-drop-down-btn]"
    );
    dropDownBtns.forEach((el) => {
      el.addEventListener("click", (e) => {
        const openDropDowns = document.querySelectorAll(".open_drop_down");
        openDropDowns.forEach((item) => {
          item.classList.remove("open_drop_down");
        });
        el.nextElementSibling.classList.add("open_drop_down");
      });
    });

    return formWrapper;
  }
  generateReminderRow(body: HTMLElement) {
    body.querySelector("[data-bc-new-row-reminder]").innerHTML = "";
    body.querySelector("[data-bc-new-row-reminder]").innerHTML = reminderRow;
    let remindeRowBody = body.querySelector("[data-bc-new-row-reminder]");
    remindeRowBody
      .querySelector("[data-calendar-time-value]")
      .setAttribute("placeHolder", this.range.options.labels.reminderCount);
    remindeRowBody.querySelector("[tab-button-status-email]").textContent =
      this.range.options.labels.email;
    remindeRowBody.querySelector("[tab-button-status-mobile]").textContent =
      this.range.options.labels.sms;

    let timeUnitSelect = remindeRowBody.querySelector("[data-bc-select-time]");
    let timeUnitSelectOption = timeUnitSelect.querySelectorAll("option");
    timeUnitSelectOption.forEach((e, i) => {
      timeUnitSelectOption[0].textContent = this.range.options.labels.day;
      timeUnitSelectOption[1].textContent = this.range.options.labels.hour;
      timeUnitSelectOption[2].textContent = this.range.options.labels.minute;
    });

    let sharingSelect = remindeRowBody.querySelector(
      "[data-bc-select-service-reminder]"
    );
    let sharingSelectOption = sharingSelect.querySelectorAll("option");
    sharingSelectOption.forEach((e, i) => {
      let thisOptin = e as HTMLElement;
      if (i == 0) {
        thisOptin.textContent = this.range.options.labels.forme;
      } else if (i == 1) {
        thisOptin.textContent = this.range.options.labels.forall;
      }
    });
    const switchButtons = body.querySelectorAll("[bc-calendar-change-button]");
    switchButtons.forEach((x) => {
      x.addEventListener("click", function (e) {
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
        const tab = container.querySelector(".tabActive") as HTMLElement;
        tab.style.transform = `translateX(-${left}00%)`;
        const actionidInput = body.querySelector(
          "[bc-calendar-action-id]"
        ) as HTMLInputElement;
        actionidInput.value = this.getAttribute("data-id");
      });
    });

    let inputNewWrapper = body.querySelector(
      "[data-bc-new-row-reminder]"
    ) as HTMLElement;
    let inputNew = inputNewWrapper.querySelector(
      "[data-calendar-time-value]"
    ) as HTMLInputElement;
    inputNew.addEventListener("keyup", (e) => {
      if (inputNew.value != "" && inputNew.value != undefined) {
        body
          .querySelector("[data-reminder-submit]")
          .removeAttribute("data-bc-calendar-disable-button");
      } else {
        body
          .querySelector("[data-reminder-submit]")
          .setAttribute("data-bc-calendar-disable-button", "");
      }
    });
  }
  generateReminderForm(creator: number): Node {
    let formWrapper = document.createElement("form");
    if (creator == 0) {
      formWrapper.innerHTML = reminderForm;
      formWrapper.querySelector("[data-bc-new-row-reminder]").innerHTML =
        reminderRowShare;
      let bodyRowNumberShare = formWrapper.querySelector(
        "[data-bc-new-row-reminder]"
      );
      bodyRowNumberShare
        .querySelector("[data-calendar-time-value]")
        .setAttribute("placeHolder", this.range.options.labels.reminderCount);
      bodyRowNumberShare.querySelector(
        "[tab-button-status-email]"
      ).textContent = this.range.options.labels.email;
      bodyRowNumberShare.querySelector(
        "[tab-button-status-mobile]"
      ).textContent = this.range.options.labels.sms;
      let timeUnitSelect = bodyRowNumberShare.querySelector(
        "[data-bc-select-time]"
      );
      let timeUnitSelectOption = timeUnitSelect.querySelectorAll("option");
      timeUnitSelectOption.forEach((e, i) => {
        timeUnitSelectOption[0].textContent = this.range.options.labels.day;
        timeUnitSelectOption[1].textContent = this.range.options.labels.hour;
        timeUnitSelectOption[2].textContent = this.range.options.labels.minute;
      });
      //tonight
    } else {
      formWrapper.innerHTML = reminderForm;
      formWrapper.querySelector("[data-bc-new-row-reminder]").innerHTML =
        reminderRow;
      let bodyRowNumberShare = formWrapper.querySelector(
        "[data-bc-new-row-reminder]"
      );
      bodyRowNumberShare
        .querySelector("[data-calendar-time-value]")
        .setAttribute("placeHolder", this.range.options.labels.reminderCount);
      bodyRowNumberShare.querySelector(
        "[tab-button-status-email]"
      ).textContent = this.range.options.labels.email;
      bodyRowNumberShare.querySelector(
        "[tab-button-status-mobile]"
      ).textContent = this.range.options.labels.sms;
      let timeUnitSelect = bodyRowNumberShare.querySelector(
        "[data-bc-select-time]"
      );
      let timeUnitSelectOption = timeUnitSelect.querySelectorAll("option");
      timeUnitSelectOption.forEach((e, i) => {
        timeUnitSelectOption[0].textContent = this.range.options.labels.day;
        timeUnitSelectOption[1].textContent = this.range.options.labels.hour;
        timeUnitSelectOption[2].textContent = this.range.options.labels.minute;
      });
    }
    // const reminderSelects = formWrapper.querySelectorAll("[data-bc-calendar-select]")
    // let inputNewWrapper = formWrapper.querySelector("[data-bc-new-row-reminder]") as HTMLElement
    // let inputNew = inputNewWrapper.querySelector("[data-calendar-time-value]") as HTMLInputElement
    // inputNew.addEventListener("keyup",e => {
    //    if(inputNew.value != "" && inputNew.value != undefined){
    //   formWrapper.querySelector("[data-reminder-submit]").removeAttribute("data-bc-calendar-disable-button")
    //    }
    //    else{
    //     formWrapper.querySelector("[data-reminder-submit]").setAttribute("data-bc-calendar-disable-button","")
    //    }
    // })
    let sharingSelect = formWrapper.querySelector(
      "[data-bc-select-service-reminder]"
    );
    let sharingSelectOption = sharingSelect.querySelectorAll("option");
    sharingSelectOption.forEach((e, i) => {
      let thisOptin = e as HTMLElement;
      if (i == 0) {
        thisOptin.textContent = this.range.options.labels.forme;
      } else if (i == 1) {
        thisOptin.textContent = this.range.options.labels.forall;
      }
    });

    formWrapper.querySelector("#reminder-title").textContent =
      this.range.options.labels.reminderTitle;
    let unitId = 1;
    return formWrapper;
  }
  async createReminderList(id: number, body: HTMLElement) {
    const obj = {
      noteid: id,
      creatoruser: this.range.userId,
    };
    const viewNote = await this.range.sendAsyncDataPostJson(
      obj,
      this.range.options.baseUrl["viewnote"]
    );
    body.querySelector("[data-calendar-reminder-note-wrapper]").innerHTML = "";
    const reminderArray = viewNote[0]?.reminder
      ? viewNote[0]?.reminder
      : viewNote[0]?.reminders;
    if (reminderArray.length > 0) {
      reminderArray.forEach((reminderItem) => {
        const reminderItemDiv = document.createElement("div");
        reminderItemDiv.setAttribute("data-bc-reminder-row", "");
        reminderItemDiv.innerHTML = reminderList;
        let actionidVal = reminderItem.actionID;
        let timetypeVal = reminderItem.timetype;
        if (this.range.options.level == "user") {
          timetypeVal = reminderItem.timeunitid;
          actionidVal = reminderItem.actionid;
        }

        reminderItemDiv
          .querySelector("[data-calendar-time-value]")
          .setAttribute("placeHolder", this.range.options.labels.reminderCount);
        reminderItemDiv.querySelector("[tab-button-status-email]").textContent =
          this.range.options.labels.email;
        reminderItemDiv.querySelector(
          "[tab-button-status-mobile]"
        ).textContent = this.range.options.labels.sms;
        let timeUnitSelect = reminderItemDiv.querySelector(
          "[data-bc-select-time]"
        );
        let timeUnitSelectOption = timeUnitSelect.querySelectorAll("option");
        timeUnitSelectOption.forEach((e, i) => {
          timeUnitSelectOption[0].textContent = this.range.options.labels.day;
          timeUnitSelectOption[1].textContent = this.range.options.labels.hour;
          timeUnitSelectOption[2].textContent =
            this.range.options.labels.minute;
        });

        let sharingSelect = reminderItemDiv.querySelector(
          "[data-bc-select-service-reminder]"
        );
        let sharingSelectOption = sharingSelect.querySelectorAll("option");
        sharingSelectOption.forEach((e, i) => {
          let thisOptin = e as HTMLElement;
          if (i == 0) {
            thisOptin.textContent = this.range.options.labels.forme;
          } else if (i == 1) {
            thisOptin.textContent = this.range.options.labels.forall;
          }
        });
        const timeType: HTMLInputElement = reminderItemDiv.querySelector(
          "[data-bc-select-time]"
        ) as HTMLInputElement;
        const typeidValue: HTMLInputElement = reminderItemDiv.querySelector(
          "[data-bc-select-user-share]"
        ) as HTMLInputElement;
        const timeInput: HTMLInputElement = reminderItemDiv.querySelector(
          "[data-calendar-time-value]"
        ) as HTMLInputElement;
        const deleteRoW = reminderItemDiv.querySelector(
          "[data-calendar-remove-sharing]"
        ) as HTMLElement;
        timeType.value = timetypeVal;
        typeidValue.value = reminderItem.typeid ? reminderItem.typeid : 1;
        timeInput.value = reminderItem.value;
        if (actionidVal == 2) {
          reminderItemDiv
            .querySelector("[tab-button-status-mobile]")
            .setAttribute("tab-button-status", "active");
          reminderItemDiv
            .querySelector("[tab-button-status-email]")
            .removeAttribute("tab-button-status");
          const tab = reminderItemDiv.querySelector(
            ".tabActive"
          ) as HTMLElement;
          tab.style.transform = `translateX(-100%)`;
        }

        deleteRoW.addEventListener("click", async (element) => {
          const reciverData = await this.range.sendAsyncDataGetMethod(
            this.range.options.baseUrl["removeReminder"].replace(
              "${usedforid}",
              reminderItem.id
            )
          );
          if (reciverData.errorid == 4) {
            const currentTarget = element.target as HTMLElement;
            const currentTargetParent = currentTarget.closest(
              "[data-calendar-remove-sharing]"
            ) as HTMLElement;
            const currentTarget2Parent = currentTargetParent.closest(
              "[data-bc-reminder-row]"
            );
            currentTarget2Parent.remove();
          }
        });
        body
          .querySelector("[ data-calendar-reminder-note-wrapper]")
          .appendChild(reminderItemDiv);
      });
    }
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
    currentDate.setAttribute("data-sys-text", "");
    newBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
    <path d="M0 5C0 2.23858 2.23858 0 5 0H30C32.7614 0 35 2.23858 35 5V30C35 32.7614 32.7614 35 30 35H5C2.23858 35 0 32.7614 0 30V5Z" fill="#004B85" fill-opacity="0.05"/>
    <path d="M18.4 11H15.6V16.6H10V19.4H15.6V25H18.4V19.4H24V16.6H18.4V11Z" fill="#004B85"/>
    </svg>
    `;
    closeBtn.innerHTML = `<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path data-sys-text="" opacity="0.8" d="M8.05223 7.49989L13.3519 13.3409C13.6968 13.7208 13.6968 14.3351 13.3519 14.7151C13.0072 15.095 12.4498 15.095 12.1051 14.7151L6.80521 8.87405L1.50552 14.7151C1.16063 15.095 0.603404 15.095 0.258671 14.7151C-0.0862237 14.3351 -0.0862237 13.7208 0.258671 13.3409L5.55836 7.49989L0.258671 1.65889C-0.0862237 1.27896 -0.0862237 0.66466 0.258671 0.284728C0.430473 0.0952063 0.656366 0 0.882097 0C1.10783 0 1.33356 0.0952063 1.50552 0.284728L6.80521 6.12572L12.1051 0.284728C12.277 0.0952063 12.5028 0 12.7285 0C12.9542 0 13.18 0.0952063 13.3519 0.284728C13.6968 0.66466 13.6968 1.27896 13.3519 1.65889L8.05223 7.49989Z" fill="black"/>
    </svg>
    `;

    closeBtn.addEventListener("click", (e) => {
      this.modal.closeModal();
    });
    currentDate.innerHTML = `<span>${
      this.range.options.culture === "fa"
        ? this.day.currentDay.day
        : this.day.mcurrentDay.day
    }</span> <span>${this.day.month.monthName}</span> <span>${
      this.day.month.currentYear
    }</span>`;
    modalBtns.appendChild(closeBtn);
    modalBtns.appendChild(newBtn);
    modalHeader.appendChild(modalBtns);
    modalHeader.appendChild(currentDate);

    newBtn.addEventListener("click", async (e) => {
      await this.range.getCategories();
      if (this.range?.Owner?.dc?.isRegistered("widget")) {
        const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
        widgetName.title = this.range.options.labels["new"];
      }
      const newBox: Element = document.createElement("div");
      modalBody.innerHTML = "";
      newBox.innerHTML = newForm;
      const timeInputt: HTMLElement = newBox.querySelector(
        "[bc-calendar-time-input]"
      );
      const datePickerOptions: OptionTypes = {
        editable: true,
        okLabel: this.range.options.labels.submitKeyTitle,
        cancelLabel: this.range.options.labels.cancelKeyTitle,
        amLabel: this.range.options.labels.amLabel,
        pmLabel: this.range.options.labels.pmLabel,
        clockType: "24h",
        timeLabel: "",
        delayHandler: 10,
      };
      const newTimepicker = new TimepickerUI(timeInputt, datePickerOptions);
      const modalParent: HTMLElement = modalBody.closest("[data-modal-form]");
      const timeInputIcon: HTMLElement =
        newBox.querySelector("[new-note-clock]");
      timeInputIcon.addEventListener("click", (timeElement) => {
        modalParent.style.display = "none";
        newTimepicker.open();
      });
      timeInputt.addEventListener("click", (timeElement) => {
        modalParent.style.display = "none";
        newTimepicker.open();
      });
      timeInputt.addEventListener("accept", (event) => {
        setTimeout((timeoute) => {
          modalParent.style.display = "block";
        }, 300);
      });
      timeInputt.addEventListener("cancel", (event) => {
        setTimeout((timeoute) => {
          modalParent.style.display = "block";
        }, 300);
      });

      newBox
        .querySelector("[data-calendar-title-input]")
        .setAttribute("placeholder", this.range.options.labels.titrTitle);
      newBox
        .querySelector("[data-calendar-description-textarea]")
        .setAttribute("placeholder", this.range.options.labels.noteTitle);
      newBox
        .querySelector("[bc-calendar-time]")
        .setAttribute("placeholder", this.range.options.labels.timeTitle);
      newBox.querySelector("[new-form-submit-button]").innerHTML =
        this.range.options.labels.submitKeyTitle;
      const catsList = newBox.querySelector("[data-bc-select-category]");
      if (this.range.categories.length == 0) {
        catsList.setAttribute("disabled", "true");
        const errDiv = document.createElement("din");
        errDiv.textContent = this.range.options.labels.noCategoryError;
        errDiv.classList.add("calendar-category-new");
        catsList.parentElement.after(errDiv);
      }
      this.range.categories.forEach((e) => {
        const catLi = document.createElement("option");
        catLi.textContent = e.title;
        catLi.setAttribute("value", e.id.toString());
        catsList.appendChild(catLi);
      });
      this.range.Owner.processNodesAsync(Array.from(newBox.childNodes));

      modalBody.appendChild(newBox);
      const submitBtn: HTMLElement = modalBody.querySelector(
        "[new-form-submit-button]"
      );
      const timeInput = modalBody.querySelector(
        "[bc-calendar-time]"
      ) as HTMLInputElement;
      const titleInput = modalBody.querySelector(
        "[data-calendar-title-input]"
      ) as HTMLInputElement;
      const descInput = modalBody.querySelector(
        "[data-calendar-description-textarea]"
      ) as HTMLInputElement;
      const catId = modalBody.querySelector(
        "[bc-calendar-dropdown-id]"
      ) as HTMLInputElement;
      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const newNoteObj = {
          dateid: this.day.dateId.toString(),
          noteid: (0).toString(),
          time: timeInput.value ? timeInput.value : "00:00",
          note: titleInput.value ? titleInput.value : "",
          description: descInput.value ? descInput.value : "",
          catid: catId.value ? catId.value : "",
        };

        let apiLink = this.range.options.baseUrl["addnote"];
        this.range.sendAsyncDataPostJson(newNoteObj, apiLink);
        if (this.range.options.displayNote) {
          await this.range.refreshNotesAsync();
        }
        // this.modal.closeModal();
        $bc.setSource("calendar.addNote", true);
        this.range.runAsync();
        this.modal.closeModal();
      });
    });

    var todayNote = this.range.getDayNotes(this.day.dateId);
    if (todayNote.length == 0) {
      let divElement = document.createElement("div");
      divElement.setAttribute("data-calendar-no-message", "");
      divElement.setAttribute("data-sys-inherit", "");
      const emptyListText = this.range.options.labels.emptyNoteList;
      const emptyListIcon = `<svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30.6 47.6C30.6 45.7222 32.1222 44.2 34 44.2C35.8778 44.2 37.4 45.7222 37.4 47.6C37.4 49.4778 35.8778 51 34 51C32.1222 51 30.6 49.4778 30.6 47.6ZM30.6 20.4C30.6 18.5222 32.1222 17 34 17C35.8778 17 37.4 18.5222 37.4 20.4V34C37.4 35.8778 35.8778 37.4 34 37.4C32.1222 37.4 30.6 35.8778 30.6 34V20.4ZM33.966 0C15.198 0 0 15.232 0 34C0 52.768 15.198 68 33.966 68C52.768 68 68 52.768 68 34C68 15.232 52.768 0 33.966 0ZM34 61.2C18.972 61.2 6.8 49.028 6.8 34C6.8 18.972 18.972 6.8 34 6.8C49.028 6.8 61.2 18.972 61.2 34C61.2 49.028 49.028 61.2 34 61.2Z" fill="#D0D0D0"/>
      </svg>
      `;
      divElement.innerHTML = emptyListIcon + emptyListText;
      divElement.setAttribute("data-sys-text-disabled", "");
      modalBody.appendChild(divElement);
    }
    todayNote.map(async (x) => {
      const delBtn = document.createElement("div");
      const obj = {
        noteid: x.id,
        //    creatoruser: this.range.userId,
        creatoruser: 1037559,
      };
      const viewNote = await this.range.sendAsyncDataPostJson(
        obj,
        this.range.options.baseUrl["viewnote"]
      );
      const divElement: HTMLElement = document.createElement("div");
      const divElementHeader: HTMLElement = document.createElement("div");
      const textSpan: HTMLElement = document.createElement("div");
      const description: HTMLElement = document.createElement("div");
      const moreButton: HTMLElement = document.createElement("div");
      const time: HTMLElement = document.createElement("div");
      const sharedfrom: HTMLElement = document.createElement("div");
      const color: object = this.hexToRgb(`${x.color}`);
      if (color) {
        divElement.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.1)`;
        divElement.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
      } else {
        divElement.style.background = `#999999`;
        divElement.style.color = `#fff`;
        description.style.color = "#fff";
      }
      let deleteAlert = document.createElement("div");
      deleteAlert.innerHTML = `
      <p >${this.range.options.labels.deleteTextTitle} </p>
      <div class="modalButtons">
   <button type="button" class="modalButton remove" data-sys-button-delete="" data-sys-delete-calendar-note="" >
   ${this.range.options.labels.deleteKeyTitle}
   </button><button type="button" class="modalButton cancelBtn" data-sys-cancel-btn="" data-sys-cancel-delete-calendar-note="" >
   ${this.range.options.labels.cancelKeyTitle}
   </button>
   <div class="message"></div>
   </div>
      `;
      deleteAlert.setAttribute("data-calendar-delete-alert", "");
      textSpan.textContent = x.note;
      description.textContent = x.description;
      time.textContent = x.time;
      moreButton.innerHTML = `<svg width="5" height="17" viewBox="0 0 5 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path data-sys-text="" d="M2.35707 6.63415C1.28564 6.63415 0.428502 7.46341 0.428502 8.5C0.428502 9.53658 1.28564 10.3659 2.35707 10.3659C3.4285 10.3659 4.28564 9.53658 4.28564 8.5C4.28564 7.46341 3.4285 6.63415 2.35707 6.63415ZM4.28564 1.86585C4.28564 2.90244 3.4285 3.73171 2.35707 3.73171C1.28564 3.73171 0.428502 2.90244 0.428502 1.86585C0.428502 0.829268 1.28564 0 2.35707 0C3.4285 0 4.28564 0.829268 4.28564 1.86585ZM4.28564 15.1341C4.28564 16.1707 3.4285 17 2.35707 17C1.28564 17 0.428502 16.1707 0.428502 15.1341C0.428502 14.0976 1.28564 13.2683 2.35707 13.2683C3.4285 13.2683 4.28564 14.0976 4.28564 15.1341Z" fill="#525252"/>
      </svg>
      `;

      if (x.sharinginfo) {
        sharedfrom.innerHTML = `<svg width="20" height="15" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.2609 8.08235L11.2335 5.16439C12.0832 2.61531 12.5081 1.34076 11.8353 0.667978C11.1625 -0.0048075 9.88795 0.420039 7.33887 1.26973L4.42091 2.24239C2.36355 2.92817 1.33487 3.27107 1.04255 3.77389C0.764462 4.25224 0.764462 4.84303 1.04255 5.32138C1.33487 5.8242 2.36355 6.1671 4.42091 6.85288C4.67588 6.93787 4.96272 6.87719 5.15365 6.68803L8.27351 3.59708C8.44903 3.42318 8.73228 3.4245 8.90618 3.60002C9.08007 3.77554 9.07875 4.0588 8.90323 4.23269L5.83375 7.27373C5.62331 7.48222 5.5567 7.80132 5.65037 8.08235C6.33615 10.1397 6.67905 11.1684 7.18188 11.4607C7.66022 11.7388 8.25101 11.7388 8.72936 11.4607C9.23219 11.1684 9.57508 10.1397 10.2609 8.08235Z" fill="#767676"/>
        </svg>
        ${this.range.options.labels.SharingBy}
        <span>
        ${x.sharinginfo["from"].name}</span>
        `;
      }

      textSpan.setAttribute("bc-calendar-note-title", "");
      description.setAttribute("bc-calendar-note-description", "");
      time.setAttribute("bc-calendar-note-time", "");
      sharedfrom.setAttribute("bc-calendar-note-sharefrom", "");
      divElement.setAttribute("data-calendar-note-item", "");
      divElementHeader.setAttribute("data-calendar-note-header", "");
      moreButton.setAttribute("data-calendar-more-button", "");
      const moreButtonBox = document.createElement("div");

      if (x.creator == 0) {
        moreButtonBox.innerHTML = moreShareBox;
        // if(this.range.options.level == "user"){
        //   moreButtonBox.querySelector("[bc-calendar-reminder-note]")?.remove()

        // }

        moreButton.appendChild(moreButtonBox);
        moreButton.addEventListener("click", (e) => {
          const moreButtonDropDown = moreButtonBox.querySelector(
            "[bc-calendar-note-operation]"
          );
          moreButtonDropDown.classList.toggle("open_drop_down");
        });
        moreButtonBox.querySelector("[data-bc-reminder-btn]").textContent =
          this.range.options.labels.reminderMenuTitle;
      } else {
        moreButtonBox.innerHTML = moreBox;
        // if(this.range.options.level == "user"){
        //   moreButtonBox.querySelector("[bc-calendar-reminder-note]")?.remove()

        // }

        moreButtonBox.querySelector("[data-bc-reminder-btn]").textContent =
          this.range.options.labels.reminderMenuTitle;
        moreButtonBox.querySelector("[data-view-btn]").textContent =
          this.range.options.labels.viewMenuTitle;
        moreButtonBox.querySelector("[data-bc-edit-btn]").innerHTML =
          this.range.options.labels.editMenuTitle;
        moreButtonBox.querySelector("[data-bc-delete-btn]").innerHTML =
          this.range.options.labels.deleteMenuTitle;
        moreButtonBox.querySelector("[data-bc-share-btn]").innerHTML =
          this.range.options.labels.shareMenuTitle;

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

        shareBtn.addEventListener("click", async (e) => {
          this.modal.cover.querySelector("[data-calendar-new-btn]").remove();
          modalBody.innerHTML = "";
          if (this.range.options.level == "user") {
            modalBody.appendChild(this.generateShareForm(x));
            const shareSubmit = modalBody.querySelector(
              "[data-calendar-submit]"
            );
            shareSubmit.innerHTML = this.range.options.labels.submitKeyTitle;
            shareSubmit.addEventListener("click", async (e) => {
              e.preventDefault();
              const users = [];
              const usernames = modalBody.querySelectorAll(
                "[data-calendar-share-input]"
              );
              usernames.forEach((e) => {
                const currentEmail = e as HTMLInputElement;
                users.push(currentEmail.value);
              });

              let formData = new FormData();
              formData.append("usedforid", x.id.toString());
              formData.append("mid", `63`);
              formData.append("username", JSON.stringify(users));
              let apiLink = this.range.options.baseUrl["sharing"];
              const data = await this.range.sendAsyncData(formData, apiLink);

              if (data.errorid == 3) {
                modalBody
                  .querySelector("[data-calendar-submit]")
                  .setAttribute("data-bc-calendar-disable-button", "");

                const inputs = modalBody.querySelectorAll(
                  "[data-calendar-share-form]"
                );
                data.users.forEach((e, i) => {
                  const errors = inputs[i].querySelectorAll(
                    "[data-calendar-tooltip-flag]"
                  );
                  errors.forEach((e) => {
                    e.remove();
                  });
                  if (e.errorid == 7) {
                    const error = document.createElement("div");
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-danger", "");
                    error.setAttribute("data-sys-message-danger-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = `
                 <span>
                 یکی از یوزرها اشتباه است 
                 لطفا مجددا بررسی کنید
                 <i class="lni lni-close"></i>
                 </span> `;
                    inputs[i].appendChild(error);
                  } else if (e.errorid == 11) {
                    const error = document.createElement("div");
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-danger", "");
                    error.setAttribute("data-sys-message-danger-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = ` 
                 <span>
                یادداشت قبلا با کاربر به اشتراک گذاشته شده است
                <i class="lni lni-close"></i>
                 </span> `;
                    inputs[i].appendChild(error);
                  } else if (e.errorid == 12) {
                    const error = document.createElement("div");
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-danger", "");
                    error.setAttribute("data-sys-message-danger-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = ` 
                 <span>
                 ${this.range.options.labels.repeatUser}
                <i class="lni lni-close"></i>
                 </span> `;
                    inputs[i].appendChild(error);
                  } else if (e.errorid == 8) {
                    const error = document.createElement("div");
                    // error.setAttribute("data-calendar-tooltip","")
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-danger", "");
                    error.setAttribute("data-sys-message-danger-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = ` 
                 <span>
                 ${this.range.options.labels.wrongUser}
                <i class="lni lni-close"></i>
                 </span> `;
                    inputs[i].appendChild(error);
                  }
                });
              } else if (data.errorid == 5) {
                modalBody
                  .querySelector("[data-calendar-submit]")
                  .setAttribute("data-bc-calendar-disable-button", "");

                const inputs = modalBody.querySelectorAll(
                  "[data-calendar-share-form]"
                );
                data.users.forEach((e, i) => {
                  const errors = inputs[i].querySelectorAll(
                    "[data-calendar-tooltip-flag]"
                  );
                  errors.forEach((e) => {
                    e.remove();
                  });
                  if (e.errorid == 8) {
                    const error = document.createElement("div");
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-danger", "");
                    error.setAttribute("data-sys-message-danger-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = `                <span>
                  <i class="lni lni-close"></i>
                 یکی از یوزرها اشتباه است 
                 لطفا مجددا بررسی کنید
                
                 </span> `;
                    inputs[i].appendChild(error);
                  }
                  if (e.errorid == 7) {
                    const error = document.createElement("div");
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-danger", "");
                    error.setAttribute("data-sys-message-danger-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = `
                 <span>
                 <i class="lni lni-close"></i>
                 یکی از یوزرها اشتباه است 
                 لطفا مجددا بررسی کنید
                
                 </span> `;
                    inputs[i].appendChild(error);
                  } else if (e.errorid == 11) {
                    const error = document.createElement("div");
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-success", "");
                    error.setAttribute("data-sys-message-success-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = `  <span>
                  <i class="lni lni-checkmark"></i>
                 ${this.range.options.labels.sharingSuccessMessage}
                 
                  </span> 
                `;
                    inputs[i].appendChild(error);
                    shareListWrapper.innerHTML = "";
                    this.getSharingList(x, modalBody, shareListWrapper);
                  } else if (e.errorid == 12) {
                    const error = document.createElement("div");
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-danger", "");
                    error.setAttribute("data-sys-message-danger-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = `
                 <span>
                 <i class="lni lni-close"></i>
                 ${this.range.options.labels.repeatUser}
               
                 </span> `;
                    inputs[i].appendChild(error);
                  } else if (e.errorid == 13) {
                    const error = document.createElement("div");
                    error.setAttribute("data-calendar-tooltip-flag", "");
                    error.setAttribute("data-sys-message-danger", "");
                    error.setAttribute("data-sys-message-danger-fade-in", "");
                    error.setAttribute("style", "display: block");
                    error.innerHTML = `
                 <span>
                 <i class="lni lni-close"></i>
                 ${this.range.options.labels.sharingErrorWithOwner}
               
                 </span> `;
                    inputs[i].appendChild(error);
                  }
                });
                setTimeout((e) => {
                  // this.modal.closeModal()
                }, 2000);
              }
              const errors = modalBody.querySelectorAll(
                "[data-calendar-tooltip-flag]"
              );
              errors.forEach((e) => {
                setTimeout(function () {
                  e.setAttribute("data-sys-message-danger-fade-out", "");
                }, 3000);
              });
            });
          } else {
            modalBody.appendChild(await this.generateShareFormForService(x));
            modalBody
              .querySelector("[data-calendar-submit]")
              .addEventListener("click", async (e) => {
                e.preventDefault();
                const sender = modalBody.querySelector(
                  "[bc-calendar-dropdown-sender]"
                ) as HTMLInputElement;
                const reciver = modalBody.querySelector(
                  "[bc-calendar-dropdown-reciver]"
                ) as HTMLInputElement;
                let formData = new FormData();
                formData.append("usedforid", x.id.toString());
                formData.append("ownercatid", sender.value);
                formData.append("catid", reciver.value);
                let apiLink = this.range.options.baseUrl["sharingService"];
                const data = await this.range.sendAsyncData(formData, apiLink);
                document.getElementById("errors").innerHTML = "";
                if (data.errorid == 6) {
                  const error = document.createElement("div");
                  error.setAttribute("data-calendar-tooltip-flag", "");
                  error.setAttribute("data-sys-message-success", "");
                  error.setAttribute("data-sys-message-success-fade-in", "");
                  error.setAttribute("style", "display: block");
                  error.innerHTML = `  <span>
              <i class="lni lni-checkmark"></i>
             ${this.range.options.labels.sharingSuccessMessage}
              
              </span> 
            `;
                  modalBody
                    .querySelector("[data-calendar-submit]")
                    .setAttribute("data-bc-calendar-disable-button", "");

                  document.getElementById("errors").appendChild(error);

                  setTimeout(function () {
                    error.setAttribute("data-sys-message-danger-fade-out", "");
                  }, 3000);

                  this.getSharingList(x, modalBody, shareListWrapper);
                } else if (data.errorid == 7) {
                  const error = document.createElement("div");
                  error.setAttribute("data-calendar-tooltip-flag", "");
                  error.setAttribute("data-sys-message-danger", "");
                  error.setAttribute("data-sys-message-danger-fade-in", "");
                  error.setAttribute("style", "display: block");

                  error.innerHTML = `
             <span>
             <i class="lni lni-close"></i>
             ${this.range.options.labels.sharingrepeatMessage}
             </span> `;
                  document.getElementById("errors").appendChild(error);
                  modalBody
                    .querySelector("[data-calendar-submit]")
                    .setAttribute("data-bc-calendar-disable-button", "");
                  setTimeout(function () {
                    error.setAttribute("data-sys-message-danger-fade-out", "");
                  }, 3000);
                }
              });
          }
          const shareHeader = modalHeader.querySelector(
            "[data-calendar-modal-header-date]"
          );
          shareHeader.innerHTML = "";
          shareHeader.textContent = this.range.options.labels.shareBoxTitle;

          const shareListWrapper = modalBody.querySelector(
            "[data-calendar-share-note-wrapper]"
          ) as HTMLElement;
          shareListWrapper.innerHTML = "";
          this.getSharingList(x, modalBody, shareListWrapper);
        });

        removeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          modalBody.querySelector("[data-calendar-delete-alert]")?.remove();
          divElement.parentNode.insertBefore(deleteAlert, divElement);
          const submitRemoveButton = modalBody.querySelector(
            "[data-sys-delete-calendar-note]"
          );
          const cancelRemoveButton = modalBody.querySelector(
            "[data-sys-cancel-delete-calendar-note]"
          );
          submitRemoveButton.addEventListener("click", async (removeEvent) => {
            const obj = {
              noteid: x.id,
            };
            let apilink = this.range.options.baseUrl["removenote"];
            this.range.sendAsyncDataPostJson(obj, apilink);

            if (this.range.options.displayNote) {
              await this.range.refreshNotesAsync();
            }
            this.range.runAsync();
            this.modal.closeModal();
          });
          cancelRemoveButton.addEventListener("click", (cancelRemoveEvent) => {
            modalBody.querySelector("[data-calendar-delete-alert]").remove();
          });
        });
      }
      const reminderBtn: HTMLElement = moreButtonBox.querySelector(
        "[bc-calendar-reminder-note]"
      );
      reminderBtn?.addEventListener("click", async (e) => {
        modalBody.innerHTML = "";
        modalBody.appendChild(this.generateReminderForm(x.creator));
        let unitId = 1;
        const reminderSubmit = modalBody.querySelector(
          "[data-calendar-submit]"
        );
        this.createReminderList(x.id, modalBody);
        const switchButtons = modalBody.querySelectorAll(
          "[bc-calendar-change-button]"
        );
        switchButtons.forEach((x) => {
          x.addEventListener("click", function (e) {
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
            const tab = container.querySelector(".tabActive") as HTMLElement;
            tab.style.transform = `translateX(-${left}00%)`;
            const actionidInput = modalBody.querySelector(
              "[bc-calendar-action-id]"
            ) as HTMLInputElement;
            actionidInput.value = this.getAttribute("data-id");
          });
        });
        const dropDowns = modalBody.querySelectorAll("[bc-calendar-drop-down]");
        dropDowns.forEach((el) => {
          const dropDownBtn = el.querySelector("[bc-calendar-drop-down-btn]");
          dropDownBtn.textContent = el.getAttribute("data-text")
            ? el.getAttribute("data-text")
            : "دقیقه";
          const liItems = el.querySelectorAll("li");
          liItems.forEach((LIelement) => {
            LIelement.addEventListener("click", function (element) {
              const dropdownValue = el.querySelector(
                "[bc-calendar-dropdown-id]"
              ) as HTMLInputElement;
              dropdownValue.value = this.getAttribute("data-id");
              const liText = element.target as HTMLElement;
              dropDownBtn.textContent = liText.innerText;
              unitId = parseInt(this.getAttribute("data-id"));
            });
          });
          el.addEventListener("click", function (element) {
            dropDowns.forEach((cel) => {
              cel.querySelector("ul").classList.remove("open_drop_down");
              cel.closest("div").classList.remove("open_drop_down_wrapper");
            });
            dropDownBtn
              .closest("div")
              .classList.toggle("open_drop_down_wrapper");
            dropDownBtn.nextElementSibling.classList.toggle("open_drop_down");
          });
        });
        var isPast: boolean = false;
        if (this.day.isPast == true) {
          isPast = true;
          reminderSubmit.setAttribute("data-bc-calendar-disable-button", "");
          reminderSubmit.removeAttribute("data-sys-button");
          reminderSubmit.setAttribute("data-bc-calendar-disable-button", "");
          const error = document.createElement("div");
          error.setAttribute("data-calendar-tooltip-flag", "");
          error.setAttribute("data-sys-message-danger", "");
          error.setAttribute("data-sys-message-danger-fade-in", "");
          error.setAttribute("style", "display: block");

          error.innerHTML = `  <span>
        <i class="lni lni-close"></i>
        ${this.range.options.labels.reminderErrorForLastDays}
     
        </span> 
      `;
          modalBody.querySelector("#errors").appendChild(error);
        } else if (x.time == "") {
          isPast = true;
          reminderSubmit.setAttribute("data-bc-calendar-disable-button", "");
          reminderSubmit.removeAttribute("data-sys-button");
          reminderSubmit.setAttribute("data-bc-calendar-disable-button", "");
          const error = document.createElement("div");
          error.setAttribute("data-calendar-tooltip-flag", "");
          error.setAttribute("data-sys-message-danger", "");
          error.setAttribute("data-sys-message-danger-fade-in", "");
          error.setAttribute("style", "display: block");

          error.innerHTML = `  <span>
        <i class="lni lni-close"></i>
        ${this.range.options.labels.setTimeForReminderMessage}
     
        </span> 
      `;
          modalBody.querySelector("#errors").appendChild(error);
        } else {
          var currentTime = new Date();
          const hours = currentTime.getHours();
          const minute = currentTime.getMinutes();
          const timeId = hours * 3600 + minute * 60;
          const NoteHours = x.time.split(":")[0];
          const NoteMinute = x.time.split(":")[1];
          const noteTimeId =
            parseInt(NoteHours) * 3600 + parseInt(NoteMinute) * 60;
          if (noteTimeId < timeId && this.day.isToday == true) {
            isPast = true;

            reminderSubmit.setAttribute("data-bc-calendar-disable-button", "");
            reminderSubmit.removeAttribute("data-sys-button");

            const error = document.createElement("div");
            error.setAttribute("data-calendar-tooltip-flag", "");
            error.setAttribute("data-sys-message-danger", "");
            error.setAttribute("data-sys-message-danger-fade-in", "");
            error.setAttribute("style", "display: block");
            error.innerHTML = `  <span>
        <i class="lni lni-close"></i>
        امکان ثبت Reminder برای ساعت گذشته در یک روز وجود ندارد.
      
        </span> 
      `;
            modalBody.querySelector("#errors").appendChild(error);
          }
        }

        if (isPast == false) {
          let inputNewWrapper = modalBody.querySelector(
            "[data-bc-new-row-reminder]"
          ) as HTMLElement;
          let inputNew = inputNewWrapper.querySelector(
            "[data-calendar-time-value]"
          ) as HTMLInputElement;
          inputNew.addEventListener("keyup", (e) => {
            if (inputNew.value != "" && inputNew.value != undefined) {
              modalBody
                .querySelector("[data-reminder-submit]")
                .removeAttribute("data-bc-calendar-disable-button");
            } else {
              modalBody
                .querySelector("[data-reminder-submit]")
                .setAttribute("data-bc-calendar-disable-button", "");
            }
          });
        }
        reminderSubmit.addEventListener("click", async (e) => {
          e.preventDefault();

          const newReminder = modalBody.querySelector(
            "[data-bc-new-row-reminder]"
          );
          const timeType = newReminder.querySelector(
            "[data-bc-select-time]"
          ) as HTMLInputElement;
          const num = newReminder.querySelector(
            "[bc-calendar-time-num]"
          ) as HTMLInputElement;
          const typeid = newReminder.querySelector(
            "[data-bc-select-service-reminder]"
          ) as HTMLInputElement;
          const actionId = newReminder.querySelector(
            '[tab-button-status="active"]'
          );
          let newNoteObj = {
            id: 0,
            noteid: x.id,
            unitid: timeType.value,
            value: num.value,
            typeid: typeid.value,
            actionid: actionId.getAttribute("data-id"),
          };

          let apiLink = this.range.options.baseUrl["reminder"];
          const data = await this.range.sendAsyncDataPostJson(
            newNoteObj,
            apiLink
          );
          if (data.errorid == 5) {
            const error = document.createElement("div");
            error.setAttribute("data-calendar-tooltip-flag", "");
            error.setAttribute("data-sys-message-danger", "");
            error.setAttribute("data-sys-message-danger-fade-in", "");
            error.setAttribute("style", "display: block");
            error.innerHTML = `  <span>
          <i class="lni lni-close"></i>
         ابتدا برای یادداشت خود، ساعت انتخاب کنید
        
          </span> 
        `;
            modalBody.querySelector("#errors").appendChild(error);
            setTimeout(function () {
              error.setAttribute("data-sys-message-danger-fade-out", "");
            }, 3000);
          } else if (data.errorid == 2) {
            const error = document.createElement("div");
            error.setAttribute("data-calendar-tooltip-flag", "");
            error.setAttribute("data-sys-message-danger", "");
            error.setAttribute("data-sys-message-danger-fade-in", "");
            error.setAttribute("style", "display: block");
            error.innerHTML = `  <span>
          <i class="lni lni-close"></i>
          ${this.range.options.labels.errorMessage}
        
          </span> 
        `;
            modalBody.querySelector("#errors").appendChild(error);
            setTimeout(function () {
              error.setAttribute("data-sys-message-danger-fade-out", "");
            }, 3000);
          } else if (data.errorid == 6) {
            const error = document.createElement("div");
            error.setAttribute("data-calendar-tooltip-flag", "");
            error.setAttribute("data-sys-message-success", "");
            error.setAttribute("data-sys-message-success-fade-in", "");
            error.setAttribute("style", "display: block");
            modalBody
              .querySelector("[data-calendar-submit]")
              .setAttribute("data-bc-calendar-disable-button", "");
            error.innerHTML = `  <span>
          <i class="lni lni-checkmark"></i>
          ${this.range.options.labels.successMessage}
          
          </span> 
        `;
            modalBody.querySelector("#errors").appendChild(error);
            setTimeout(function () {
              error.setAttribute("data-sys-message-danger-fade-out", "");
            }, 3000);
            this.createReminderList(x.id, modalBody);
            this.generateReminderRow(modalBody);
            // reminderSubmit.textContent = "ثبت شد"
          }
        });
      });
      const editBtn: HTMLElement = moreButtonBox.querySelector(
        "[bc-calendar-edit-note]"
      );
      editBtn?.addEventListener("click", (e) => {
        this.range.getCategories();
        if (this.range?.Owner?.dc?.isRegistered("widget")) {
          const widgetName = this.range.Owner.dc.resolve<IWidget>("widget");
          widgetName.title = this.range.options.labels["edit"];
        }
        modalBody.innerHTML = "";
        modalBody.appendChild(this.generateNoteForm(x, x.creator));
        const timeInputt: HTMLElement = modalBody.querySelector(
          "[bc-calendar-time-input]"
        );

        const datePickerOptions: OptionTypes = {
          editable: true,
          okLabel: this.range.options.labels.submitKeyTitle,
          cancelLabel: this.range.options.labels.cancelKeyTitle,
          amLabel: this.range.options.labels.amLabel,
          pmLabel: this.range.options.labels.pmLabel,
          clockType: "24h",
          timeLabel: "",
        };
        const newTimepicker = new TimepickerUI(timeInputt, datePickerOptions);
        const modalParent: HTMLElement = modalBody.closest("[data-modal-form]");
        const timeInputIcon: HTMLElement =
          modalBody.querySelector("[new-note-clock]");
        timeInputIcon.addEventListener("click", (timeElement) => {
          modalParent.style.display = "none";
          newTimepicker.open();
        });
        timeInputt.addEventListener("click", (timeElement) => {
          modalParent.style.display = "none";
          newTimepicker.open();
        });
        timeInputt.addEventListener("accept", (event) => {
          setTimeout((timeoute) => {
            modalParent.style.display = "block";
          }, 300);
        });
        timeInputt.addEventListener("cancel", (event) => {
          setTimeout((timeoute) => {
            modalParent.style.display = "block";
          }, 300);
        });
        const timeInput = modalBody.querySelector(
          "[bc-calendar-time]"
        ) as HTMLInputElement;
        const titleInput = modalBody.querySelector(
          "[data-calendar-title-input]"
        ) as HTMLInputElement;
        const descInput = modalBody.querySelector(
          "[data-calendar-description-textarea]"
        ) as HTMLInputElement;
      });
      const noteType = document.createElement("div");
      const noteTypeText = document.createElement("span");
      divElementHeader.appendChild(textSpan);
      divElementHeader.appendChild(moreButton);
      const infoBox = document.createElement("div");
      const categoryBox = document.createElement("div");

      categoryBox.setAttribute("data-calendar-cat-box", "");
      infoBox.setAttribute("data-calendar-info-box", "");
      infoBox.appendChild(categoryBox);
      const timeunitcases = {
        1: "دقیقه",
        2: "ساعت",
        3: "روز",
      };
      const typecases = {
        1: "برای خودم",
        2: "برای همه اعضای گروه",
      };
      viewNote[0].reminders.map((e) => {
        const reminderBox = document.createElement("div");
        reminderBox.setAttribute("data-calendar-reminder-box", "");

        const reminderBoxIcon = document.createElement("div");
        reminderBoxIcon.setAttribute("data-calendar-reminder-icon", "");
        const reminderBoxInfo = document.createElement("div");
        reminderBoxInfo.innerHTML = `${e.value} ${
          timeunitcases[String(e.timeunitid)]
        }  قبل ${typecases[e.typeid]}`;
        reminderBox.appendChild(reminderBoxIcon);
        reminderBoxIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect opacity="0.1" width="22" height="22" rx="5" fill="#004B85"/>
        <path d="M16 7.91658L13.47 6L12.7605 6.75968L15.2905 8.67627L16 7.91658ZM8.234 6.75968L7.53 6L5 7.91162L5.7095 8.6713L8.234 6.75968ZM10.5 7.06256C7.7665 7.06256 5.55 9.06356 5.55 11.5313C5.55 13.999 7.761 16 10.5 16C13.2335 16 15.45 13.999 15.45 11.5313C15.45 9.06356 13.2335 7.06256 10.5 7.06256ZM10.5 15.007C8.3715 15.007 6.65 13.4528 6.65 11.5313C6.65 9.60973 8.3715 8.05561 10.5 8.05561C12.6285 8.05561 14.35 9.60973 14.35 11.5313C14.35 13.4528 12.6285 15.007 10.5 15.007ZM9.697 12.291L8.5255 11.2334L7.9425 11.7597L9.6915 13.3386L12.9915 10.3595L12.4085 9.83317L9.697 12.291Z" fill="#004B85"/>
        </svg>`;
        reminderBox.appendChild(reminderBoxInfo);
        infoBox.appendChild(reminderBox);
      });
      categoryBox.innerHTML = this.range.categories.find(
        (e) => e.id === x.catid
      ).title;
      divElement.appendChild(infoBox);
      divElement.appendChild(divElementHeader);

      if (x.sharinginfo) {
        divElement.appendChild(sharedfrom);
      }
      divElement.appendChild(description);
      divElement.appendChild(time);
      modalBody.appendChild(divElement);

      const viewBtn: HTMLElement = moreButtonBox.querySelector(
        "[bc-calendar-view-note]"
      );
      const viewBtnSpan = viewBtn.querySelector("span");
      viewBtnSpan.textContent = this.range.options.labels.viewMenuTitle;
      viewBtn?.addEventListener("click", (e) => {
        const viewBox = document.createElement("div");
        viewBox.classList.add("view_box");
        this.viewNote.generateViewNote(
          x,
          modalBody,
          modalHeader,
          viewBox,
          x.creatoruser
        );
      });
    });
    boxElement.appendChild(modalHeader);
    boxElement.appendChild(modalBody);
    boxElement.setAttribute("data-calendar-drop-down-view", "");
    listWrapper.insertBefore(boxElement, listWrapper.nextSibling);
    boxElement.addEventListener("click", function (element) {
      const thisElement = element.target as HTMLLIElement;
      const dropDowns = boxElement.querySelectorAll(
        "[bc-calendar-drop-down] ul"
      );
      dropDowns.forEach((el) => {
        if (thisElement.getAttribute("bc-calendar-drop-down-btn") == null) {
          el.classList.remove("open_drop_down");
        }
      });
    });
    return listWrapper;
  }

  async getSharingList(note: INote, body: HTMLElement, wrapper: HTMLElement) {
    const obj = {
      noteid: note.id,
      //   creatoruser: this.range.userId,
      creatoruser: 1037559,
    };

    const viewNote = await this.range.sendAsyncDataPostJson(
      obj,
      this.range.options.baseUrl["viewnote"]
    );
    wrapper.innerHTML = "";
    viewNote[0]?.sharing.forEach((e) => {
      const shareItem = document.createElement("div");
      const shareUserName = document.createElement("div");
      const shareItemSpan = document.createElement("span");
      const removeSharing = document.createElement("div");
      removeSharing.setAttribute("data-calendar-remove-sharing", "");
      removeSharing.setAttribute("data-sys-bg-secondary", "");
      removeSharing.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.04028 0.0603034L0.0603845 2.0402L4.02018 6L0.0603845 9.9598L2.04028 11.9397L6.00008 7.9799L9.95988 11.9397L11.9398 9.9598L7.97998 6L11.9398 2.0402L9.95988 0.0603037L6.00008 4.0201L2.04028 0.0603034Z" fill="#B40020"/>
      </svg>
      `;
      removeSharing.addEventListener("click", async (eve) => {
        const obj = {
          usedforid: note.id,
          userid: e.userid,
          mid: 63,
          id: e.id,
        };
        const removeNote = await this.range.sendAsyncDataPostJson(
          obj,
          this.range.options.baseUrl["removesharing"]
        );
        shareItem.remove();
      });
      shareItem.setAttribute("data-calendar-sharing-item", "");
      shareUserName.setAttribute("data-calendar-sharing-username-service", "");
      shareUserName.setAttribute("data-sys-text", "");
      shareUserName.textContent = e.name;
      shareItemSpan.textContent = `( ${e.username} )`;
      shareUserName.appendChild(shareItemSpan);

      if (this.range.options.level == "service") {
        const sender = document.createElement("div");
        const senderCatid = document.createElement("span");
        const senderTitle = document.createElement("div");
        senderCatid.innerHTML = `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.70021 13.3C8.09021 12.91 8.09021 12.28 7.70021 11.89L3.83021 7.99998H19.0002C19.5502 7.99998 20.0002 7.54998 20.0002 6.99998C20.0002 6.44998 19.5502 5.99998 19.0002 5.99998H3.83021L7.71021 2.11998C8.10021 1.72998 8.10021 1.09998 7.71021 0.70998C7.32021 0.31998 6.69021 0.31998 6.30021 0.70998L0.700215 6.29998C0.310215 6.68998 0.310215 7.31998 0.700215 7.70998L6.29021 13.3C6.68021 13.68 7.32021 13.68 7.70021 13.3Z" fill="#323232"/>
        </svg>
        `;
        senderTitle.textContent = e.ownername;
        sender.appendChild(senderTitle);
        sender.appendChild(senderCatid);
        const reciver = document.createElement("div");
        const reciverCatid = document.createElement("span");
        const reciverTitle = document.createElement("div");
        reciverCatid.textContent = `( ${e.catid} )`;
        reciverTitle.textContent = e.name;
        reciver.appendChild(reciverTitle);

        shareUserName.innerHTML = "";
        shareUserName.appendChild(sender);
        shareUserName.appendChild(reciver);
      }
      shareItem.appendChild(shareUserName);
      shareItem.appendChild(removeSharing);
      wrapper.appendChild(shareItem);
    });
  }
}
