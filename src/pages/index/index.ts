import { CanvasDrawable } from "../../common/canvas-draw";
import { getAppData } from "../../common/common-funcs";
import { ImagesManager } from "../../common/images-manager";
const SASS = require("./index.sass");
const WXML = require("./index.wxml");

interface IndexData {
  menuBtnColor?: string;
  tabItemIndex?: number;
  tabItems?: Array<{
    name: string;
    btns: Array<{ title?: string; class?: string; bindTapMethod?: string; style?: string; type?: string; }>
  }>;
  durationDu?: number;
  pageIndex?: number;
  canvasAnimation?: wx.Animation;
  roundDuration?: number;
}

class IndexPage implements IPage<IndexData> {
  public data: IndexData;
  private drawCan: CanvasDrawable;
  private imagesManager: ImagesManager;
  private canvasRect: Rect;
  private canvasContext: wx.CanvasContext;
  constructor() {
    this.initData();
    this.initManager();
  }

  public onReady(): void {
    const context = wx.createCanvasContext("canvas");
    this.drawCan = new CanvasDrawable(context);
    this.initStyles();
    this.initReact();
  }

  public onTouchStart(e): void {
    this.drawCan.touchStart(e);
  }

  public onTouchMove(e): void {
    this.drawCan.touchMove(e);
  }

  public changeTabItem(e): void {
    const { current } = e.detail;
    this.setData({
      tabItemIndex: current,
    });
  }

  public viewTabItem(e): void {
    const { type } = e.currentTarget.dataset;
    console.log("tap more", new Date().getTime());
    if (type === "preview") {
      const updatedIndex = this.data.tabItemIndex - 1;
      this.setData({
        tabItemIndex: updatedIndex <= 0 ? 0 : updatedIndex,
      });
      return;
    }
    if (type === "next") {
      const updatedIndex = this.data.tabItemIndex + 1;
      this.setData({
        tabItemIndex: updatedIndex,
      });
      return;
    }
    return;
  }

  // Manage images on buttons: previous
  public pagePrevious(): void {
    if (this.data.pageIndex <= 0) {
      return;
    }
    this.preserveCurrent(data => {
      const previousPage = this.data.pageIndex - 1;
      this.setData({
        durationDu: this.imagesManager.getBodies()[previousPage].duration,
        pageIndex: previousPage,
      }, () => {
        // this.repaintInPage();
      });
    });
  }
  // Manage images on buttons: next
  public pageNext(): void {
    if (this.data.pageIndex >= this.imagesManager.getBodies().length - 1) {
      return;
    }
    this.preserveCurrent(data => {
      const nextPage = this.data.pageIndex + 1;
      this.setData({
        durationDu: this.imagesManager.getBodies()[nextPage].duration,
        pageIndex: nextPage,
      }, () => {
        // this.repaintInPage();
        console.log("__manager", this.imagesManager);
      });
    });
  }

  public addOneBlank(): void {
    this.clearAndInsert();
  }

  public roundLeft(): void {
    const duration = this.data.roundDuration;
    const ani = wx.createAnimation({
      delay: 100,
      duration,
      timingFunction: "linear",
    });
    ani.rotate(90).step({
      delay: 100,
      duration,
      timingFunction: "linear",
    });
    this.setData({
      canvasAnimation: ani.export(),
    });
  }

  private clearAndInsert(): void {
    this.clearAll().then(rect => {
      console.log("getimg", new Date().getTime());
      this.getImageFromCanvas(data => {
        // this.imagesManager.insert(this.data.pageIndex, {
        //   duration: this.data.durationDu,
        //   imageBase64: data,
        // });
        console.log("getimg end", new Date().getTime());
        this.setData({
          pageIndex: this.data.pageIndex + 1,
        });
      });
    });
  }

  private initData(): void {
    this.data = {
      canvasAnimation: wx.createAnimation(),
      durationDu: 20,
      menuBtnColor: "#fff",
      pageIndex: 0,
      roundDuration: 1000,
      tabItemIndex: 0,
      tabItems: [
        {
          btns: [
            { title: "left", class: "fas fa-angle-left", bindTapMethod: "roundLeft" },
            { title: "right", class: "fas fa-angle-right", bindTapMethod: "pageNext" },
            { title: "add", class: "fas fa-plus", bindTapMethod: "addOneBlank" },
            {
              bindTapMethod: "viewTabItem",
              class: "fas fa-ellipsis-v",
              style: "flex: none; width: 15vw; justify-self: start",
              title: "more",
              type: "next",
            },
          ],
          name: "bottomBtns",
        },
        {
          btns: [
            { title: "left", class: "fas fa-home" },
            { title: "add", class: "fas fa-play-circle" },
            { title: "play", class: "fas fa-cog" },
          ],
          name: "secondaryBtns",
        },
      ],
    };
  }

  private initStyles(): void {
    const appBackgroundColour = getAppData().backgroundColor;
    this.setData({
      menuBtnColor: appBackgroundColour,
    });
  }

  private initReact(): void {
    this.canvasContext = wx.createCanvasContext("canvas");
    const getRect = (): Promise<Rect> => new Promise(resolve => {
      const query = wx.createSelectorQuery();
      query.select("#canvas").boundingClientRect(rect => {
        resolve(rect);
      }).exec();
    });
    getRect().then(rect => {
      this.canvasRect = rect;
    });
  }

  private initManager(): void {
    this.imagesManager = new ImagesManager();
  }

  // Preserve current image
  private preserveCurrent(callback?: (val?) => any): void {
    const pageIndex = this.data.pageIndex;
    this.getImageFromCanvas(data => {
      this.imagesManager.resignBody(pageIndex, {
        duration: this.data.durationDu,
        imageBase64: data,
      });
      if (callback) {
        callback.call(this, data);
      }
    });
  }

  private getImageFromCanvas(callback?: (data) => any): void {
    const { width, height } = this.canvasRect;
    console.log("img width", width, height);
    wx.canvasGetImageData({
      canvasId: "canvas",
      height,
      success: res => {
        // const base64 = wx.arrayBufferToBase64(new Uint8Array(res.data) as any);
        const d = 333 * 77;
        console.log("brefore resolve", d, new Date().getTime());
        if (callback) {
          console.log("callback", new Date().getTime());
          callback(res);
        }
      },
      width,
      x: 0,
      y: 0,
    }, this);

  }

  private clearAll(): Promise<Rect> {
    return new Promise(resolve => {
      const { width, height } = this.canvasRect;
      this.canvasContext.clearRect(0, 0, width, height);
      this.canvasContext.draw();
      resolve(this.canvasRect);
    });
  }
}

interface IndexPage {
  setData(data: IndexData, callback?: () => void): void;
}

Page(new IndexPage());
