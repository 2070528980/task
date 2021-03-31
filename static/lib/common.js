
// 公共配置

var apiUrl = "http://localhost/";
var pro = window.location.protocol;


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