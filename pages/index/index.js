// index.js
// 获取应用实例
let websocket = require('./../js/websocket.js')
const { request } = require('../../utils/request.js')
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    roomList: [],
    show: false,
    httpsInfo: '',
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    typeShow: false,
    typeText: '游戏',
    typeList: [
      { name: '游戏' }, { name: '学习' }, { name: '聊天'}, { name: '其他' }
    ],
    createName: '',
    createDesc: '',
    message: 0
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../circle/circle'
    })
  },
  onLoad() {
    this.initList()
    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    // setInterval(() => {
    //   this.setData({
    //     message: websocket.message()
    //   })
    // }, 200)
  },
  initList() {
    const list = [
      {name: '阿瓦隆', desc: '一起来玩吧', host: 'zj', member: '2/14', topImg: '/image/awl.jpg'},
      {name: '麻将', desc: '四缺一', host: 'lzming', member: '3/4', topImg: '/image/star.jpg'},
      {name: '原神', desc: '一起来玩吧', host: 'lzming', member: '21/40', topImg: '/image/ys.jpg'},
      {name: '永劫无间', desc: '一起来玩吧', host: 'neteasy', member: '1/99', topImg: '/image/yjwj.jpg'},
      {name: '聊天', desc: '一起来聊吧', host: 'other', member: '15/30', topImg: '/image/star.jpg'},
    ]
    this.setData({
      roomList: list
    })
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('res', res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onCreate(){
    if(wx.getStorageSync('userInfo')){
      this.setData({
        userInfo: wx.getStorageSync('userInfo'),
        hasUserInfo: true,
        show: true,
        createName: `${wx.getStorageSync('userInfo').nickName}的小圈子`,
        createDesc: '一起来玩吧'
      })
      const msg = {
        serviceAPI: 'UpdateUserInfoRequest',
        userInfo: {
          nickname: wx.getStorageSync('userInfo').nickName,
          avatar: wx.getStorageSync('userInfo').avatarUrl,
          gender: 0
        }
      }
      websocket.socketApi(msg)

    }else{
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log('userInfo', res)
          wx.setStorageSync('userInfo', res.userInfo)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            show: true,
            createName: `${res.userInfo.nickName}的小圈子`,
            createDesc: '一起来玩吧'
          })
        }
      })
    }
  },
  onClose() {
    this.setData({ show: false });
  },
  onConfirm(){
    this.setData({ show: false });
  },
  bindTypeTap(){
    this.setData({ typeShow: true });
  },
  onSelectType(e){
    this.setData({
      typeText: e.detail.name,
      typeShow: false
    })
  },
  bindTypeCancel(){
    this.setData({
      typeShow: false
    })
  },
  bindTypeOverlay(){
    this.setData({
      typeShow: false
    })
  }
})
