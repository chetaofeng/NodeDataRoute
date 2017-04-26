//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')
var http = require('http')


//获取Post数据

function GetRandomNum(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return (Min + Math.round(Rand * Range));
}

var test = function () {

  var data = JSON.stringify({
    "TABLENAME": "T_TABLE_DATA_VER", "ROUTE_TAG": "111111",
    "FILENAME":  GetRandomNum(1, 100000).toString()+'.data',
    "TOTAL": 1, "ROWS": [{
      "NET_ID": 0, "STATION_ID": GetRandomNum(1, 100000), "NODE_ID": GetRandomNum(1, 100000),
      "TABLE_NAME": "DB_BLACK_22", "VER_NO": GetRandomNum(1, 100000), "ROWS_COUNT": 0,
      "UPDATE_TIME": "2017-03-29 16:27:09", "DB_PATH": "", "REMARK1": "",
      "REMARK2": "", "TRANSTAG": 0
    }]
  })

  //设置参数
  var opt = {
    method: 'POST',
    host: config.local.host,
    port: config.local.port,
    path: "/station",
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
      console.log('No more data in response.');
    });
  });

  req.on('error', function (e) {
    console.error(`problem with request: ${e.message}`);
  });

// write data to request body
  console.log(data)
  req.write(data);
  req.end();
}


exports.search = function () {
  setInterval(function () {
    test()
  },3000)
}



