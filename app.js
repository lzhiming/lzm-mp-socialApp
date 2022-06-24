// app.js
let websocket = require('./pages/js/websocket.js')
App({
  onLaunch() {
    // 登录
    // wx.showLoading({
    //   title: '连接中',
    // })
    wx.login({
      success: res => {
        console.log('res', res)
        websocket.ws_connect((data)=>{
        }, res.code)
      }
    })
  },
  globalData: {
    userInfo: null,
    socketMessage: null
  }
})
