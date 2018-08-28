const Koa = require('koa')
const app = new Koa();
var path = require('path')
var util = require('./libs/util')
var wechat = require('./wechat/g')
var wechat_file = path.join(__dirname, './config/wechat.txt')
const config = {
    wechat: {
        appID: 'wx936423740adc8e6a',
        appSecret: 'b812e04e7f5bd7717c6f57c721388ed2',
        token: 'weixin',
        getAccessToken: function(){
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data){
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file,data)
        }
    }
}
app.use(wechat(config.wechat)) //第一步 配置验证中间件

app.listen(8080);
console.log("server is runnin 8080")