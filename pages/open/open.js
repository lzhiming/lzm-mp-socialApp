// logs.js
const util = require('../../utils/util.js')
let websocket = require('./../js/websocket.js')
Page({
  data: {
    msg: 'hello',
    countdown: 3,
    downTimer: null,
    switchTimer: null
  },
  onLoad() {
    this.data.downTimer = setInterval(() => {
      let count = this.data.countdown
      console.log('downTimer')
      this.setData({
        countdown: --count
      })
    }, 1000);

    this.data.switchTimer = setTimeout(() => {
      console.log('switch')
      clearInterval(this.data.downTimer)
      wx.switchTab({
        url: '../activitys/activitys'
      })
    }, 3000)
  },
  goAct() {
    clearTimeout(this.data.switchTimer)
    clearInterval(this.data.downTimer)
    wx.switchTab({
      url: '../activitys/activitys'
    })
  }
})
