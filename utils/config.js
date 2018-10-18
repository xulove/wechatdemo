// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://nextblockchain.top';

var config = {

  // 下面的地址配合云端 Demo 工作
  service: {
    host,

    // 登录地址，用于建立会话
    loginUrl: `${host}/weapp/login`,

    // 测试的请求地址，用于测试会话
    requestUrl: `${host}/weapp/user`,

    // 测试的信道服务地址
    tunnelUrl: `${host}/weapp/tunnel`,

    // 上传图片接口
    uploadUrl: `${host}/weapp/upload`
  },
  api:{
    //首页回答动态列表api
    indexAnswerList:`${host}/index/answerlist`,
    // 首页等待回答列表api
    indexWaitList:`${host}/index/waitlist`,
    //发现页面
    explorerList: `${host}/explorer` //比如请求blockchain的列表${host}/explorer?type=blockchain
  }
};

module.exports = config;