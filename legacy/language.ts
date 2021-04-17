
class Block {
  constructor(syntax: string) {

  }
}

export class Language {
  private blocks: Block[];
  constructor() {
    this.add('for (const <> of <>) {}');
    this.add('if () {}');
    this.add('if () {} else {}');
    this.add('const <>');
    this.add('let <>');
  }

  add(syntax: string) {
    this.blocks.push(new Block(syntax));
  }
}