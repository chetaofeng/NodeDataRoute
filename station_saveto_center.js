//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')
var http = require('http')



//获取Post数据
var data
var pathfrom

//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
  return new Promise(function (resolve, reject) {
      //获取第一个待传文件名称
      fs.readdir(config.local.center_path, function (err, files) {
          if (files.length > 0) {
            var filePath = path.normalize(config.local.center_path + files[0])
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
          // data = JSON.parse(da)
          data = da;
          //休眠后发送
          resolve()

        }
      )
    }
  )
}

var senddata = function () {
  return new Promise(function(resv,reject) {
      //设置参数
      var opt = {
        method: 'POST',
        host: config.up_host.host,
        port: config.up_host.port,
        path: "/center",
        headers: {
          "Content-Type": 'application/json',
          "Content-Length": data.length
        }
      }


      const req = http.request(opt, function (res) {

        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', function () {
          resv()
          console.log('No more data in response.');
        });
      });

      req.on('error', function (e) {
        reject()
        console.error(`problem with request: ${e.message}`);
      });

// write data to request body
      req.write(data);
      req.end();

  }
  )
}


var search = function () {
  getFirstFile().then(readFileData).then(senddata).then(function () {
//      console.log('继续')
      fs.unlinkSync(pathfrom);
      search()

  }).catch(function () {
   // console.log('没有')
    setInterval(function () {
      search()
    }, 10000)
  })
}

exports.processData = function () {
  search()
}
