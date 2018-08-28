
const sha1 = require('sha1')
const getRawBody = require('raw-body')
const Wechat = require('./wechat')
const util = require('./util')


//接口配置信息验证逻辑
module.exports = function (opts) {
    var wechat = new Wechat(opts)

    return function* (next) {
        // console.log(this.query)    
        var that = this
        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr

        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)
        // ge请求验证微信发送过来的验证信息
        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = 'wrong'
            }
        } else if (this.method === 'POST') {
            if (sha !== signature) {
                this.body = 'wrong'
                return false
            }

            /* 通过raw-body模块，可以把这个this上的request对象，其实也就是http模块中的
            request对象，去拼装它的数据，最终可以拿到一个buffer的xml 数据 */

            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })
            console.log(data.toString())
            var content = yield util.parseXMLAsync(data)
            console.log(content)
            var message = util.formatMessage(content.xml)
            console.log(message)

            if (message.MsgType === 'event') {
                if (message.Event === 'subscribe') {
                    var now = new Date().getTime()

                    that.status = 200
                    that.type = 'application/xml'
                    that.body = '<xml>' + 
                        '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName> '+
                        '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName> '+
                        '<CreateTime>' + now + '</CreateTime> '+
                        '<MsgType><![CDATA[text]]></MsgType> '+
                        '<Content><![CDATA[欢迎关注公众号]]></Content>'+
                        '</xml>'

                    return
                }
            }
        }

    }
}