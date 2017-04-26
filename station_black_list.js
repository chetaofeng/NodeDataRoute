var fs = require('fs')
//连接数据库
var mysql = require('mysql');
var MongoClient = require('mongodb').MongoClient
var readline = require('readline')
var path = require('path')
var config = require('./config')


//mysql连接池
var pool = mysql.createPool(config.mysql);

//向mysql中插入黑名单版本信息
var InsertBlackIntoMySQL = function (data) {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject('获取MySQL连接失败')
      }
      else {
        var query1 = connection.query('DELETE FROM T_TABLE_DATA_VER WHERE NODE_ID=? AND TABLE_NAME=?', [data.NODE_ID, data.TABLE_NAME],
          function (error, results, fields) {
            if (error) {
              reject('执行SQL失败:' + query1.sql)
            }
            else {
              var query = connection.query('INSERT INTO T_TABLE_DATA_VER SET ?',
                data,
                function (error, results, fields) {
                  if (error) {
                    reject('执行SQL失败:' + query.sql)
                  }
                  else {
                    connection.release();
                    resolve()
                  }
                })
            }

          })
      }

    });

  })
}

var registToSql = function () {
  console.log('开始注册版本')
  var rl = readline.createInterface({
    input: fs.createReadStream(config.blacklist.localpath + 'DOWNLOAD_VERSION.TXT')
  })

  rl.on('line', function (line) {
    if (line.substr(0, 2) == '20') {
      var str = line.substr(36)
      var p1 = str.lastIndexOf('_')
      var arr = str.split('_')
      var len = arr.length
      var name = str.substr(0, p1)
      var ver = arr[len - 1].split('.')[0]

      var data = {
        NET_ID: 0,
        STATION_ID: config.local.node_id,
        NODE_ID: 0,
        TABLE_NAME: name,
        VER_NO: ver,
        ROWS_COUNT: 0,
        UPDATE_TIME: new Date(),
        DB_PATH: config.blacklist.localpath,
        REMARK1: '',
        REMARK2: '',
        TRANSTAG: 0
      }
      //修改本地版本信息
      InsertBlackIntoMySQL(data).then(function () {
      }).catch(function (err) {
        console.log(err)
      })

    }
  })
}

//将本地文件上传到mongodb中
var upload = function (name, localname) {

  return new Promise(function (res, reject) {

    mongodb.MongoClient.connect(config.local.mongo_url, function (err, db) {
      var bucket = new mongodb.GridFSBucket(db, {
        bucketName: config.blacklist.tablename
      })


      fs.createReadStream(localname).pip(bucket.openUploadStream(name)).on('err', function () {
        if (err) {
          reject(err)
        }
      }).on('finish', function () {
        res()
      })
    })
  })

}


//通过filename从mongo中将文档下载到磁盘中
var download = function (name, localname) {
  return new Promise(function (res, reject) {

    mongodb.MongoClient.connect(config.local.mongo_url, function (err, db) {
      var bucket = new mongodb.GridFSBucket(db, {
        bucketName: config.blacklist.tablename
      })

      bucket.openDownloadStreamByName(name).pip(fs.createWriteStream(localname + '.L'))
        .on('error', function () {

        }).on('finished', function () {
          res(localname + '.L')
        }
      )
    })
  })
}




var blackList = function () {
  MongoClient.connect(config.blacklist.url, function (err, db) {

    //每间隔固定时间进行扫描
    setInterval(function () {
      console.log("读取中心黑名单库，版本信息....");
      var collection = db.collection('black_list.files');
      // 查找黑名单列表
      collection.find({}).toArray(function (err, docs) {
        docs.forEach(function (i) {
          //将路径中的__转换为/
          var localpath = config.blacklist.localpath + i.filename.replace(/__/g, '/')
          console.log('文件路径:' + localpath)
          //判断文件是否存在
          fs.exists(localpath, function (exists) {
            //存在
            if (exists) {
              console.log('本地文件存在:' + localpath)
              var stat = fs.statSync(localpath);

              console.log('本地修改日期:' + stat.mtime + ' | 服务器端修改时间:' + i.uploadDate)

              if (i.uploadDate > stat.mtime) {

                console.log('文件有更新本:' + i.filename)
                //下载新文件
                download(i.filename, localpath).then(function (filename) {
                  console.log('文件下载成功:' + filename)
                  var tmp = filename
                  var ok = filename.replace('.L', '')
                  fs.linkSync(tmp, ok)
                  fs.unlinkSync(tmp)

                  if (filename.lastIndexOf('DOWNLOAD_VERSION.TXT') > -1) {
                    console.log('下载文件名:DOWNLOAD_VERSION.TXT')
                    registToSql()
                  }
                })
              }
              else {
                console.log('文件已最新:' + localpath)
              }
            }
            else {
              console.log('文件不存在:' + localpath)
              download(i.filename, localpath).then(function (filename) {
                console.log('文件下载成功:' + filename)
                var tmp = filename
                var ok = filename.replace('.L', '')
                fs.linkSync(tmp, ok)
                fs.unlinkSync(tmp)
                if (filename.lastIndexOf('DOWNLOAD_VERSION.TXT') > -1) {
                  console.log('下载文件名:DOWNLOAD_VERSION.TXT')
                  registToSql()
                }
              })
            }
          })

        })
      })
    }, 500000)
  });
}
exports.blackList = blackList