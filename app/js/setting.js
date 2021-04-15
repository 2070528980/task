// 公共配置

// var apiUrl = "http://94.191.115.200";
var apiUrl = "http://127.0.0.1";
var pro = window.location.protocol;

function  getAPIUrl() {
    if ('https:' == pro) {
        apiUrl = pro + "//" + window.location.host + ":" + window.location.port + "/";
    }
    return apiUrl;

}


// 生成随机数
function getRand(min,max) {
    return Math.floor(Math.random()*(max-min))+min;
}
