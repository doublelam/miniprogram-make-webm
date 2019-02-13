import { confidenceCoppy, getAppData, reverseList } from "../../common/common-funcs";
import { ImagesManager } from "../../common/images-manager";
import { WxCloud } from "../../common/WxCloud";
const SASS = require("./index.sass");
const WXML = require("./index.wxml");
const JSONFILE = require("./index.json");

interface IndexData {
  imageSrc?: string;
  starInfo?: {
    conCoppy: string;
    confidence: number;
    name: string;
    url: string;
    face_rectangle: { top: number, left: number, width: number, height: number } | null;
  };
  selfAnimation?: wx.Animation;
  starAnimation?: wx.Animation;
  descAnimation?: wx.Animation;
  showPopup?: boolean;
  ifAnimated?: string;
  showAD?: boolean;
  mergeImg?: { show: boolean, base64: string };
}
const KEYS_INFO = {
  api_key: "g59sAr8tmZBK4LgGBLtpY_3VRYPldTqu",
  api_secret: "sQOhT09otoRZLVRol7QZ0nG_QMNbYUTS",
};

class IndexPage implements IPage<IndexData> {
  public data: IndexData;
  private detected: boolean;
  private clickNum: number = 0;
  constructor() {
    this.data = {
      descAnimation: wx.createAnimation({}),
      ifAnimated: "",
      imageSrc: "",
      mergeImg: { show: false, base64: "" },
      selfAnimation: wx.createAnimation({}),
      showPopup: false,
      starAnimation: wx.createAnimation({}),
      starInfo: {
        conCoppy: "",
        confidence: 0,
        face_rectangle: null,
        name: "",
        url: "",
      },
    };
    this.detected = false;
  }

  public onShareAppMessage() {
    return {
      title: "查找和你最像的明星",
    };
  }

  public onReady(): void {
    this.showSelfImg(0);
  }

  public onChooseImg(e): void {
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      success: res => {
        console.log(res);
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          imageSrc: tempFilePaths[0],
        });
      },
    });
    this.showSelfImg();
    this.detected = false;
  }

  public previewImgs(e): void {
    const IMG_LIST = [this.data.imageSrc, this.data.starInfo.url];
    const ORIGIN_MAP = {
      selfImg: IMG_LIST[0],
      starImg: IMG_LIST[1],
    };
    wx.previewImage({
      current: ORIGIN_MAP[e.currentTarget.dataset.origin],
      urls: IMG_LIST,
    });
  }

  public onAbout(): void {
    this.setData({
      showPopup: true,
    });
  }

  public hidePopup(): void {
    this.setData({
      showPopup: false,
    });
  }

  public coppyToClipBoard(e): void {
    console.log(e);
    const text = e.currentTarget.dataset.coppyText;
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: "已复制",
        });
      },
    });
  }

  public clickAvatar(): void {
    if (this.clickNum >= 2) {
      this.animateAvatar();
      return;
    }
    this.clickNum = this.clickNum + 1;
  }

  public compareStart(e): void {
    if (this.detected || !this.data.imageSrc) {
      wx.showModal({
        content: "请先选择一张图片",
        title: "温馨提示",
      });
      return;
    }
    wx.showLoading({
      mask: true,
      title: "检测中...",
    });
    const tempPath = this.data.imageSrc;
    this.searchFromFacePlusPlus(tempPath).then(data => {
      console.log("---data", data)
      let info;
      let face;
      try {
        info = JSON.parse(data.data).results[0];
        face = JSON.parse(data.data).faces[0];
        this.setStarInfo(info, face, () => {
          wx.hideLoading();
          this.showStarImg();
          this.detected = true;
        });
      } catch (e) {
        console.log("error", e);
        this.handleDetectErr();
        info = {};
      }
      console.log("info", info);
    }).catch(_ => {
      this.handleDetectErr();
    });
  }

  public mergeStart(e): void {
    if (!this.detected) {
      wx.showModal({
        content: "请先匹配出和图片最相似的明星",
        title: "温馨提示",
      });
      return;
    }
    wx.showLoading({
      mask: true,
      title: "正在融合中，请稍候...",
    });
    const tempPath = this.data.imageSrc;
    this.mergeFaces(tempPath).then(data => {
      wx.hideLoading();
      let result;
      try {
        result = JSON.parse(data.data).result;
      } catch (e) {
        this.handleMergeErr();
      }
      this.setData({
        mergeImg: {
          base64: `data:image/jpg;base64,${result}`,
          show: true,
        },
      });
    }).catch(() => {
      this.handleMergeErr();
    });
  }

  public previewMergedImg(): void {
    if (!this.data.mergeImg.base64) {
      return;
    }
    wx.previewImage({
      urls: [this.data.mergeImg.base64],
    });
  }

  public cancelMergeImage(): void {
    this.setData({
      mergeImg: {
        base64: "",
        show: false,
      },
    });
  }

  private animateAvatar() {
    this.setData({
      ifAnimated: "avatar-animate",
    });
  }

  private handleDetectErr(): void {
    wx.showModal({
      confirmText: "OKAY👌",
      content: "识别不了呀，可能是因为图片太抽象，换个试试？",
      showCancel: false,
      title: "温馨提示",
    });
    wx.hideLoading();
  }

  private handleMergeErr(): void {
    wx.showModal({
      confirmText: "OKAY👌",
      content: "额... 融合失败了，换张图片试试？",
      showCancel: false,
      title: "温馨提示",
    });
    wx.hideLoading();
  }

  private setStarInfo(info, face, callback?) {
    this.setData({
      starInfo: {
        ...info,
        ...face,
        conCoppy: confidenceCoppy(info.confidence),
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

  private mergeFaces(path: string): Promise<any> {
    const { url, face_rectangle: fr } = this.data.starInfo;
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        filePath: path,
        formData: {
          ...KEYS_INFO,
          faceset_token: "482fbdc115f2cc238f814def5e05c7bb",
          merge_url: url,
          template_rectangle: `${fr.top},${fr.left},${fr.width},${fr.height}`,
        },
        name: "template_file",
        success: res => {
          if (res.statusCode === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        },
        url: "https://api-cn.faceplusplus.com/imagepp/v1/mergeface",
      });
    });
  }

  private showSelfImg(duration = 300) {
    const selfAni = wx.createAnimation({});
    const starAni = wx.createAnimation({});
    const descAni = wx.createAnimation({});
    selfAni.width("80%").rotateY(0).step({ duration });
    starAni.opacity(0).scale(0).width(0).rotateY(0).step({ duration });
    descAni.opacity(0).rotate(0).scale(1).step({ duration });
    this.setData({
      descAnimation: descAni.export(),
      selfAnimation: selfAni.export(),
      starAnimation: starAni.export(),
    });
    this.setData({
      showAD: false,
    });
  }

  private showStarImg() {
    const selfAni = wx.createAnimation({});
    const starAni = wx.createAnimation({});
    const descAni = wx.createAnimation({});
    selfAni.width("30%").rotateY(15).step({ duration: 300 });
    starAni.opacity(1).scale(1).width("70%").rotateY(-15).step({ duration: 300 });
    descAni.opacity(.8).rotate(-15).scale(1.5).step({ duration: 300 });
    this.setData({
      descAnimation: descAni.export(),
      selfAnimation: selfAni.export(),
      starAnimation: starAni.export(),
    });
    this.setData({
      showAD: true,
    });

  }

}

interface IndexPage {
  setData(data: IndexData, callback?: () => void): void;
}

Page(new IndexPage());
