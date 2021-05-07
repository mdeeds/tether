export class DraggableBox {
  private static id = 0;
  public elt: HTMLDivElement | HTMLSpanElement;
  constructor() {
    this.elt = document.createElement('span');
    this.elt.id = `elt${DraggableBox.id++}`;
    this.elt.draggable = true;
    this.elt.innerHTML = 'a <span></span> a';
    this.elt.classList.add('outer');
    for (const innerSpan of this.elt.getElementsByTagName('span')) {
      innerSpan.addEventListener('dragover', (ev: DragEvent) => {
        ev.preventDefault();
      });
      innerSpan.classList.add('inner');
      innerSpan.addEventListener('drop', (ev: DragEvent) => {
        const sourceNode = document.getElementById(
          ev.dataTransfer.getData('text/plain'));
        // innerSpan.remove();
        innerSpan.appendChild(sourceNode);
      });
      innerSpan.contentEditable = 'true';
    }
    this.elt.addEventListener('dragstart', (ev: DragEvent) => {
      ev.dataTransfer.setData('text/plain', this.elt.id);
    });
  }
}
