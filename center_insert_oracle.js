//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')
var async = require('async');
var oracledb = require('oracledb');
oracledb.autoCommit = true

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
      fs.readdir(config.local.center_oracle_path, function (err, files) {
          if (files.length > 0) {
            var filePath = path.normalize(config.local.center_oracle_path + files[0])
            //将待传文件名称存储到全局变量
            pathfrom = filePath

            if (files[0].indexOf('.data') < 0) {
              fs.unlinkSync(pathfrom);
              reject(-1)
              return
            }

            console.log(pathfrom)
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
var InsertIntoOra = function () {
  return new Promise(function (resolve, reject) {
  //获取Post数据
  var insert = 'INSERT INTO ' + data.TABLENAME + convertsql(data.ROWS[0])
  var del = 'DELETE FROM T_TABLE_DATA_VER WHERE NODE_ID=' + data.ROWS[0].NODE_ID + ' AND TABLE_NAME=\'' + data.ROWS[0].TABLE_NAME + '\''

  var doconnect = function(cb) {
    oracledb.getConnection(
      config.oracle
      ,
      cb);
  };

  var dorelease = function(conn) {
    conn.close(function (err) {
      if (err)
        console.error(err.message);
    });
  };

  var doinsert = function (conn, cb) {
    console.log(insert)
    conn.execute(
      insert // Bind values
        , { autoCommit: true },
      function(err, result)
      {
        if (err) {
          return cb(err, conn);
        } else {
          console.log("Rows inserted: " + result.rowsAffected);  // 1
          return cb(null, conn);
        }
      });
  };

  var dodelete = function (conn, cb) {

    console.log(del)
    if (data.TABLENAME == 'T_TABLE_DATA_VER') {
      conn.execute(
        del // Bind values
          , { autoCommit: true },
        function(err, result)
        {
          if (err) {
            return cb(err, conn);
          } else {
            //console.log("Rows inserted: " + result.rowsAffected);  // 1
            return cb(null, conn);
          }
        });
    }
    else {
      return cb(null, conn);
    }
  }


  async.waterfall(
    [
      doconnect,
      dodelete,
      doinsert
    ],
    function (err, conn) {
      if (err) {
        console.error("In waterfall error cb: ==>", err, "<==")
        reject()
        return
      }
      else
      {
        conn.commit()
        if (conn)
          dorelease(conn)
         resolve()
        return
      }
    });

}
)
}

var search = function () {
  getFirstFile().then(readFileData).then(InsertIntoOra).then(function () {
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

//exports.processData = function () {
  search()
//}

