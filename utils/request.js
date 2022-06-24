const base = 'https://'

function request(url = 'list', options = {}, method= 'post') {
  return new Promise((res, rej) => {
    wx.request(Object.assign(
      {
        url: base + url,
        method,
        timeout: 10000
      },
      {
        data: options
      },
      {
        success(req){
          res(req.data)
        },
        fail: rej,
      },
    ));
  });
}

module.exports = {
  request
}