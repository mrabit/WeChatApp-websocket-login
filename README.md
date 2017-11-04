websocket配合小程序实现扫码登录
=========================================
### 用法

1. 服务端(server文件夹):
    - 安装依赖: `cnpm install`
    - 修改配置项: server.js
    - 运行: `node server.js`

2. 小程序(wx_app文件夹):
    - 微信开发者工具打开文件夹,输入自己的appid,编译运行

### 文件目录
```
.
├── README.md
├── server
│   ├── db.js
│   ├── index.html
│   ├── package.json
│   └── server.js
├── wx_app
│   ├── pages
│   │   ├── index
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   └── logs
│   │       ├── logs.js
│   │       ├── logs.json
│   │       ├── logs.wxml
│   │       └── logs.wxss
│   ├── utils
│   │   └── utils.js
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   └── project.config.json
```
### 参考地址:
- [扫二维码登录思路（扫码登录思路）](https://www.meetqy.com/article?article_id=42 "扫二维码登录思路（扫码登录思路）")
- [API · 小程序](https://mp.weixin.qq.com/debug/wxadoc/dev/api/ "API · 小程序")