//本服务提供Web接口，主要用于上传数据及图片
var fs = require('fs')
//连接数据库
var express = require('express')
var path = require('path')
var http = require('http')
var app = express()
var getRawBody =  require('raw-body')
var exec = require('child_process').exec

var config = require('./config')
var bodyParser=require('body-parser')

var check = require('./app')



//检查文件夹是否存在，如果不存在则创建
//也包括创建一些传输标示文件，根据config.js中的描述
check.sysCheck()


//模拟车道产生数据
//var LanePost = require('./lane_post_test_data')

//站级分拣数据
// var StationProcess = require('./station_process_Income')
// //站级插入本地数据库
// var StationInsertMySQL = require('./station_insert_mysql')
// //站级续传到分中心
// var StationInsertSub = require('./station_saveto_subcenter')
// //站级续传到总中心
// var StationInsertCenter = require('./station_saveto_center')
//
//
// //分中心拣数据
// var SubCenterProcess = require('./subcenter_processIncome')
//
// var SubCenterInsertMySQL = require('./subcenter_insert_mysql')
//
//
// //中心分拣服务
// var CenterProcess = require('./center_processIncome')
//
// var CenterInsertMySQL = require('./center_insert_mysql')
// //
//  var CenterInsertMSSQL = require('./center_insert_mssql')
// //
// var CenterInsertMongoDB = require('./center_insert_mongo')
//
// var CenterInsertOracle = require('./center_insert_oracle')
//




app.set('views', './app/views/pages')
app.set('view engine', 'jade')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//app.use(express.urlencoded());
app.use(require('connect-multiparty')());

//设置静态文件夹
app.use(express.static(path.join(__dirname, 'public')))

//处理图像上传中间件，从post中获取图像数据
app.use(function (req, res, next) {
  if (req.headers['content-type'] === 'application/octet-stream') {
    getRawBody(req, {
      length: req.headers['content-length'],
      encoding: this.charset
    }, function (err, string) {
      if (err)
        return next(err)
      req.body = string
      next()
    })
  }
  else {
    next()
  }
})

//加载路由
require('./routes')(app)
//监听
app.listen(config.local.port)
//打印状态输出
console.log('数据路由服务运行在端口:' + config.local.port)

//模拟车道上传数据
 //LanePost.search()
//站级数据处理
if(config.local.node_type==1)
{
//站级分拣文件
 //StationProcess.processData()
//站级插入MySQL
// StationInsertMySQL.processData()
//站级上传分中心
// StationInsertSub.processData()
//站级上传中心
//StationInsertCenter.processData()  
}

if(config.node_type==2)
{
//分中心数据处理
//分中心分拣文件
// SubCenterProcess.processData()
//分中心插入MySQL
//  SubCenterInsertMySQL.processData()
}

if(config.node_type==3)
{
//中心数据处理
//中心分拣文件
//CenterProcess.processData()
//中心插入MySQL
//CenterInsertMySQL.processData()
//中心插入mongoldb
//CenterInsertMongoDB.processData()
//MSSQL
//CenterInsertMSSQL.processData()
//中心插入Oracledb
//CenterInsertOracle.processData()
}



