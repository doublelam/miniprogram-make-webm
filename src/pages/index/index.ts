import { CanvasDrawable } from "../../common/canvas-draw";
import { getAppData } from "../../common/common-funcs";
import { ImagesManager } from "../../common/images-manager";
const SASS = require("./index.sass");
const WXML = require("./index.wxml");

interface IndexData {
  imageSrc?: string;
  starInfo?: {
    confidence: number;
    name: string
    url: string
  };
}
const KEYS_INFO = {
  api_key: "g59sAr8tmZBK4LgGBLtpY_3VRYPldTqu",
  api_secret: "sQOhT09otoRZLVRol7QZ0nG_QMNbYUTS",
};

class IndexPage implements IPage<IndexData> {
  public data: IndexData;
  constructor() {
    this.data = {
      imageSrc: "",
      starInfo: {
        confidence: 0,
        name: "",
        url: "",
      },
    };
  }

  public onChooseImg(e): void {
    wx.chooseImage({
      count: 1,
      success: res => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          imageSrc: tempFilePaths[0],
        });
      },
    });
  }

  public compareStart(e): void {
    const tempPath = this.data.imageSrc;
    this.searchFromFacePlusPlus(tempPath).then(data => {
      let info;
      try {
        info = JSON.parse(data.data).results[0];
        this.setStarInfo(info);
      } catch (e) {
        console.log("error", e);
        wx.showModal({
          confirmText: "OKEY👌",
          content: "识别不了呀，可能是因为头像太抽象，换个试试？",
          showCancel: false,
          title: "Tip:",
        });
        info = {};
      }
      console.log("info", info);
    });
  }

  private setStarInfo(info, callback?) {
    this.setData({
      starInfo: {
        ...info,
        name: info.user_id.split("::")[0],
        url: info.user_id.split("::")[1],
      },
    }, () => {
      if (typeof callback === "function") {
        callback();
      }
    });
  }

  private searchFromFacePlusPlus(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        filePath: path,
        formData: {
          ...KEYS_INFO,
          faceset_token: "482fbdc115f2cc238f814def5e05c7bb",
        },
        name: "image_file",
        success: res => {
          if (res.statusCode === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        },
        url: "https://api-cn.faceplusplus.com/facepp/v3/search",
      });
    });
  }
}

interface IndexPage {
  setData(data: IndexData, callback?: () => void): void;
}

Page(new IndexPage());
