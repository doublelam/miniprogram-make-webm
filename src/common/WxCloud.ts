export class WxCloud {
  public static cFun(opt: wx.CallFuncOpt): Promise<{result: any}> {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        ...opt,
        fail: error => {
          reject(error);
        },
        success: data => {
          resolve(data);
        },
      });
    });
  }

  public static uploadFile(opt: wx.UploadFileOpt): Promise<{fileID: string}> {
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        ...opt,
        fail: e => {
          reject(e);
        },
        success: data => {
          resolve(data);
        },
      });
    });
  }
}
