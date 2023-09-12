import { INote } from "../Interface/Interface";
import { UiCalendar } from "./UiCalendar";
export class ViewNote {
  private owner: UiCalendar;
  private colorIndex: number = 0;
  constructor(owner?: UiCalendar) {
    this.owner = owner;
  }
  async generateViewNote(
    note: INote,
    body: HTMLElement,
    header: HTMLElement,
    wrapper: HTMLElement,
    userid: number
  ) {
    const obj = {
      noteid: note.id,
      //  creatoruser: userid,
      creatoruser: 1037559,
    };
    const viewNote = await this.owner.range.sendAsyncDataPostJson(
      obj,
      this.owner.range.options.baseUrl["viewnote"]
    );
    const noteDate = document.createElement("div");
    const noteTime = document.createElement("div");
    const category = document.createElement("div");
    const shareFrom = document.createElement("div");
    const cat = document.createElement("div");
    const description = document.createElement("div");
    const lblType = document.createElement("div");
    const headerTitle = document.createElement("div");
    const headerButtons = document.createElement("div");

    // const color = x.color
    const color: object = this.owner.hexToRgb(`${viewNote[0].color}`);

    headerButtons.innerHTML = `<svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.75 5.20833H3.98958L7.71875 1.46875L6.25 0L0 6.25L6.25 12.5L7.71875 11.0313L3.98958 7.29167H18.75V5.20833Z" fill="#767676"/>
        </svg>
        `;
    headerButtons.style.cursor = "pointer";
    header.innerHTML = "";
    headerTitle.setAttribute("data-calendar-modal-header-date", "");
    headerTitle.textContent = viewNote[0].note;
    lblType.textContent = "یادداشت";
    lblType.classList.add("label_type");
    // header.querySelector("[data-calendar-modal-header-date]").innerHTML = viewNote[0].note
    headerTitle.appendChild(lblType);
    header.appendChild(headerButtons);
    header.appendChild(headerTitle);
    noteDate.innerHTML = `<svg width="20" height="20" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.50039 12.1693C8.24089 12.1693 10.4625 9.96846 10.4625 7.25363C10.4625 4.5388 8.24089 2.33799 5.50039 2.33799C2.75989 2.33799 0.538282 4.5388 0.538282 7.25363C0.538282 9.96846 2.75989 12.1693 5.50039 12.1693ZM5.50039 4.65927C5.72877 4.65927 5.9139 4.84267 5.9139 5.0689V7.08395L7.17115 8.32943C7.33263 8.4894 7.33263 8.74877 7.17115 8.90874C7.00966 9.06872 6.74784 9.06872 6.58636 8.90874L5.208 7.54329C5.13045 7.46647 5.08688 7.36227 5.08688 7.25363V5.0689C5.08688 4.84267 5.27202 4.65927 5.50039 4.65927Z" fill="#767676"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37 1.02852C3.49104 1.22037 3.43217 1.4731 3.23851 1.593L1.03311 2.95846C0.839452 3.07836 0.584337 3.02004 0.463299 2.82819C0.342262 2.63634 0.401135 2.38362 0.594797 2.26371L2.80019 0.898257C2.99385 0.778353 3.24897 0.836675 3.37 1.02852Z" fill="#767676"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.63079 1.02852C7.75183 0.836674 8.00694 0.778353 8.2006 0.898258L10.406 2.26371C10.5996 2.38362 10.6585 2.63634 10.5375 2.82819C10.4164 3.02004 10.1613 3.07836 9.96767 2.95846L7.76229 1.593C7.56862 1.4731 7.50975 1.22037 7.63079 1.02852Z" fill="#767676"/>
        </svg> تاریخ : <span class="view_date_day">${this.owner.day.currentDay.day}</span> <span>${this.owner.day.month.monthName}</span> <span>${this.owner.day.month.currentYear}</span>`;
    noteDate.classList.add("view_date_note");
    wrapper.appendChild(noteDate);
    if (viewNote[0].time) {
      noteTime.innerHTML = `<svg width="20" height="20" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.50039 12.1693C8.24089 12.1693 10.4625 9.96846 10.4625 7.25363C10.4625 4.5388 8.24089 2.33799 5.50039 2.33799C2.75989 2.33799 0.538282 4.5388 0.538282 7.25363C0.538282 9.96846 2.75989 12.1693 5.50039 12.1693ZM5.50039 4.65927C5.72877 4.65927 5.9139 4.84267 5.9139 5.0689V7.08395L7.17115 8.32943C7.33263 8.4894 7.33263 8.74877 7.17115 8.90874C7.00966 9.06872 6.74784 9.06872 6.58636 8.90874L5.208 7.54329C5.13045 7.46647 5.08688 7.36227 5.08688 7.25363V5.0689C5.08688 4.84267 5.27202 4.65927 5.50039 4.65927Z" fill="#767676"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37 1.02852C3.49104 1.22037 3.43217 1.4731 3.23851 1.593L1.03311 2.95846C0.839452 3.07836 0.584337 3.02004 0.463299 2.82819C0.342262 2.63634 0.401135 2.38362 0.594797 2.26371L2.80019 0.898257C2.99385 0.778353 3.24897 0.836675 3.37 1.02852Z" fill="#767676"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.63079 1.02852C7.75183 0.836674 8.00694 0.778353 8.2006 0.898258L10.406 2.26371C10.5996 2.38362 10.6585 2.63634 10.5375 2.82819C10.4164 3.02004 10.1613 3.07836 9.96767 2.95846L7.76229 1.593C7.56862 1.4731 7.50975 1.22037 7.63079 1.02852Z" fill="#767676"/>
            </svg>  ساعت : <span class="time_view_note"> ${viewNote[0].time}</span>`;
      wrapper.appendChild(noteTime);
    }
    if (viewNote[0].catid) {
      cat.classList.add("view_note_label");
      if (color) {
        cat.style.background = `rgba(${color["r"]},${color["g"]},${color["b"]},0.2)`;
        cat.style.color = `rgba(${color["r"]},${color["g"]},${color["b"]},1)`;
      }

      this.owner.range.categories.forEach((e) => {
        if (e.id == viewNote[0].catid) {
          cat.innerHTML = e.title;
        }
      });

      category.innerHTML = `<svg width="20" height="20" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.90348 6.96499C1.06642 7.53313 1.50432 7.97104 2.38013 8.84684L3.41692 9.88363C4.94068 11.4074 5.70256 12.1693 6.6493 12.1693C7.59604 12.1693 8.35792 11.4074 9.88168 9.88363C11.4054 8.35987 12.1673 7.59799 12.1673 6.65125C12.1673 5.70451 11.4054 4.94263 9.88168 3.41887L8.84489 2.38208C7.96908 1.50628 7.53118 1.06837 6.96304 0.905433C6.39489 0.742491 5.79146 0.881743 4.58461 1.16025L3.88864 1.32086C2.87331 1.55516 2.36564 1.67232 2.018 2.01996C1.67036 2.36759 1.55321 2.87526 1.3189 3.89059L1.15829 4.58656C0.87979 5.79342 0.740538 6.39684 0.90348 6.96499ZM5.43724 3.82282C5.88354 4.26912 5.88354 4.99272 5.43724 5.43901C4.99094 5.88531 4.26735 5.88531 3.82105 5.43901C3.37475 4.99272 3.37475 4.26912 3.82105 3.82282C4.26735 3.37653 4.99094 3.37653 5.43724 3.82282ZM10.4963 6.53155L6.5415 10.4865C6.37553 10.6524 6.10644 10.6524 5.94046 10.4865C5.77448 10.3205 5.77448 10.0514 5.94045 9.88542L9.89522 5.93051C10.0612 5.76454 10.3303 5.76453 10.4963 5.9305C10.6622 6.09647 10.6622 6.36557 10.4963 6.53155Z" fill="#767676"/>
            </svg> دسته‌بندی :`;

      category.appendChild(cat);
      if (viewNote[0].creatoruser == this.owner.range.userId) {
        wrapper.appendChild(category);
      }
    }
    if (
      viewNote[0].sharing &&
      viewNote[0].sharing.length > 0 &&
      this.owner.range.options.level == "service"
    ) {
      viewNote[0].sharing.forEach((e) => {
        const sharing = document.createElement("div");
        const sharingUsers = document.createElement("div");
        sharingUsers.setAttribute("data-bc-calendar-sharing-all-list", "");
        sharingUsers.innerHTML = `<svg width="20" height="20" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.2609 8.58235L11.2335 5.66439C12.0832 3.11531 12.5081 1.84076 11.8353 1.16798C11.1625 0.495192 9.88795 0.920039 7.33887 1.76973L4.42091 2.74239C2.36355 3.42817 1.33487 3.77107 1.04255 4.27389C0.764462 4.75224 0.764462 5.34303 1.04255 5.82138C1.33487 6.3242 2.36355 6.6671 4.42091 7.35288C4.67588 7.43787 4.96272 7.37719 5.15365 7.18803L8.27351 4.09708C8.44903 3.92318 8.73228 3.9245 8.90618 4.10002C9.08007 4.27554 9.07875 4.5588 8.90323 4.73269L5.83375 7.77373C5.62331 7.98222 5.5567 8.30132 5.65037 8.58235C6.33615 10.6397 6.67905 11.6684 7.18188 11.9607C7.66022 12.2388 8.25101 12.2388 8.72936 11.9607C9.23219 11.6684 9.57508 10.6397 10.2609 8.58235Z" fill="#767676"/>
            </svg>
             اشتراک‌گذاری :`;
        const sharingWrapper = document.createElement("div");
        sharingWrapper.classList.add("sharing_wrapper1");
        const sender = document.createElement("div");
        sender.setAttribute("data-bc-calendar-sharing-user-avatar1", "");
        //  sender.style.background= this.selectRandomColor()
        const senderWrapper = document.createElement("div");
        const reciverWrapper = document.createElement("div");
        const reciver = document.createElement("div");
        reciver.setAttribute("data-bc-calendar-sharing-user-avatar1", "");
        //  reciver.style.background= this.selectRandomColor()

        if (e.ownername) {
          // senderWrapper.textContent =`از طرف `
          sender.textContent = e.ownername;
          // sender.setAttribute("data-tooltip",e.ownername)
          // senderWrapper.appendChild(sender)
          senderWrapper.appendChild(sender);
        }
        if (e.name) {
          reciverWrapper.innerHTML = `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.70021 13.3C8.09021 12.91 8.09021 12.28 7.70021 11.89L3.83021 7.99998H19.0002C19.5502 7.99998 20.0002 7.54998 20.0002 6.99998C20.0002 6.44998 19.5502 5.99998 19.0002 5.99998H3.83021L7.71021 2.11998C8.10021 1.72998 8.10021 1.09998 7.71021 0.70998C7.32021 0.31998 6.69021 0.31998 6.30021 0.70998L0.700215 6.29998C0.310215 6.68998 0.310215 7.31998 0.700215 7.70998L6.29021 13.3C6.68021 13.68 7.32021 13.68 7.70021 13.3Z" fill="#323232"></path>
                        </svg> `;
          reciver.textContent = e.name;
          // reciver.setAttribute("data-tooltip",e.name)
          reciverWrapper.appendChild(reciver);
        }

        sharingWrapper.appendChild(senderWrapper);
        sharingWrapper.appendChild(reciverWrapper);

        sharingUsers.appendChild(sharingWrapper);
        wrapper.appendChild(sharingUsers);
      });
    }
    if (
      viewNote[0].sharing &&
      viewNote[0].sharing.length > 0 &&
      this.owner.range.options.level == "user"
    ) {
      const sharing = document.createElement("div");
      const sharingUsers = document.createElement("div");
      sharingUsers.innerHTML = `<svg width="20" height="20" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.2609 8.58235L11.2335 5.66439C12.0832 3.11531 12.5081 1.84076 11.8353 1.16798C11.1625 0.495192 9.88795 0.920039 7.33887 1.76973L4.42091 2.74239C2.36355 3.42817 1.33487 3.77107 1.04255 4.27389C0.764462 4.75224 0.764462 5.34303 1.04255 5.82138C1.33487 6.3242 2.36355 6.6671 4.42091 7.35288C4.67588 7.43787 4.96272 7.37719 5.15365 7.18803L8.27351 4.09708C8.44903 3.92318 8.73228 3.9245 8.90618 4.10002C9.08007 4.27554 9.07875 4.5588 8.90323 4.73269L5.83375 7.77373C5.62331 7.98222 5.5567 8.30132 5.65037 8.58235C6.33615 10.6397 6.67905 11.6684 7.18188 11.9607C7.66022 12.2388 8.25101 12.2388 8.72936 11.9607C9.23219 11.6684 9.57508 10.6397 10.2609 8.58235Z" fill="#767676"/>
            </svg>
             اشتراک‌گذاری :`;
      const sharingWrapper = document.createElement("div");
      sharingWrapper.classList.add("sharing_wrapper");

      // sharing.innerHTML= ``
      viewNote[0].sharing.forEach((e) => {
        const sharingUser = document.createElement("div");
        sharingUser.setAttribute("data-bc-calendar-sharing-user-avatar", "");
        sharingUser.style.background = this.selectRandomColor();
        if (e.username) {
          sharingUser.textContent = e.username.split("")[0];
          sharingUser.setAttribute("data-tooltip", e.username);
        }

        sharingWrapper.appendChild(sharingUser);
      });
      sharingUsers.appendChild(sharingWrapper);
      wrapper.appendChild(sharingUsers);
    }
    if (viewNote[0].reminder && viewNote[0].reminder.length > 0) {
      const reminders = document.createElement("div");
      reminders.setAttribute("reminders-all", "");
      viewNote[0].reminder.forEach((e) => {
        const reminder = document.createElement("div");
        reminder.innerHTML = `<svg width="20" height="20" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.90348 6.96499C1.06642 7.53313 1.50432 7.97104 2.38013 8.84684L3.41692 9.88363C4.94068 11.4074 5.70256 12.1693 6.6493 12.1693C7.59604 12.1693 8.35792 11.4074 9.88168 9.88363C11.4054 8.35987 12.1673 7.59799 12.1673 6.65125C12.1673 5.70451 11.4054 4.94263 9.88168 3.41887L8.84489 2.38208C7.96908 1.50628 7.53118 1.06837 6.96304 0.905433C6.39489 0.742491 5.79146 0.881743 4.58461 1.16025L3.88864 1.32086C2.87331 1.55516 2.36564 1.67232 2.018 2.01996C1.67036 2.36759 1.55321 2.87526 1.3189 3.89059L1.15829 4.58656C0.87979 5.79342 0.740538 6.39684 0.90348 6.96499ZM5.43724 3.82282C5.88354 4.26912 5.88354 4.99272 5.43724 5.43901C4.99094 5.88531 4.26735 5.88531 3.82105 5.43901C3.37475 4.99272 3.37475 4.26912 3.82105 3.82282C4.26735 3.37653 4.99094 3.37653 5.43724 3.82282ZM10.4963 6.53155L6.5415 10.4865C6.37553 10.6524 6.10644 10.6524 5.94046 10.4865C5.77448 10.3205 5.77448 10.0514 5.94045 9.88542L9.89522 5.93051C10.0612 5.76454 10.3303 5.76453 10.4963 5.9305C10.6622 6.09647 10.6622 6.36557 10.4963 6.53155Z" fill="#767676"/>
                </svg> یادآوری : `;
        const reminderText = document.createElement("div");
        reminderText.setAttribute("data-bc-calendar-reminder-text", "");
        reminderText.innerHTML =
          e.value +
          " " +
          (e.timeunit ? e.timeunit : e.timetitle) +
          " قبل " +
          " برای " +
          (e.typeid == 1 ? "خودم" : "همه");
        reminder.appendChild(reminderText);
        reminders.appendChild(reminder);
      });
      wrapper.appendChild(reminders);
    }

    // shareFrom.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M10.2609 8.58235L11.2335 5.66439C12.0832 3.11531 12.5081 1.84076 11.8353 1.16798C11.1625 0.495192 9.88795 0.920039 7.33887 1.76973L4.42091 2.74239C2.36355 3.42817 1.33487 3.77107 1.04255 4.27389C0.764462 4.75224 0.764462 5.34303 1.04255 5.82138C1.33487 6.3242 2.36355 6.6671 4.42091 7.35288C4.67588 7.43787 4.96272 7.37719 5.15365 7.18803L8.27351 4.09708C8.44903 3.92318 8.73228 3.9245 8.90618 4.10002C9.08007 4.27554 9.07875 4.5588 8.90323 4.73269L5.83375 7.77373C5.62331 7.98222 5.5567 8.30132 5.65037 8.58235C6.33615 10.6397 6.67905 11.6684 7.18188 11.9607C7.66022 12.2388 8.25101 12.2388 8.72936 11.9607C9.23219 11.6684 9.57508 10.6397 10.2609 8.58235Z" fill="#767676"/>
    // </svg>
    //  اشتراک‌گذاری توسط :`

    description.innerHTML = viewNote[0].description;
    description.classList.add("view_note_description");
    // viewBox
    headerButtons.addEventListener("click", (e) => {
      let modalInside = this.owner.generateNoteList();
      this.owner.modal.openModal(modalInside);
      body.remove();
    });

    wrapper.appendChild(description);
    body.innerHTML = "";
    body.appendChild(wrapper);
    return null;
  }
  private selectRandomColor() {
    const colors: string[] = [
      "#BAE1FF",
      "#E0E0E0",
      "#CDFFCD",
      "#FFD6CD",
      "#DDCDFF",
    ];
    const selectedColor = colors[this.colorIndex];
    this.colorIndex += 1;
    return selectedColor;
  }
}
