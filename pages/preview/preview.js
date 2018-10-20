//answer.js
var util = require('../../utils/util.js')
var WxParse = require('../../wxParse/wxParse.js');
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
		var res = wx.getStorageSync("questionContent")
		console.log(res)
		that.setData({
			questionTitle: res.title,
			questionHTML: res.description
		})
		
		WxParse.wxParse('article', 'html', res.description, that, 5);
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
    },
	onrewrite:function(e){
		wx.navigateBack({
			delta:1
		})
	}
})