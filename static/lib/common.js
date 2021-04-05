
// 公共配置

var apiUrl = "http://127.0.0.1/";
var pro = window.location.protocol;

var jsonParam = {};

function getJson() {
    return jsonParam;
}

function setJson(key,value) {
    jsonParam[key]=value;
}


function  getAPIUrl() {
    if ('https:' == pro) {
        apiUrl = pro + "//" + window.location.host + ":" + window.location.port + "/";
    }
    return apiUrl;

}


//
// if ('http:' == pro) {
//     apiUrl = "http://localhost:8081/";
//     // console.log(apiUrl)
// } else if ('https:' == pro) {
//     apiUrl = pro + "//" + window.location.host + ":" + window.location.port + "/";
//     console.log(apiUrl)
// } else {
//
// }