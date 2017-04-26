//站级业务数据导出,并将数据

//存取文件的类

//路由属性 站级 分中心 中心Oracle 中心Mysql 中心SQLServer 中心Mongodb

//数据导入行为

//全表删除插入
//先删后插入

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


//站mysql 0 所mysql 1 中心mysql 2 中心oracle 3 中心老oracle 4 中心mssql 5 中心mongodb 6

//生成黑名单列表
var tableList = [
    {TABLENAME:'T_CARD_STOCK',DATAROUTE:'0000110',DATAMETHOD:2},
    {TABLENAME:'T_CARD_CIRCULATION',DATAROUTE:'0000110',DATAMETHOD:2},
    {TABLENAME:'T_CARD_PRECOD',DATAROUTE:'0000110',DATAMETHOD:2},
    {TABLENAME:'T_CARD_RECOVER',DATAROUTE:'0000110',DATAMETHOD:2},
    {TABLENAME:'T_TICKET_STOCK',DATAROUTE:'0000110',DATAMETHOD:3},
    {TABLENAME:'T_TICKET_CIRCULATION',DATAROUTE:'0000010',DATAMETHOD:2},
    {TABLENAME:'T_TICKET_TRASH_AUDIT',DATAROUTE:'0000010',DATAMETHOD:2},
    {TABLENAME:'T_RPT_BASE_ENTRY',DATAROUTE:'0001010',DATAMETHOD:2},
    {TABLENAME:'T_RPT_BASE_EXIT',DATAROUTE:'0001010',DATAMETHOD:2},
    {TABLENAME:'T_RPT_OPERATION_ENTRY',DATAROUTE:'0001010',DATAMETHOD:2},
    {TABLENAME:'T_RPT_OPERATION_EXIT',DATAROUTE:'0001010',DATAMETHOD:2},
    {TABLENAME:'T_RPT_TOLL',DATAROUTE:'0001010',DATAMETHOD:2},
    {TABLENAME:'T_BUSI_UNSHIFT_APPLY',DATAROUTE:'0000010',DATAMETHOD:2},
    {TABLENAME:'T_TABLE_VER',DATAROUTE:'0000010',DATAMETHOD:2},
    {TABLENAME:'T_TABLE_DATA_VER',DATAROUTE:'0000010',DATAMETHOD:2},
    {TABLENAME:'T_VEHICLE_BLACK_DEAL',DATAROUTE:'0000110',DATAMETHOD:2},
    {TABLENAME:'T_BUSI_SHIFT',DATAROUTE:'0000100',DATAMETHOD:2},
    {TABLENAME:'TBL_WASTE_CURRENT_ENTRY',DATAROUTE:'0110000',DATAMETHOD:2},
    {TABLENAME:'TBL_WASTE_CURRENT_EXIT',DATAROUTE:'0110000',DATAMETHOD:2}
]

var tableName
var tableRoute
var tableMethod
//tableName='node_user'
var index = -1

//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
    return new Promise(function (resolve, reject) {
        index = index + 1
        if (index == tableList.length) {
            index = 0
        }
        tableName = tableList[index].TABLENAME
        tableRoute = tableList[index].DATAROUTE
        tableMethod = tableList[index].DATAMETHOD
        resolve()
    })
}



var getDownLoad = function () {
    return new Promise(function (resolve, reject) {

        console.log('TableName:' + tableName)
        //获取链接
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(-1)
            }

            //查表
            var querycount = connection.query('select count(*) as cnt from node_user',// + tableName,
                function (err, results, fields) {
                    if (err) {
                        reject(-2)
                    }

                    console.log('Count:' + results[0].cnt)
                    //如果有待传数据
                    if (results[0].cnt > 0) {

                        //将所有待传数据设置为-1
                        var queryupdate = connection.query('update node_user set transtag=-1',//+ tableName,
                            function (err, results, fields) {
                                if (err) {
                                    reject(-3)
                                }

                                //当前文件名
                                var filename = './public/stationincome/' + tableName + '_' + config.local.node_id + '_' + (new Date().getTime()) + '.data'
                                //新文件名

                                //取出所有为1的数据
                                var sql3 = 'select * from  node_user where transtag=-1'

                                var queryexport = connection.query(sql3,
                                    function (err, results, fields) {
                                        if (err) {
                                            reject(-5)
                                        }


                                        results.forEach(function(i){
                                            i.transtag=1
                                        })

                                        var result = {
                                            TABLENAME: tableName,
                                            TOTAL: results.length,
                                            DATAROUTE: tableRoute,
                                            DATAMETHOD: tableMethod,
                                            ROWS: results
                                        }

                                        //取出所有为1的数据
                                        var sql6 = 'update node_user set transtag = 1  where transtag=-1'

                                        var queryreset = connection.query(sql6,
                                            function (err, results, fields) {
                                                if (err) {
                                                    reject(-5)
                                                }
                                                //写新文件
                                                fs.writeFileSync(filename, JSON.stringify(result))
                                                connection.release();
                                                resolve()

                                            })

                                    })


                            })
                    }


                }
            )
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