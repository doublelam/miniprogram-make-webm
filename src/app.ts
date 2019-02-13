const JSON_CON = require("./app.json");
App({
  data: {
    backgroundColor: "#607d8b",
  },

  onLaunch: () => {
    wx.cloud.init({env: "face-3915fb"});
  },

});
