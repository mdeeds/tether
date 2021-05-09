export class LeftRail {
  private div: HTMLDivElement;
  constructor(container: HTMLDivElement | HTMLBodyElement) {
    this.div = document.createElement('div');
    this.div.classList.add('leftRail');
    container.appendChild(this.div);

    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        if (req.status === 200) {
          this.setRailText(req.response);
        }
      }
    }
    req.open("GET", 'leftRail.js', true);
    req.responseType = 'text';
    req.send();
  }

  private static widgetNumber = 0;

  setRailText(text: string) {
    text = text.replace(/\/\*\(\*\//g, "<span>");
    text = text.replace(/\/\*\)\*\//g, "</span>");
    this.div.innerHTML = text;
    for (const s of this.div.getElementsByTagName('span')) {
      s.id = `Widget_${LeftRail.widgetNumber++}`;
      s.classList.add('widget');
      s.innerHTML = s.innerHTML.trim();
      s.addEventListener('dragstart', (ev: DragEvent) => {
        ev.dataTransfer.setData('text/plain', s.innerText);
      });
      s.draggable = true;
    }
  }
}