
//检测车道传上来的消息文件夹，并将消息按照其描述分拣到不同文件夹
var fs = require('fs')
var config=require('./config')
var path = require('path')


//存储待传文件名称
var pathfrom

var data
//存储本地MongoDB图片文件
var pathto_000001
//存储中心MongoDB图片文件
var pathto_000010


//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
  return new Promise(function (resolve, reject) {
      //获取第一个待传文件名称
    console.log(1)
      fs.readdir(config.local.income_image_path, function (err, files) {
        console.log(2)
          if (files.length > 0) {
            console.log(3)
            var filePath = path.normalize(config.local.income_image_path + files[0])
             pathto_000001=path.normalize(config.local.local_image_path + files[0])
             pathto_000010=path.normalize(config.local.center_image_path + files[0])


            //将待传文件名称存储到全局变量
            pathfrom = filePath
            data =  fs.readFileSync(pathfrom)
            console.log(data)
            resolve()
          }
          else {
            console.log(4)
            reject(-1)
          }
        }
      )
    }
  )
}





var proceData=function () {

  return new Promise(function (resolve,reject) {

    fs.writeFileSync(pathto_000001, data)
    fs.writeFileSync(pathto_000010, data)


    fs.unlinkSync(pathfrom);

      resolve()
  })
}


var search = function () {
  getFirstFile().
  then(proceData).
  then(function(){
   console.log('继续')
    search()
  }).catch(function () {
    console.log('没有')
    setTimeout(function () {
      search()
    },10000)
  })
}

search()