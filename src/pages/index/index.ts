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
}

class IndexPage implements IPage<IndexData> {
  public data: IndexData;
  private drawCan: CanvasDrawable;
  private imagesManager: ImagesManager;
  constructor() {
    this.data = {
      menuBtnColor: "#fff",
      pageIndex: 0,
      tabItemIndex: 0,
      tabItems: [
        {
          btns: [
            { title: "left", class: "fas fa-angle-left", bindTapMethod: "preserveCurrent" },
            { title: "right", class: "fas fa-angle-right" },
            { title: "add", class: "fas fa-plus" },
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

  public onReady(): void {
    const context = wx.createCanvasContext("canvas");
    this.drawCan = new CanvasDrawable(context);
    this.initStyles();
  }

  public onTouchStart(e): void {
    this.drawCan.touchStart(e);
  }

  public onTouchMove(e): void {
    this.drawCan.touchMove(e);
  }

  public viewTabItem(e): void {
    const { type } = e.currentTarget.dataset;
    const { current } = e.detail;
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
    this.setData({
      tabItemIndex: current,
    });
    return;
  }

  // Manage images on buttons
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

  private initStyles(): void {
    const appBackgroundColour = getAppData().backgroundColor;
    this.setData({
      menuBtnColor: appBackgroundColour,
    });
  }

  // Preserve current image
  private preserveCurrent(callback?: (val?) => any): void {
    const pageIndex = this.data.pageIndex;
    this.getImageFromCanvas().then(data => {
      this.imagesManager.resignBody(pageIndex, {
        duration: this.data.durationDu,
        imageBase64: data,
      });
      return data;
    }).then(data => {
      if (callback) {
        callback.call(this, data);
      }
    });
  }

  private getImageFromCanvas(): Promise<string> {
    const getRect: Promise<Rect> = new Promise(resolve => {
      const query = wx.createSelectorQuery();
      query.select("#canvas").boundingClientRect(rect => {
        resolve(rect);
      }).exec();
    });
    return new Promise(resolve => {
      getRect.then(rect => {
        const {width, height} = rect;
        wx.canvasGetImageData({
          canvasId: "canvas",
          height,
          success: res => {
            // const base64 = wx.arrayBufferToBase64();
            // resolve(base64);
          },
          width,
          x: 0,
          y: 0,
        }, this);
      });
    });
  }

}

interface IndexPage {
  setData(data: IndexData, callback?: () => void): void;
}

Page(new IndexPage());
