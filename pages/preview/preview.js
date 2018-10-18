//answer.js
var util = require('../../utils/util.js')

var app = getApp()
Page({
    data: {
        questionTitle: "",
        questionHTML: "",
        userInfo: {}
    },
    //事件处理函数
    bindItemTap: function() {
        wx.navigateTo({
            url: '../answer/answer'
        })
    },
    onLoad: function() {
		var that = this
		wx.getStorage({
			key: 'questionContent',
			success: function(res) {
				console.log(res)
				that.setData({
					questionTitle:res.data.title
				})
			},
		})
        console.log('onLoad')
        var that = this
        //调用应用实例的方法获取全局数据
        app.getUserInfo(function(userInfo) {
            //更新数据
            that.setData({
                userInfo: userInfo
            })
        })
    },
    tapName: function(event) {
        console.log(event)
    }
})