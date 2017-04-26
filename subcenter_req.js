//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')
//连接mongodb数据库连接
var mongodb = require('mongodb');


//接收车道传输过来的数据
exports.subcenter = function (req, res) {

  //获取Post数据
  var data = req.body

  var CreateTransFile = function () {
    var _station = data
    //获取文件名称
    var newPath = path.join(config.local.sub_income_path + _station.FILENAME)

    return new Promise(function (resolve, reject) {
      //写本地文件
      console.log('subcent_req: ' + data)
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

