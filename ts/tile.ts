export class Tile {

  static display(tileNames: string[]): Promise<string> {
    const bg = document.createElement('div');
    bg.id = 'tileSelector';
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(bg);

    for (const t of tileNames) {
      const tile = document.createElement('span');
      tile.innerText = t;
      tile.classList.add('tile');
      bg.appendChild(tile);
    }
    const tile = document.createElement('span');
    tile.classList.add('tile');
    tile.innerHTML = '&#2795;';
    bg.appendChild(tile);

    return new Promise((resolve, reject) => {
      resolve('TODO!');
    })

  }

}