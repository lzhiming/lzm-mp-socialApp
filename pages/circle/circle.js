// logs.js
const util = require('../../utils/util.js')
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
    topImg: '',
    myreply: '',
    focusInput: false,
    allImg: []
  },
  onDisplay() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  onLoad() {
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
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
})
