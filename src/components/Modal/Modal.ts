export class Modal {
  public cover: HTMLElement;
  constructor() {
    this.cover = document.createElement("div");
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
    this.cover.addEventListener("click", (e) => {
      this.closeModal();
    });
    modalBody.setAttribute("data-modal-form", "");
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
