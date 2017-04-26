var log4js = require("log4js");
log4js.configure({
  "appenders": [
    {
      "type": "file",
      "filename": "logs/index.log",
      "maxLogSize": 2048000,
      "backups": 3,
      "category": "index"
    },
    {
      "type": "file",
      "filename": "logs/dataincome.log",
      "maxLogSize": 2048000,
      "backups": 3,
      "category": "dataincome"
    },
    {
      "type": "file",
      "filename": "logs/imageincome.log",
      "maxLogSize": 2048000,
      "backups": 3,
      "category": "imageincome"
    },
    {
      "type": "file",
      "filename": "logs/cen_mongo.log",
      "maxLogSize": 2048000,
      "backups": 3,
      "category": "cen_mongo"
    },
    {
      "type": "file",
      "filename": "logs/cen_mssql.log",
      "maxLogSize": 2048000,
      "backups": 3,
      "category": "cen_mssql"
    },
    {
      "type": "file",
      "filename": "logs/cen_ora.log",
      "maxLogSize": 2048000,
      "backups": 3,
      "category": "cen_ora"
    },
    {
      "type": "file",
      "filename": "logs/cen_mysql.log",
      "maxLogSize": 2048000,
      "backups": 3,
      "category": "bb"
    }

  ],
  "replaceConsole": true
});
module.exports = log4js
