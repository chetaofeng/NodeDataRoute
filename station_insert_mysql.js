//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')
//连接Mysql数据库
var mysql = require('mysql');

//创建mysql数据库连接池
var pool = mysql.createPool(
  config.mysql
);


//获取Post数据
var data
var pathfrom

//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
  return new Promise(function (resolve, reject) {
      //获取第一个待传文件名称
      fs.readdir(config.local.station_mysql_path, function (err, files) {
          if (files.length > 0) {
            var filePath = path.normalize(config.local.station_mysql_path + files[0])
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

var InsertIntoMySQL = function () {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log("获取mysql连接池错误:" + err)
        reject(-31)
        return
      }
      else {
        if (data.TABLENAME == 'T_TABLE_DATA_VER') {
          console.log('特殊处理表:T_TABLE_DATA_VER')
          var query = connection.query('DELETE FROM t_table_data_ver WHERE NODE_ID=? AND TABLE_NAME=?', [data.ROWS[0].NODE_ID, data.ROWS[0].TABLE_NAME],
            function (error, results, fields) {
              console.log('删除SQL语句:' + query.sql)
              if (error) {
                console.log('删除错误:' + error)
                connection.release();
                reject(-32)
                return
              }
              else {
                //数据删除成功
                var query1 = connection.query('INSERT INTO `' + data.TABLENAME + '` SET ?',
                  data.ROWS[0],
                  function (error, results, fields) {
                    console.log('插入SQL语句:' + query1.sql)
                    if (error) {
                      console.log('插入错误:' + error)
                      //释放连接
                      connection.release();
                      reject(-33)
                      return
                    }
                    else {
                      console.log('mysql插入数据成功...')
                      connection.release();
                      resolve()
                      return
                    }
                  })
              }
            })
        }
        else {
          console.log('普通表:' + data.TABLENAME)
          // Use the connection
          var query1 = connection.query('INSERT INTO `' + data.TABLENAME + '` SET ?',
            data.ROWS[0],
            function (error, results, fields) {
              console.log('插入SQL语句:' + query1.sql)
              if (error) {
                console.log('插入错误:' + error)
                connection.release();
                reject(-34)
                return
              }
              else {
                console.log('mysql插入数据成功...')
                connection.release();
                resolve()
                return
              }
            })
        }
      }
    })
  })
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
            //模拟无数据文件
            resolve()


        }
      )
    }
  )
}

 var search = function () {
  getFirstFile().then(readFileData).then(InsertIntoMySQL).then(function () {

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
