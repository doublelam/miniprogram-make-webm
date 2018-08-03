import { ifMobile } from "./judge-end";
import { Coordination, PointMode, StrikeStyle } from "./type";
export class CanvasDrawable {
  private canvasContext: wx.CanvasContext;
  private pointStyle: StrikeStyle;
  private lastPoint: Coordination = [0, 0];
  private lastEndPoint: Coordination = [0, 0];
  private paddingAndBorder: Coordination = [0, 0];
  private domPosition: Coordination = [0, 0];
  private drawScale: number = 1;
  private pointMode: PointMode = "DRAW";
  private innerWidthAndHeight: Coordination = [0, 0];
  private eraseThickness: number = 10;
  constructor(canvasContext: wx.CanvasContext, opt: StrikeStyle = {
    color: "rgba(0,0,0,.5)",
    width: 1,
  }) {
    this.canvasContext = canvasContext;
    this.pointStyle = opt;
    // this.bandMethods();
    // this.getCanvasPaddingAndBorder(canvasContext);
  }

  public native(type: string, ...opt): CanvasDrawable {
    this.canvasContext[type](...opt);
    return this;
  }

  public nativeContext(): wx.CanvasContext {
    return this.canvasContext;
  }

  public setStyle(option: StrikeStyle): CanvasDrawable {
    this.pointStyle = {
      ...this.pointStyle,
      ...option,
    };
    return this;
  }

  public getStyle(): StrikeStyle {
    return this.pointStyle;
  }

  public cleanAll() {
    this.canvasContext.clearRect(0, 0, this.innerWidthAndHeight[0], this.innerWidthAndHeight[1]);
  }

  // public getCanvasBase64(...args): string {
  //   return this.canvasContext.canvas.toDataURL(...args);
  // }

  // public getCanvasBlob(...args): Promise<Blob> {
  //   return new Promise((resolve, reject) => {
  //     this.canvasContext.canvas.toBlob((blob: Blob) => {
  //       resolve(blob);
  //     }, ...args);
  //   });
  // }

  public enerase(thickness?: number): CanvasDrawable {
    if (thickness) {
      this.eraseThickness = thickness;
    }
    this.pointMode = "ERASE";
    return this;
  }

  public endraw(): CanvasDrawable {
    this.pointMode = "DRAW";
    return this;
  }

  public touchStart(e) {
    const reCoordinate = this.recalculateCoordination([e.touches[0].x, e.touches[0].y]);
    this.touched(reCoordinate[0], reCoordinate[1]);
  }

  public touchMove(e) {
    const reCoordinate = this.recalculateCoordination([e.touches[0].x, e.touches[0].y]);
    this.moveWhenErase(reCoordinate[0], reCoordinate[1], this.eraseThickness);
    this.moveWhenDraw(reCoordinate[0], reCoordinate[1]);
  }

  private setCanvasStroke(): void {
    this.canvasContext.setStrokeStyle(this.pointStyle.color);
    this.canvasContext.setLineWidth(this.pointStyle.width);
  }

  // private getCanvasPaddingAndBorder(canvasContext: CanvasRenderingContext2D): void {
  //   const styles = getComputedStyle(canvasContext.canvas);
  //   const canvasRect = canvasContext.canvas.getBoundingClientRect();
  //   this.domPosition = [canvasRect.left, canvasRect.top];
  //   this.paddingAndBorder = [
  //     parseFloat(styles.paddingLeft) + parseFloat(styles.borderLeftWidth),
  //     parseFloat(styles.paddingTop) + parseFloat(styles.borderTopWidth),
  //   ];
  //   this.innerWidthAndHeight = [
  //     this.canvasContext.canvas.clientWidth,
  //     this.canvasContext.canvas.clientHeight,
  //   ];
  // }
  private recalculateCoordination(coordinate: Coordination): Coordination {
    return [
      coordinate[0] - this.domPosition[0] - this.paddingAndBorder[0],
      coordinate[1] - this.domPosition[1] - this.paddingAndBorder[1],
    ];
  }

  private touched(x: number, y: number): void {
    this.lastPoint = [x, y];
    this.lastEndPoint = [x, y];
    this.setCanvasStroke();
  }

  private moveWhenErase(x: number, y: number, width: number = 10): void {
    if (this.pointMode !== "ERASE") {
      return;
    }
    const halfSide: number = width / 2;
    const startPoint: Coordination = [x - halfSide, y - halfSide];
    this.canvasContext.clearRect(startPoint[0], startPoint[1], width, width);
  }

  private moveWhenDraw(x: number, y: number, scale = this.drawScale): void {
    if (this.pointMode !== "DRAW") {
      return;
    }
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(this.lastEndPoint[0], this.lastEndPoint[1]);
    const endPoint: [number, number] = [
      (x - this.lastPoint[0]) * scale + this.lastEndPoint[0],
      (y - this.lastPoint[1]) * scale + this.lastEndPoint[1],
    ];
    this.canvasContext.lineTo(
      endPoint[0],
      endPoint[1],
    );
    this.canvasContext.stroke();
    this.canvasContext.draw(true);
    // this.canvasContext.closePath();
    this.lastPoint = [x, y];
    this.lastEndPoint = endPoint;
  }

}
