// index.js
let websocket = require('./../js/websocket.js')
const { request } = require('../../utils/request.js')
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    allImg: []
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
  }
})
