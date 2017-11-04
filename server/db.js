var mysql = require('mysql');

var connection = mysql.createConnection({
    host: '数据库地址',
    user: '数据库账号',
    password: '数据库密码',
    database: '数据库',
    useConnectionPooling: true
});

module.exports = {
    checkAuth(OPEN_ID){
        var sql = 'select * from tp_wx where OPEN_ID = ?';
        return new Promise((resolve, reject) => {
            connection.query(sql, OPEN_ID, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        })
    }
};