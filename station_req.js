//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')
//连接mongodb数据库连接
var mongodb = require('mongodb');


//接收车道传输过来的数据
exports.station = function (req, res) {

  //获取Post数据
  var data = req.body

  var CreateTransFile = function () {
    var _station = data
    //获取文件名称
    var newPath = path.join(config.local.station_income_path + _station.FILENAME)

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


//读取Mongodb中的图片
exports.img = function (req, res) {
  var key = req.params.key

  if (key.split('_')[2] !== config.local.node_id) {
    res.redirect('http://10.62.0.158:3000/' + key);
  }
  else {
    mongodb.MongoClient.connect(config.local.mongo_url, function (err, db) {
      var bucket = new mongodb.GridFSBucket(db, {
        bucketName: config.local.image.mongo_collection
      })
      bucket.openDownloadStreamByName(key).pip(res).on('error', function () {

      }).on('finished', function () {
      })

    })

  }
}


//向mongoDB中存储车道传上来的图片
exports.image = function (req, res) {
  console.log(req.query.filename)
  var filename = req.query.filename
  var data = req.body
  var newPath = path.join(config.local.incomeimage_path + filename)

  fs.writeFile(newPath, data, function (err) {
    if (err) {
      res.end('err')
    }
    else {
      res.end(filename)
    }
  })
}

