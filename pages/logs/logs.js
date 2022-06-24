// logs.js
const util = require('../../utils/util.js')
let websocket = require('./../js/websocket.js')
import moment from 'moment'

Page({
  data: {
    date: '',
    calendarDate: new Date().getTime(),
    show: false,
    logArray: [],
    formatter(day) {
      return day;
    },
    showCreate: false,
    activityDesc: {
      desc: '123',
      time: '11:25~12:25',
      count: 20
    },
    allImg: [],
    myreply: '',
    focusInput: false,
    memberLimit: 0,
    current: 0,
    members: [],
    nickName: '',
    avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKroOPzp2Yib0byD8icz3nrS2AQrj9hqHUyFLOcKsyzenLqgYPjMgoAE3TetlVUgUH48PoOKdXsr8Hg/132',
    title: 'Title',
    content: '描述',
    publishOn: '2022-02-22 15:24',
    activityId: '0',
    openId: '1',
    hadJoined: false
  },
  onDisplay() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  getAct(options) {
    const listOption = {
      activityId: options.id,
      labels: {
        category: 10000,
        location: 310000
      }
    }
    const msg = {
      serviceAPI: 'GetActivityRequest',
      data: {
        listOption
      }
    }
    websocket.socketApi(msg)
  },
  onLoad(options) {
setTimeout(()=> {
  this.setData({
    activityId: options.id
  })
  
  this.getAct(options)
  this.getMember(options.id)
  let that = this
  function newMs(onmsg, response){
    if(onmsg.serviceAPI === "GetActivityResponse"){
      console.log('response', response)
      const act = response.activity
      let allImg = []
      for(let imgIndex in act.pictures){
        allImg.push({
          id: imgIndex, src: act.pictures[imgIndex]
        })
      }
      const publishOn = moment(act.publishOn * 1000).format('YYYY-MM-DD HH:mm')
      that.setData({
        title: act.title,
        allImg,
        content: act.content,
        publishOn,
        memberLimit: act.event.maxMember,
        current: act.event.current,
        avatar: act.ownerReference.avatar,
        nickName: act.ownerReference.nickname
      })
    }
    if(onmsg.serviceAPI === "JoinActivityResponse"){
      that.getMember(that.data.activityId)
    }
    if(onmsg.serviceAPI === "ListMembersResponse"){
      const allMem = response.members.members
      that.setData({
        members: allMem,
        current: allMem.length,
      })
      const openid = wx.getStorageSync('openId')
      let findme = allMem.findIndex(val => {
        return val.openId === openid
      })
      if(findme >= 0){
        that.setData({ hadJoined: true })
      }else{
        that.setData({ hadJoined: false })
      }
      setTimeout(() => {
        that.getMember(that.data.activityId)
      }, 300)
    }
    if(onmsg.serviceAPI === "LeaveActivityResponse"){
      console.log('LeaveActivityResponse', response)
    }
    
  }
  websocket.message(newMs)

  this.setData({
    date: this.formatDate(new Date())
  })
  this.initList()
  this.setData({
    formatter: (day) => {
      const date = day.date.getDate();
      if (date === 7) {
        day.className = 'has-log';
        day.bottomInfo = '-'
      }
      return day;
    }
  })
}, 200)
  },
  initList(){
    let hourList = []
    let hour = 0
    while(hour <= 23){
      if(hour < 10){
        hourList.push(
          {time: `0${hour}:00`, member: []}
        )
      }else{
        hourList.push(
          {time: `${hour}:00`, member: []}
        )
      }
      hour++
    }
    this.setData({
      logArray: hourList
    })
  },
  onShareAppMessage(){
    return {
      title: this.data.title,
      desc: '',
      path: 'pages/logs/logs?id=' + this.data.activityId
    }
  },
  getUser(){
    const msg = {
      serviceAPI: 'GetUserInfoRequest',
      data: {}
    }
    websocket.socketApi(msg)
  },

  joinAct(){
    const activityId = this.data.activityId
    const msg = {
      serviceAPI: 'JoinActivityRequest',
      data: {
        getOption: {
          labels: {
            category: 10000,
            location: 310000
          },
          activityId
        }
      }
    }
    console.log('msg', msg)
    websocket.socketApi(msg)
  },
  leaveAct(){
    const activityId = this.data.activityId
    const msg = {
      serviceAPI: 'LeaveActivityRequest',
      data: {
        getOption: {
          labels: {
            category: 10000,
            location: 310000
          },
          activityId
        }
      }
    }
    websocket.socketApi(msg)
  },
  getMember(activityId){
    const msg = {
      serviceAPI: 'ListMembersRequest',
      data: {
        getOption: {
          labels: {
            category: 10000,
            location: 310000
          },
          activityId
        }
      }
    }
    console.log('member', msg)
    websocket.socketApi(msg)
  },


  dateRight(){
    this.skipDate(1)
  },
  dateLeft(){
    this.skipDate(-1)
  },
  skipDate(num) {
    const nowTs = this.data.calendarDate
    const newTs = Number(moment(nowTs).add(num, 'd').format('x'))
    this.setData({
      date: this.formatDate(newTs),
      calendarDate: newTs
    })
  },
  formatDate(ts) {
    let date = new Date(ts);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}`;
  },
  onConfirm(event) {
    this.setData({
      show: false,
      date: this.formatDate(event.detail),
      calendarDate: event.detail.getTime()
    });
  },
  onCreate(){
    this.setData({
      showCreate: true,
    });
  },
  confirmCreate(){
    console.log('create', this.data.activity);
  },
  closeCreate(){

  },
  replyTap(){
    this.setData({
      focusInput: true,
    })
  },
  blurTap(){
    this.setData({
      focusInput: false,
    })
  }

})
