//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
var request=require('request');
//存放配置文件
var config = require('./config')
var http = require('http')
//var request = require('request-json');
/*
var senddata = function () {
  console.log('send...')
  //设置参数
  var f1 = fs.readdirSync(config.local.income_path).length;
  var f2 = fs.readdirSync(config.local.local_path).length;
  var f3 = fs.readdirSync(config.local.income_image_path).length;
  var f4 = fs.readdirSync(config.local.local_image_path).length;
  var f5 = fs.readdirSync(config.local.center_image_path).length;
  var f6 = fs.readdirSync(config.local.subcenter_path).length;
  var f7 = fs.readdirSync(config.local.center_oracle_path).length;
  var f8 = fs.readdirSync(config.local.center_mssql_path).length;
  var f9 = fs.readdirSync(config.local.center_mysql_path).length;
  var f10 = fs.readdirSync(config.local.center_mongo_path).length;

  var data1 = {
    node_id: config.node_id,
    node_name: config.node_name,
    node_type: config.node_type,
    updatetime: new Date(),
    income: f1,
    local: f2,
    income_image: f3,
    local_image: f4,
    subcenter: f5,
    center_image: f6,
    center_oracle: f7,
    center_mssql: f8,
    center_mysql: f9,
    center_mongo: f10
  }

  var dd = JSON.stringify(data1)

  var opt = {
    method: 'POST',
    host: '192.168.0.113',
    port: 3000,
    path: "/transstatus",
    headers: {
      "Content-Type": 'application/json',
      "Content-Length": dd
    }
  }


  var req = http.request(opt,
    function (serverFeedback) {
      if (serverFeedback.statusCode == 200) {
        var body = "";
        serverFeedback.on('data',
          function (data) {
            body += data;
          })
          .on('end',
            function () {

            });
      }
      else {

      }
    });
  req.on('error', function(e){
    console.log(`problem with request: ${e.message}`);
})

  req.write(dd + "\n");
  req.end();
}

*/


//休眠后发送
setInterval(function () {



  var options = {
    headers: {"Connection": "close"},
    url: 'http://192.168.0.113:3000/transstatus',
    method: 'POST',
    json:true,
    body: {data:{channel : "aaa",appkey : "bbb"},sign : "ccc",token : "ddd"}
  };

  function callback(error, response, data) {
    if (!error && response.statusCode == 200) {
      console.log('----info------',data);
    }
  }

  request(options, callback);

}, 10000)
