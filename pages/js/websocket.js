const config = require('./config.js')
var app = getApp();
let sotk = null;
let socketOpen =false;
let socketTimer = null
let socketMsg = 0

// 这里需要引用自己的proto，并做相应的修改
import * as proto from "./../../proto/proto";
const protoApi = proto

function ws_connect(reMsg, code){
  
  sotk = wx.connectSocket({
    url: config.websocketServer + code
  })

  sotk.onOpen(res => {
    socketOpen = true;
    console.log('监听 WebSocket 连接打开事件。', res);
    wx.hideLoading()
    socketTimer = setInterval(() => {
      const msg = {
        serviceAPI: 'Ping',
        data: null
      }
      const request = protoApi.Request,
      message = request.create(msg), senddata = request.encode(message).finish()
      sendMsg(senddata.slice().buffer)
    }, 2700)
    getLabels()
  })
  sotk.onClose(onClose => {
    socketOpen = false;
    clearInterval(socketTimer)
    console.log('监听 WebSocket 连接关闭事件。', onClose)
    wx.login({
      success: res => {
        ws_connect((data)=>{
        }, res.code)
      }
    })
  })
  sotk.onError(onError => {
    socketOpen = true;
    // console.log('监听 WebSocket 错误。错误信息', onError)
  })

  // 收到消息
  sotk.onMessage(onMessage => {
    const result = protoApi.Response.decode(new Uint8Array(onMessage.data))
    if(result.serviceAPI !== 'Pong'){
      // 需要进行decode
      returnMsg(result, response)
    }
  })
}

function getLabels(){
  const msg = {
    serviceAPI: 'ListLabelsRequest',
    data: {}
  }
  socketApi(msg)
}

function sendMsg(msg,success){
  if (socketOpen) {
    sotk.send({data: msg})
  }
}

function socketApi(msg){
  const requestApi = protoApi[`${msg.serviceAPI}`],
  // message = requestApi.create(msg.data), senddata = requestApi.encode(message).finish()
  // const sentMsg = {
    // 需要发送的消息需要自定义
  // }

  const requestRes = protoApi.Request,
  messageRes = requestRes.create(sentMsg), resdata = requestRes.encode(messageRes).finish()

  sendMsg(resdata.slice().buffer)
}

let returnMsg = function(){}

function getMsg(callback){
  return returnMsg = callback
}

module.exports.ws_connect = ws_connect;
module.exports.sendMsg = sendMsg;
module.exports.socketApi = socketApi;
module.exports.message = getMsg;
