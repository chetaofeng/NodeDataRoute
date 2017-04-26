var Station = require('./station_req')
var Subcenter = require('./subcenter_req')
var Center = require('./center_req')

// var Center_MongoDB = require('./center_req_mongo')
// var Center_MSSQL = require('./center_req_mssql')
// var Center_Mysql = require('./center_req_mysql')
// var Center_Oracle = require('./center_req_oracle')
// var Center_Image = require('./center_req_image')
// var Center_TransMonitor = require('./center_req_transmonitor')

module.exports = function(app) {
  //站级路由
  //上传数据
  app.post('/station', Station.station)
  //获取图片
  // app.post('/image', Station.image)
  //
 // app.post('/stationmonitor', Station.station)

  //
  // app.get('/s_img',Station.img)

  //分中心路由
  app.post('/subcenter',Subcenter.subcenter)
 // app.post('/subcentermonitor',Subcenter.subcenter)


  //中心路由
  //上传数据
  app.post('/center',Center.center)
  app.post('/centerdown',Center.centerdown)
    app.get('/centerdown',Center.centerdown)

    // app.post('/center', Center_Oracle.center_oracle)
//
 // app.get('/c_img',Station.img)

//  app.post('/centermonitor', Center_TransMonitor.center_transmonitor)

}