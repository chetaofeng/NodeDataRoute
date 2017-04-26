
//检测车道传上来的消息文件夹，并将消息按照其描述分拣到不同文件夹
var fs = require('fs')
var config=require('./config')
var path = require('path')


//需要传输的数据
var data

//存储待传文件名称
var pathfrom

//存储本地mysql消息文件
var pathto_000001

//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
  return new Promise(function (resolve, reject) {

      //获取第一个待传文件名称
      fs.readdir(config.local.sub_income_path, function (err, files) {

          if (files.length > 0) {

            var filePath = path.normalize(config.local.sub_income_path + files[0])
             pathto_000001=path.normalize(config.local.sub_mysql_path + files[0])


            //将待传文件名称存储到全局变量
            pathfrom = filePath

            if(files[0].indexOf('.data')<0)
            {
              fs.unlinkSync(pathfrom);
              reject()
              return
            }

            console.log(pathfrom)
            resolve()
          }
          else {
            console.log(3)

            reject(-1)
          }
        }
      )
    }
  )
}


var readFileData=function () {

  return new Promise(function (resolve, reject) {
      var fileName = pathfrom
      fs.readFile(fileName, {flag: 'r+', encoding: 'utf8'}, function (err, da) {

          if(err)
          {
            reject(-2)
            return
          }

          //设置数据内容
        data = JSON.parse(da)
          // data  = da;
        //  休眠后发送

            resolve()

        }
      )
    }
  )
}


var proceData=function () {

  return new Promise(function (resolve,reject) {


    fs.writeFileSync(pathto_000001, JSON.stringify(data),{flag: 'w', encoding: 'utf8'})


    fs.unlinkSync(pathfrom);

    resolve()

  })
}


var search = function () {
  getFirstFile().then(readFileData).then(proceData).then(function(){
    console.log('有')
    search()
  }).catch(function () {
    console.log('没有')
    setTimeout(function () {
      search()
    },10000)

  })
}


//search()

exports.processData = function () {
  search()
}