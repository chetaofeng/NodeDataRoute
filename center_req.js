//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')



//接收车道传输过来的数据
exports.center = function (req, res) {


  //获取Post数据
  var data = req.body

  var CreateTransFile = function () {
    var _station = data
    //获取文件名称
    var newPath = path.join(config.local.center_income_path + _station.FILENAME)
    return new Promise(function (resolve, reject) {

      //写本地文件
      fs.writeFile(newPath, JSON.stringify(_station), {flag: 'w', encoding: 'utf8'}, function (err) {
        if (err) {
          //console.log('创建传输文件错误:' + err)
          reject(err)
        }
        else {
          //console.log('创建传输文件成功...')
          res.jsonp({FILENAME: data.FILENAME})
          resolve()
        }
      })
    })
  }

  //创建文本文件
  CreateTransFile().then(function () {
    //console.log('所有步骤执行成功...')
  }).catch(function (err) {
    //console.log('捕捉1错误号:' + err)
  })

}

//获取特定文件的当前版本号
var getDownLoadVer = function (fileName) {
    var kk = fs.readdirSync('./public/centerdownload/version/')
    var rt = fileName+'.000'
    for (var item in kk) {
        if (kk[item].indexOf(fileName) > -1) {
            rt =kk[item]
        }
    }
    return rt
}

exports.centerdown = function (req,res) {
    //获取Post数据
    var data = req.body

    console.log(data)
    //获取表名称及版本号



    //比较表名称及版本号，如果客户端版本号小，则下载，否则啥也不敢

    //服务器端版本
    var serverData = getDownLoadVer(data.TABLENAME)
    console.log('Server:'+serverData+'   Client:'+data.TABLEVERSION)

    if(serverData != data.TABLEVERSION)
    {
        var fromdata = './public/centerdownload/version/'+serverData
        var todata = serverData

        console.log('需要下载')

        res.download(fromdata,todata);

    }
    else
    {
        console.log('不需要下载')
        res.json({result:'ok'})
    }
}