// logs.js
const util = require('../../utils/util.js')
let websocket = require('./../js/websocket.js')
import { areaList } from './../js/areaList.js'
const zhWeek = ['一','二','三','四','五','六','日']
// const ListLabels = wx.getStorageSync('ListLabels') ? JSON.parse(wx.getStorageSync('ListLabels')) : []

import moment from 'moment'
Page({
  data: {
    dayList: [],
    scrollLeft: 0,
    hasProfile: false,
    leftList: [],
    rightList: [],
    typeList: ['圈子', '推荐', '运动', '游戏', '学习', '时尚穿搭', '音乐'],
    areaList,
    showArea: false,
    webmsg: ''
  },
  onLoad() {
    this.initDays(moment().format('X'))

    this.setData({
      scrollLeft: `730rpx`,
      needInfo: wx.getStorageSync('userInfo')
    })
    
    console.log('load')

  },
  onShow() {
    this.setData({
      leftList: [],
      rightList: []
    })
    this.getUser()
    let that = this
    function newMs(onmsg, response){
      console.log('newMs', onmsg)
      if(onmsg.serviceAPI === "ListLabelsResponse"){
        const ll = JSON.parse(wx.getStorageSync('ListLabels'))
        that.getLiet(ll.categories.default, ll.locations.default)
      }
      if(onmsg.serviceAPI === "GetUserInfoResponse"){
        wx.setStorageSync('openId', response.userInfo.openId)
      }
      if(onmsg.serviceAPI === "ListActivityResponse"){
        let leftList = that.data.leftList
        let rightList = that.data.rightList
        for (let actIndex in response.items) {
          if(actIndex % 2){
            rightList.push({
              id: response.items[actIndex].id,
              img: response.items[actIndex].pictures[0],
              title: response.items[actIndex].title,
              user: response.items[actIndex].ownerReference.nickname,
              avatar: response.items[actIndex].ownerReference.avatar,
              info: response.items[actIndex].event.maxMember ? 
              `${response.items[actIndex].event.current}/${response.items[actIndex].event.maxMember}` : '-'
            })
          }else{
            leftList.push({
              id: response.items[actIndex].id,
              img: response.items[actIndex].pictures[0],
              title: response.items[actIndex].title,
              user: response.items[actIndex].ownerReference.nickname,
              avatar: response.items[actIndex].ownerReference.avatar,
              info: response.items[actIndex].event.maxMember ? 
              `${response.items[actIndex].event.current}/${response.items[actIndex].event.maxMember}` : '-'
            })
          }
        }
        that.setData({
          leftList, rightList
        })
        console.log('response', response)
      }
      if(onmsg.serviceAPI === "CreateActivityResponse"){
        if(response.result?.isSuccess){
          setTimeout(() => {
            wx.showToast({
              title: '创建成功',
              mask: true
            })
            wx.switchTab({
              url: '../activitys/activitys'
            })
          }, 1500)
        }
      }
    }
    if(!wx.getStorageSync('ListLabels')){
      const msg = {
        serviceAPI: 'ListLabelsRequest',
        data: {}
      }
      websocket.socketApi(msg)
    }else{
      const ll = JSON.parse(wx.getStorageSync('ListLabels'))
      that.getLiet(ll.categories.default, ll.locations.default)
    }
    websocket.message(newMs)
  },
  getUser(){
    const msg = {
      serviceAPI: 'GetUserInfoRequest',
      data: {}
    }
    websocket.socketApi(msg)
  },
  scrolltolower() {
    const leftList = this.data.leftList
    const rightList = this.data.rightList
    console.log('leftList', leftList)
    let lastId = 0
    if(leftList.length > rightList.length){
      lastId = leftList[leftList.length-1].id
    }else{
      lastId = rightList[rightList.length-1].id
    }
    const listOption = {
      pageSize: 6,
      labels: { category: 10000, location: 310000},
      lastActivityId: lastId
    }

    const msg = {
      serviceAPI: 'ListActivityRequest',
      data: {
        listOption
      }
    }
    websocket.socketApi(msg)
  },
  initDays(time) {
    let days = []
    let selectedTime = moment(time*1000).format('YYYY-MM-DD')
    for(let day = -7; day < 14; day++){
      const dataMoment = moment().add(day, 'd')
      days.push({
        day: dataMoment.get('date'),
        ts: dataMoment.format('X'),
        selected: dataMoment.format('YYYY-MM-DD') === selectedTime ? true : false,
        week: day === 0 ? '今日' :`周${zhWeek[dataMoment.isoWeekday() - 1]}`
      })
    }
    this.setData({
      dayList: days
    })
  },
  onDaysChange(event){
    const time = event.currentTarget.dataset.dayTime
    this.initDays(time)
  },
  getLiet(category, location){
    const listOption = {
      pageSize: 6,
      labels: { category, location }
    }

    const msg = {
      serviceAPI: 'ListActivityRequest',
      data: {
        listOption
      }
    }
    websocket.socketApi(msg)
  },

  onCreate(){
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        wx.setStorageSync('userInfo', res.userInfo)
        const userInfo = {
          openId: '1235',
          nickname: wx.getStorageSync('userInfo').nickName,
          avatar: wx.getStorageSync('userInfo').avatarUrl,
          gender: 0
        }

        const msg = {
          serviceAPI: 'UpdateUserInfoRequest',
          data: {
            userInfo
          }
        }
        console.log('msg', msg)
        websocket.socketApi(msg)
      }
    })
  },
  bindViewTap(e) {
    wx.navigateTo({
      url: `../logs/logs?id=${e.currentTarget.dataset.actid}`
    })
  },
  onGet(){
    const msg = {
      serviceAPI: 'GetUserInfoRequest',
      data: null
    }
    websocket.socketApi(msg)
  },
  changeArea(){
    this.setData({
      showArea: true
    })
    wx.getLocation({
      type: 'wgs84', //返回可以用于wx.openLocation的经纬度
      success (res) {
        console.log('location', res)
      }
     })
  },
  onClose(){
    this.setData({ showArea: false });
  },
  addActivity(){
    wx.navigateTo({
      url: '../new/new'
    })
  }
})
