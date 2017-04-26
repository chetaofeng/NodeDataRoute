//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')

var mssql = require('mssql')


//获取Post数据
var data
var pathfrom

var convertsql = function (json) {
  var leftstr = '('
  var rightstr = '('

  for (var item in json) {
    leftstr = leftstr + item + ','
    rightstr = rightstr + '\'' + json[item] + '\','

  }
  leftstr = leftstr + ')'
  rightstr = rightstr + ')'
  leftstr = leftstr.replace(',)', ')')
  rightstr = rightstr.replace(',)', ')')
  retstr = leftstr + ' values ' + rightstr
  return retstr
}


//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
  return new Promise(function (resolve, reject) {
      //获取第一个待传文件名称
      fs.readdir(config.local.center_mssql_path, function (err, files) {
          if (files.length > 0) {
            var filePath = path.normalize(config.local.center_mssql_path + files[0])
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


          //console.log(data)

          //模拟无数据文件
          resolve()


        }
      )
    }
  )
}


//接收车道传输过来的数据
var InsertIntoMsSQL = function () {
  //获取Post数据

  return new Promise(function (resolve, reject) {

      //console.log(data)
      var sql
      var sql1 = 'INSERT INTO ' + data.TABLENAME + convertsql(data.ROWS[0])
      var sql2 = 'DELETE FROM T_TABLE_DATA_VER WHERE NODE_ID=' + data.ROWS[0].NODE_ID + ' AND TABLE_NAME=\'' + data.ROWS[0].TABLE_NAME + '\''
      if (data.TABLENAME == 'T_TABLE_DATA_VER') {
        console.log('特殊处理表:T_TABLE_DATA_VER')
        sql = sql2 + ';' + sql1
      }
      else {
        sql = sql1
      }

      console.log(sql)


      mssql.connect(config.mssql, function (err) {

          if (err) {
            reject()
            return
          }

          new mssql.Request().query(sql, function (err, result) {
            if (err) {
              reject()
              return
            }

            mssql.close()
            resolve()

            console.dir(result)
          })
        }
      )


    // mssql.on('error',function (err) {
    //   mssql.close()
    // })

    }
  )
}


var search = function () {
  getFirstFile().then(readFileData).then(InsertIntoMsSQL).then(function () {
    console.log('继续')
    console.log('删除文件:' + pathfrom)
    fs.unlinkSync(pathfrom);
    search()
  }).catch(function () {
    console.log('没有')
    setInterval(function () {
      search()
    }, 10000)
  })
}


search()


