//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    OPEN_ID: '',
    socketConnected: false,
    hasUserInfo: false,
    progress: ['WebSocket暂未连接.'],
    scroll_top: 1000,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    //判断全局是否有用户信息
    if (app.globalData.userInfo) {
      //保存至当前页面
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      this.getLocalOpenId();
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        this.getLocalOpenId();
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
          this.getLocalOpenId();
        }
      })
    }
    this.connectSocket();
  },
  // 添加新信息到progress数组
  pushProgress(msg) {
    var arr = this.data.progress;
    arr.push(msg);
    this.setData({
      progress: arr
    });
    // 设置每次新增内容滚动条都在底部
    this.setData({
      scroll_top: this.data.scroll_top + 1000
    })
  },
  // 点击按钮获取用户信息
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.getLocalOpenId();
  },
  // 二维码扫描
  scanCode: function (e) {
    // 调用摄像头扫码,识别客户端key后通过socket发送key至服务器
    // 并生成token返回给该客户端
    wx.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        // 二维码上的key
        var key = res.result;
        this.pushProgress('获取key值为:' + key);
        wx.showModal({
          title: '提示',
          content: '是否登录',
          success: function (res) {
            if (res.confirm) {
              wx.sendSocketMessage({
                data: key,
              })
            }
          }
        })

      }
    })
  },
  // 获取OPEN_ID
  getLocalOpenId() {
    // 获取缓存中的OPEN_ID
    var open_id = wx.getStorageSync('OPEN_ID');
    // 存在,请求服务器判断是否有权限扫码登录
    if (open_id) {
      this.setData({
        OPEN_ID: open_id
      })
    } else {
      // 请求微信login
      app.login((OPEN_ID, SESSION_KEY) => {
        // 保存OPEN_ID到本地缓存,方便下次使用
        wx.setStorageSync('OPEN_ID', OPEN_ID);
        this.setData({
          OPEN_ID: OPEN_ID
        })
      })
    }
  },
  // 判断是否有权限扫码登录
  checkAuth(e) {
    console.log('OPEN_ID:', e.target.dataset.openid);
    wx.request({
      url: app.globalData.config.domain + '/api/wx/checkAuth',
      data: {
        OPEN_ID: e.target.dataset.openid
      },
      success: (res) => {
        if (res.data.success) {
          //socket断开需重新连接
          if (!this.data.socketConnected) {
            this.connectSocket(this.scanCode);
            return false;
          } else {
            this.scanCode();
          }
        } else {
          wx.setClipboardData({
            data: e.target.dataset.openid,
            success: function (res) {
              wx.showToast({
                title: '您暂无权限.',
              });
            }
          })
        }
      }
    })
  },
  // socket相关操作
  connectSocket(callback) {
    // 创建socket连接
    wx.connectSocket({
      url: app.globalData.config.socket + '?admin',
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json'
      },
      protocols: ['protocol1'],
      method: "GET"
    });
    // 连接成功时事件
    wx.onSocketOpen(_ => {
      this.setData({
        socketConnected: true
      })
      this.pushProgress('WebSocket连接已打开.');
      callback && callback();
    })
    // 接收socket信息
    wx.onSocketMessage(res => {
      this.pushProgress('服务器：' + res.data);
      wx.showToast({
        title: res.data,
      })
    })
    // 连接关闭事件
    wx.onSocketClose(_ => {
      this.setData({
        socketConnected: false
      })
      this.pushProgress('WebSocket连接已关闭.');
    })
    // 连接失败事件
    wx.onSocketError(_ => {
      this.pushProgress('WebSocket连接打开失败，请检查.');
    })
  }
})
