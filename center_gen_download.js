//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')
//var oracledb = require('oracledb');
//oracledb.autoCommit = true


//连接Mysql数据库
var mysql = require('mysql');
//创建mysql数据库连接池
var pool = mysql.createPool(
    config.mysql
);


//全表下载文件列表
var tableList = [{TABLENAME:'T_SECU_ROLE',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'T_SECU_FUNCTIONS',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'T_CARD_DISCOUNT_INFOR',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'T_COMM_NODE',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'T_COMM_ORGAN',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'T_COMM_ROAD',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'T_DICT_VEHICLE_CASE',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'T_SPEED_LIMIT',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'T_WEIGHT_PARAM',DATAROUTE:'0000011',DATAMETHOD:1},
    {TABLENAME:'TBL_VEHICLE_BLACK',DATAROUTE:'0000011',DATAMETHOD:1}
]





//临时变量，保存当前生成的下发文件名
var tableName
var tableRoute
var tableMethod
//临时变量，保存当前生成的文件下标
var index = -1


//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
    return new Promise(function (resolve, reject) {
        index = index + 1
        if (index == tableList.length) {
            index = 0
        }
        tableName = tableList[index].TABLENAME

        resolve()
    })
}

//获取特定文件的当前版本号
var getDownLoadVer = function (fileName) {
    var kk = fs.readdirSync('./public/centerdownload/version/')
    var rt = '100'
    for (var item in kk) {
        if (kk[item].indexOf(fileName) > -1) {
            rt = kk[item].split('.')[1]
        }
    }
    return rt
}



//生成下载文件
var getDownLoad = function () {
    return new Promise(function (resolve, reject) {

        console.log('TableName:' + tableName)
        //获取链接
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(-1)
            }
            //查表
            var query = connection.query('select count(*) as cnt from node_user',// + tableName,
                function (err, results, fields) {
                    if (err) {
                        reject(-2)
                    }

                    console.log('Count:' + results[0].cnt)
                    //如果有待传数据
                    if (results[0].cnt > 0) {
                        //获取所有数据
                        var query1 = connection.query('select * from node_user',//+ tableName,
                            function (err, results, fields) {
                                if (err) {
                                    reject(-3)
                                }


                                //获取当前版本号
                                var ver = getDownLoadVer(tableName)
                                //当前文件名
                                var oldname = './public/centerdownload/version/' + tableName + '.' + ver
                                //新文件名
                                var newname = './public/centerdownload/version/' + tableName + '.' + (parseInt(ver) + 1)
                                //删除旧文件

                                console.log('Old:' + oldname)
                                console.log('New:' + newname)
                                console.log('Result:' + JSON.stringify(results))

                                var result = {
                                    TABLENAME: tableName,
                                    TOTAL:results.length,
                                    VERSION: parseInt(ver) + 1,
                                    DATAROUTE:tableRoute,
                                    DATAMETHOD:tableMethod,
                                    ROWS:results
                                }



                                var sql3= 'update node_user set transtag=1'
                                var query4 = connection.query(sql3,
                                    function (err, results, fields) {
                                        if (err) {
                                            reject(-5)
                                        }

                                        //获取当前版本号
                                        if (fs.existsSync(oldname)) {
                                            fs.unlinkSync(oldname)
                                        }
                                        //写新文件
                                        fs.writeFileSync(newname, JSON.stringify(result))

                                        //修改Oracle版本信息
                                        var sql = 'update t_down_table_ver set ver_no=' + (parseInt(ver) + 1) + ',rows_count=' + result.ROWS.length + ',update_time=now()'
                                        console.log(sql)
                                        connection.release();
                                        resolve()
                                    })

                            })
                    }
                })
        })

    })
}

var bg = function () {
    getFirstFile().then(getDownLoad).then(function () {
        setTimeout(function () {
            bg()
        }, 3000)
    }).catch(function () {
        setTimeout(function () {
            bg()
        }, 3000)
    })
}

bg()


