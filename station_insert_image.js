//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')

var mongodb = require('mongodb');


//获取Post数据
var pathfrom
var filename

//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
  return new Promise(function (resolve, reject) {
      //获取第一个待传文件名称
      fs.readdir(config.local.local_image_path, function (err, files) {
          if (files.length > 0) {
            var filePath = path.normalize(config.local.station_image + files[0])
            //将待传文件名称存储到全局变量
            pathfrom = filePath
            filename = files[0]
            resolve()
          }
          else {
            reject(-1)
          }
        }
      )
    }
  )
}


//向mongoDB中存储车道传上来的图片
var insertImageToMongo = function () {

  return new Promise(function (resolve, reject) {

    mongodb.MongoClient.connect(config.local.mongo_url, function (err, db) {

      var bucket = new mongodb.GridFSBucket(db, {
        bucketName: config.local.image.mongo_collection
      })

      fs.createReadStream(pathfrom).pip(bucket.openUploadStream(filename)).on('err', function () {
        if (err) {
          reject(err)
        }
      }).on('finish', function () {
        resolve()
      })

    })
  })

}


var search = function () {
  getFirstFile().then(insertImageToMongo).then(function () {
    fs.unlinkSync(pathfrom)
    setInterval(function () {
      search()
    }, 10000)
  }).catch(function () {
    setInterval(function () {
      search()
    }, 10000)
  })
}

search()
