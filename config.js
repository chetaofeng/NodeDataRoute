module.exports = {
  local: {
    node_id: 29187,
    node_name: '渭源收费站',
    node_type: 1,
    mongo_collection: 'images',
    host: '192.168.1.115',
    port: 3000,
    mongo_url: 'mongodb://10.62.94.98:27017/images',

    //站级
    station_income_path: __dirname + '/public/stationincome/',
    station_image_income_path: __dirname + '/public/stationimageincome/',
    station_mysql_path: __dirname + '/public/stationmysql/',
    station_image: __dirname + '/public/stationimage/',

    sub_path: __dirname + '/public/subcenter/',
    center_path: __dirname + '/public/center/',

    //分中心
    sub_income_path: __dirname + '/public/subcenterincome/',
    sub_mysql_path: __dirname + '/public/subcentermysql/',

    //中心
    center_image_path: __dirname + '/public/centerimage/',

    center_income_path: __dirname + '/public/centerincome/',
    center_oracle_path: __dirname + '/public/centeroracle/',
    center_mssql_path: __dirname + '/public/centermssql/',
    center_mysql_path: __dirname + '/public/centermysql/',
    center_mongo_path: __dirname + '/public/centermongodb/'

  },
  mysql: {
    host: '127.0.0.1',
    user: 'root',
    password: 'wtq',
    database: 'TOLL_DB',
    port: 3306
  },
  mssql: {
    user: 'sa',
    password: 'sa',
    server: '192.168.0.127',
    database: 'DB_STATION30',
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },
  oracle: {
    user: 'ENCS_TEST',
    password: 'ENCS_TEST',
    connectString: '10.62.0.115/ENCSDB'
  },
  blacklist: {
    localpath: __dirname + '/public/blacklist/',
    url: 'mongodb://10.62.0.158:3000/DOWNLOAD_DB',
    host: '10.62.0.158',
    port: 3000,
    database: 'DOWNLOAD_DB',
    tablename: 'black_list',
    interval: 60000
  },
  timespan:{
    dataretry:10,
    dataerror:200000,
    scan:100000
  },
  image: {
    host: '10.62.0.158',
    port: 3000,
    database: 'images',
    url: 'mongodb://10.62.0.158:3000/images',
    collection: 'images'
  },
  centermongo: {
    host: '192.168.1.115',
    port: 3000,
    database: 'enc_center',
    url: 'mongodb://192.168.1.115:27017/enc_center'
  },
  cen_host:{
    host: '192.168.1.110',
    port: 3000
  },
  up_host: {
    host: '192.168.1.115',
    port: 3000
  }
}


/*
 关于测试nodejs数据路由服务的申请

 现状

 数据传输在联网收费系统中是一个非常重要的组件，主要用来数据上传、下载、图像上传、获取、黑名单、费率信息、收费参数、软件自动下发、数据转发、监控信息上传等等所有与网络相关的业务都要通过该服务完成，但在目前的应用主存在以下问题.

 1.软件维护量大，需要公司的3-4名公司骨干员工专门维护该服务、qt、java、c#各种开发工具开发的，运行在windows、ubuntu、centos的各种版本上、需要访问oracle、mysql、mongdb、sqlite、hadoop等各种数据库上、造成软件的开发量极大，兼容性较差

 采用nodejs进行开发、核心代码只有几百行，只要一名普通程序员经过简单的培训即可对所有的软件进行维护

 2.通用性不好，每次业务发生变化，从车道、站级服务器、分中心服务器、中心都需要修改软件、动态库、数据库、服务软件等，工作量极大，容易出现问题，开发周期长

 在传输的过程中采用json自描述对象，不会因为车道的数据库变动而修改传输服务

 3.组件依赖性强，需要安装java虚拟机、bootstrap、apache、tomcat、ftp服务以及各种依赖的软件包以及各种数据库的驱动、插件等、任何一个环节出现问题都会导致系统无法正常运行

 绿色安装、只需要将软件代码及依赖组件从开发环境上拷贝到即可、通过调运nodejs包可实现以上各种服务，不需要安装任何的服务及组件

 4.部署复杂 存在各种版本的应用程序及组件，需要大量的调试和配置工作、对运维人员的要求较高，工作量大

 只需要将同样的文件夹拷贝到站、分中心、中心，简单修改配置文件即可，软件测试稳定后可实现自动化部署

 5.功能缺失 服务器的监控信息采集、黑名单同步、图像上传获取、费率等收费参数的下载、软件、服务自动化部署等功能缺失 已经实现了所有的接口功能、并且将图像存储到站级和中心mongodb中，可实现毫秒级获取全省图像

 7.跨平台性 采用socket是一种持续连接的网络状态，在数据库或网络出现问题时会出现传输中断，需要重新启动软件或服务，

 要通过http进行连接、可以适应各种应用场景
 * */

//npm install oracledb --python=python2.7  --save
//export OCI_LIB_DIR=/Users/qiang/instantclient/instantclient_12_1
//export OCI_INC_DIR=/Users/qiang/instantclient/instantclient_12_1/sdk/include

/*
 npm config set registry https://registry.npm.taobao.org
 yum install libaio



 //升级c++ 到11
 //wget http://people.centos.org/tru/devtools-2/devtools-2.repo -O /etc/yum.repos.d/devtools-2.repo

 */
/*
 在终端上输入：~ hostname
 localhost
 查看/etc/hosts文件：~ cat /etc/hosts
 127.0.0.1 localhost
 保持hostname与hosts文件中127.0.0.1对应的名称一致即可！
 */
/*
 mongodb:10.62.0.1
 oracle:
 mysql:10.62.0.61  encs_sj_center

 qita sqlserver


 1.接收上来的数据直接给车道返回OK，并将文件存储到income_data中
 2.遍历income_data文件夹，解析每个文件，并将每个文件根据属性存放到指定文件夹中，并删除原文件




 接收下级发送上来的数据文件
 income_data

 1.遍历local_data，并将数据存储到本地数据库中，如果出现错误，则写错误日志，成功则删除文件

 需要插入到本地数据库数据文件夹
 local_data               1

 1.遍历subcenter_data，并将数据提交给分中心路由服务，成功删除，失败写日志，休眠后重新传
 需要上传到分中心的数据库文件夹
 subcenter_data          10

 需要上传到中心oracle的数据库文件夹
 center_oracle_data     100

 需要上传到中心mysql的数据库文件夹
 center_mysql_data     1000

 需要上传到中心sqlserver的数据库文件夹
 center_mssql_data    10000

 */