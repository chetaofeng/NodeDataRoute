//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')

//连接mongodb数据库
var MongoClient = require('mongodb').MongoClient



//获取Post数据
var data
var pathfrom

//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
  return new Promise(function (resolve, reject) {
      //获取第一个待传文件名称
      fs.readdir(config.local.center_mongo_path, function (err, files) {
          if (files.length > 0) {
            var filePath = path.normalize(config.local.center_mongo_path + files[0])
            //将待传文件名称存储到全局变量
            pathfrom = filePath

            if (files[0].indexOf('.data') < 0) {
              fs.unlinkSync(pathfrom);
              reject(-1)
              return
            }

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

var readFileData = function () {

  return new Promise(function (resolve, reject) {
      var fileName = pathfrom
      fs.readFile(fileName, {flag: 'r+', encoding: 'utf8'}, function (err, da) {

          if (err) {
            reject(-2)
            return
          }

          //设置数据内容
          data = JSON.parse(da)
          //休眠后发送
          // data = JSON.parse(data)


          console.log(data)

          //模拟无数据文件
          resolve()


        }
      )
    }
  )
}
var InsertIntoMongoDB = function () {

  return new Promise(function (resolve, reject) {

    MongoClient.connect(config.centermongo.url, function (err, db) {
      if (err) {
        console.log('连接mongoDB客户端错误:' + err)
        reject(-11)
        return
      }
      else {
        var collection = db.collection(data.TABLENAME);
        collection.insertMany(data.ROWS, function (err, result) {
          if (err) {
            console.log('向mongodb插入数据错误:' + err)
            db.close();
            reject(-12)
            return
          }
          else {
            console.log('向mongodb插入数据成功...')
            db.close();
            resolve()
            return
          }
        });
      }
    });
  })
}

var search = function () {
  getFirstFile().then(readFileData).then(InsertIntoMongoDB).then(function () {

    console.log('继续')
    fs.unlinkSync(pathfrom);
    search()
  }).catch(function () {
    console.log('没有')
    setInterval(function () {
      search()
    }, 10000)
  })
}

exports.processData = function () {
  search()
}



//接收车道传输过来的数据
// exports.center_mongo = function (req, res) {
//   //获取Post数据
//   var data = req.body
//
//   var InsertIntoMongoDB = function () {
//
//     return new Promise(function (resolve, reject) {
//
//       MongoClient.connect(config.centermongo.url, function (err, db) {
//         if (err) {
//           console.log('连接mongoDB客户端错误:' + err)
//           reject(-11)
//           return
//         }
//         else {
//           var collection = db.collection(data.TABLENAME);
//           collection.insertMany(data.ROWS, function (err, result) {
//             if (err) {
//               console.log('向mongodb插入数据错误:' + err)
//               db.close();
//               reject(-12)
//               return
//             }
//             else {
//               console.log('向mongodb插入数据成功...')
//               db.close();
//               resolve()
//               return
//             }
//           });
//         }
//       });
//     })
//   }
//
//   InsertIntoMongoDB().then(function () {
//     res.jsonp({result:true})
//   }).catch(function(){
//     res.jsonp({result:false})
//   })
//
// }
