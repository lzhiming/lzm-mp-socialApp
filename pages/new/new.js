const util = require('../../utils/util.js')
let websocket = require('./../js/websocket.js')
let encoding = require("./../js/encoding.js");
import moment from 'moment'
import * as proto from "./../../proto/proto";
// proto 自定义
const protoApi = proto
Page({
  data: {
    title: '',
    fileList: [],
    columns: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    desc: '',
    typevalue: 0,
    typeoptions: [],
    showType: false,
    memberLimit: 1,
    selectedTag: '推荐',
    region: ['上海市', '上海市', '徐汇区'],
    customItem: '全部',
    currentDate: '2022-03-03',
    startTime: '12:01',
    endTime: '12:01',
    descFocus: false,
    isTeam: false,
    isTeamUp: false,
    webmsg: ''
  },
  onLoad() {
    let that = this
    const ListLabels = JSON.parse(wx.getStorageSync('ListLabels'))
    let itemList = []
    for(let catI in ListLabels.categories.items){
      itemList.push({
        text: ListLabels.categories.items[catI],
        value: catI
      })
    }
    this.setData({
      typeoptions: itemList
    })
    // function newMs(onmsg){
    //   that.setData({
    //     webmsg: onmsg
    //   })
    //   console.log('newMs', that.data)
    // }
    // websocket.message(newMs)
  },
  afterRead(event) {
    const { file } = event.detail;
    const maxSize = 10485760
    if(file.size > maxSize){
      wx.showToast({
        title: '图片超过10mb',
        icon: 'error',
        duration: 2000
      })
    }
    const tempFileList = this.data.fileList
    const pushIndex = tempFileList.length
    tempFileList.push({
      url: file.url,
      status: 'uploading',
      message: '上传中'
    })
    this.setData({
      fileList: tempFileList
    })
    let that = this
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    console.log('file', file)
    wx.uploadFile({
      url: 'https://www.lllidancloud.com:30583/upload', // 仅为示例，非真实的接口地址
      filePath: file.url,
      name: 'file',
      formData: { user: 'test' },
      success(res) {
        console.log('res',res)
        let successList = that.data.fileList
        if(res.statusCode === 200){
          successList[pushIndex].status = ''
          const ab = new encoding.TextEncoder().encode(res.data)
          const result = protoApi.Response.decode(ab)
          const response = protoApi.UploadImageResponse.decode(result.data)
          successList[pushIndex].imageName = response.imageName
        }else{
          successList[pushIndex].status = 'failed'
        }
        console.log('successList', successList)
        that.setData({
          fileList: successList
        })
        // 上传完成需要更新 fileList
      },
    });
  },
  imageDel(event) {
    console.log('event', event)
    let imgs = this.data.fileList
    imgs.splice(event.detail.index, 1)
    this.setData({
      fileList: imgs
    })
  },
  onCheck(){
    if(wx.getStorageSync('userInfo')){
      const msg = {
        serviceAPI: 'UpdateUserInfoRequest',
        data: {
          userInfo: {
            nickname: wx.getStorageSync('userInfo').nickName,
            avatar: wx.getStorageSync('userInfo').avatarUrl,
            gender: 0
          }
        }
      }
      websocket.socketApi(msg)
    }else{
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          wx.setStorageSync('userInfo', res.userInfo)
          const msg = {
            serviceAPI: 'UpdateUserInfoRequest',
            data: {
              userInfo: {
                nickname: wx.getStorageSync('userInfo').nickName,
                avatar: wx.getStorageSync('userInfo').avatarUrl,
                gender: 0
              }
            }
          }
          websocket.socketApi(msg)
        }
      })
    }
  },
  onCreate(){
    if(!wx.getStorageSync('userInfo')){
      this.onCheck()
      return
    }
    let pictures = []
    for(let { imageName } of this.data.fileList){
      pictures.push(imageName)
    }
    const typeOpt = this.data.typeoptions
    const typeIndex = typeOpt.findIndex(val => {
      return val.text === this.data.selectedTag
    })
    let startOn = 1646468033, endOn = 1646469033
    startOn = Number(moment(`${this.data.currentDate} ${this.data.startTime}`).format('X'))
    endOn = Number(moment(`${this.data.currentDate} ${this.data.endTime}`).format('X'))
    let activity = {
      labels: {
        category: Number(typeOpt[typeIndex].value),
        location: 310000,
      },
      title: this.data.title,
      content: this.data.desc,
      pictures,
      event: {
        maxMember: Number(this.data.memberLimit),
        startOn,
        endOn
      }
    }
    if(!this.data.isTeam){
      delete activity.event
    }
    const msg = {
      serviceAPI: 'CreateActivityRequest',
      data: {
        activity
      }
    }
    console.log('msg', msg)
    wx.showToast({
      title: '创建中',
      icon: 'loading',
      mask: true,
      duration: 3000
    })
    websocket.socketApi(msg)
  },
  showTypePopup(){
    this.setData({ showType: true });
  },
  tapTypeChange(e){
    this.setData({ selectedTag: e.currentTarget.dataset.text })    
  },
  onCloseType(){
    this.setData({ showType: false });
  },
  focusOn(){
    this.setData({
      descFocus: true
    })
  },

  bindDateChange(e){
    this.setData({
      currentDate: e.detail.value,
    })
  },
  startTimeChange(e){
    this.setData({
      startTime: e.detail.value,
    })
  },
  endTimeChange(e){
    this.setData({
      endTime: e.detail.value,
    })
  },
  onChangeNum(e){
    console.log('change', e)
    this.setData({
      memberLimit: Number(e.detail.value) + 1,
    })
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },

  onChangeTeam({detail}) {
    // 需要手动对 checked 状态进行更新
    this.setData({ isTeam: detail.value, isTeamUp:  detail.value});
  },
  onCloseTeamUp(){
    this.setData({ isTeamUp: false });
  },
  showTeamTab(){
    this.setData({ isTeamUp: true });
  }

})
