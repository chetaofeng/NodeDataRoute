//本程序负责从中心服务中下载文件，并放到指定文件夹
//存取文件的类
var fs = require('fs')
//处理路径的类
var path = require('path')
//存放配置文件
var config = require('./config')
var http = require('http')

//连接Mysql数据库
var mysql = require('mysql');
//创建mysql数据库连接池
var pool = mysql.createPool(
    config.mysql
);

//生成黑名单列表
var tableList = ['T_SECU_ROLE',
    'T_SECU_FUNCTIONS',
    'T_CARD_DISCOUNT_INFOR',
    'T_COMM_NODE',
    'T_COMM_ORGAN',
    'T_COMM_ROAD',
    'T_DICT_VEHICLE_CASE',
    'T_SPEED_LIMIT',
    'T_WEIGHT_PARAM',
    'TBL_VEHICLE_BLACK'
]


var tableName
//tableName='node_user'
var index = -1

//Promise函数，用来获取第一个待传文件名称
var getFirstFile = function () {
    return new Promise(function (resolve, reject) {
        index = index + 1
        if (index == tableList.length) {
            index = 0
        }
        tableName = tableList[index]
        resolve()
    })
}


//获取特定文件的当前版本号
var getDownLoadVer = function (fileName) {
    var kk = fs.readdirSync('./public/subcentergetdownload/version/')
    var rt = fileName+'.000'
    for (var item in kk) {
        if (kk[item].indexOf(fileName) > -1) {
            rt =kk[item]
        }
    }
    return rt
}



//中心运行参数下载服务接口
var senddata = function () {
    return new Promise(function(resv,reject) {

            var data=JSON.stringify({
                TABLENAME:tableName,
                TABLEVERSION:getDownLoadVer(tableName)
            })


            //设置参数
            var opt = {
                method: 'GET',
                host: config.cen_host.host,
                port: config.cen_host.port,
                path: "/centerdown",
                headers: {
                    "Content-Type": 'application/json',
                    "Content-Length": data.length
                }
            }


            //console.log(opt)


            const req = http.request(opt, function (res) {

                console.log(res.statusCode);
                console.log(JSON.stringify(res.headers));


                var file
                var file1
                var server_filename
                var head = res.headers['content-type']

                //判断返回文档类型 如果是二进制则保存
                if(head=='application/octet-stream')
                {
                    server_filename='./public/subcentergetdownload/' + res.headers['content-disposition'].split('filename=')[1].replace(/\"/g,'')
                    server_filename1='./public/subcentergetdownload/version/' + res.headers['content-disposition'].split('filename=')[1].replace(/\"/g,'')
                    if(fs.existsSync('./public/subcentergetdownload/version/'+tableName))
                    {
                        fs.unlinkSync('./public/subcentergetdownload/version/'+tableName)
                    }


                    file = fs.createWriteStream(server_filename);
                    file1 = fs.createWriteStream(server_filename1);
                }

                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    if(head=='application/octet-stream') {
                        file.write(chunk);
                        file1.write(chunk);
                    }
                });
                res.on('end', function () {
                    if(head=='application/octet-stream') {
                        file.end();
                        file1.end();
                    }

                    //console.log('okaaa')
                    resv()
                });
            });

            req.on('error', function (e) {
                console.log(e.message);
                reject(-2)
            });


            req.write(data);
            req.end();

        }
    )
}




var bg = function () {
    getFirstFile().then(senddata).then(function () {
        setTimeout(function () {
            bg()
        }, 3000)
    }).catch(function () {
        setTimeout(function () {
            bg()
        }, 3000)
    })
}

getFirstFile().then(senddata).then(function () {
    console.log('ok')
}).catch(function (err) {
    console.log(err)
    //console.log('err')
})


