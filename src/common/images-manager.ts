export interface OperateBit {
  imageBase64?: string;
  imageBuffer?: Blob;
  duration?: number;
}

export class ImagesManager {
  private operateBodies: OperateBit[];
  constructor() {
    this.operateBodies = [];
  }

  public append(body: OperateBit): ImagesManager {
    this.operateBodies = this.operateBodies.concat([body]);
    return this;
  }

  public resignBody(index: number, body: OperateBit): ImagesManager {
    this.operateBodies = this.operateBodies.slice(0, index)
      .concat([body])
      .concat(this.operateBodies.slice(index + 1));
    return this;
  }

  public insert(index: number, body: OperateBit): ImagesManager {
    this.operateBodies = this.operateBodies
      .slice(0, index + 1)
      .concat([body])
      .concat(this.operateBodies.slice(index + 1));
    return this;
  }

  public remove(index: number = this.operateBodies.length - 1): ImagesManager {
    this.operateBodies = this.operateBodies.slice(0, index)
      .concat(this.operateBodies.slice(index + 1));
    return this;
  }

  public getBodies(): OperateBit[] {
    return this.operateBodies;
  }
}
