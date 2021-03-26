
define([
    'jquery'

], function ($) {//加载依赖js,
    var cms = { };

    /**
     * 获取URL参数
     * @returns {string} key
     */
    cms.getParameter = function(key) {
        if(location.search){
            var paramStr = location.search.split('?')[1];
            var temp = paramStr.split('&');
            if(!temp){ return; }
            for(var i=0; i<temp.length;i++){
                var data = temp[i].split('=');
                if(data[0] === key){
                    return data[1];
                }
            }
        }
    }
    /**
     * 是否debug模式
     * @returns {boolean}
     */
    cms.isDebug = function(){
        return cms.getParameter("debug") == 'true'?true:false;
    }

    /**
     * 日志打印
     * @param str
     */
    cms.info = function(str) {
        if (cms.isDebug()){
            console.log(str);
        }
    }


    var version = "dev-version";
    cms.version = version; // 版本号码
    cms.info('version = ' + version);

    function getProtocol(){
        return window.location.protocol;
    }

    /**
     * API URL 地址 配置
     * @type {string}
     */
    var apiUrl = "";
    if('http:' == getProtocol()){
        apiUrl = "http://localhost:8081/";
        console.log(apiUrl)
    } else if('https:' == getProtocol()){
        apiUrl = getProtocol()+"//" + window.location.host + ":" +window.location.port + "/";
        console.log(apiUrl)
    } else {

    }
    cms.info('apiUrl = ' + apiUrl);



    cms.baseRequest = function (method, cb, data) {
        data = data || {};
        var url = data._url;
        delete data._url;

        var async = true;
        if(data.async != undefined){
            async = data.async;
            delete data.async;
        }

        if(method == 'put'){
            data._method = 'put';
            method = 'post';
        }
        if(method == 'delete'){
            data._method = 'delete';
            method = 'post';
        }

        var newkey = Object.keys(data).sort();

        var str = '';
        for (var i = 0; i < newkey.length; i++) {
            var key = newkey[i];
            var val = data[key];
            if((!isEmpty(val))){
                if('file' == key){ continue; } // 文件参数自动过滤，不做签名算法
                if('debug' == key){ continue; } // 文件参数自动过滤，不做签名算法
                if('sign' == key){ continue; } // 文件参数自动过滤，不做签名算法
                if('content' == key){ continue; } //内容过多的
                str += key + '=' + val + '&';
            }

        }
        // 判断字符是否为空的方法
        function isEmpty(obj){
            if(typeof obj == "number"){
                return false;
            }
            if(typeof obj == "undefined" || obj == null || obj == "" ){
                return true;
            }else{
                return false;
            }
        }

        var signKey = Date.now();
        data.sign = sign(str, signKey);

        var requestUrl = url;
        if(url.indexOf('http') == -1){
            requestUrl = apiUrl + url
        }

        $.ajax({
            url: requestUrl,
            type: method,
            data: data,
            async: async,// 是否异步请求
            timeout: 20000,
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            headers: {
                sign_key: signKey
            },
            crossDomain: true,
            complete: function (xhr, status) {
                if (xhr.status == 200 && status == 'success') {
                    var result = JSON.parse(xhr.responseText);
                    cb(result);
                } else if(xhr.status == 405){
                    var result = JSON.parse(xhr.responseText);
                    layer.msg(result.message);
                } else if (status == 'timeout') {
                    layer.closeAll('loading');
                    layer.msg('请求超时，请稍后重试');
                } else if(xhr.status == 0){
                    layer.msg('请检查您的网络设置，再重试！');
                } else {
                    console.error(xhr);
                    layer.closeAll('loading');
                    layer.msg('服务器繁忙，请稍后重试！');
                }
            }
        })
    };
    cms.formDataRequest = function (cb, data, formData) {
        data = data || {};
        var url = data._url;
        delete data._url;



        var str = '';
        var reqDatas = [];
        for (var i in data){
            if(data[i] != null && data[i] != undefined){
                if('file' == i){ continue; } // 文件参数自动过滤，不做签名算法
                if('debug' == i){ continue; } // 文件参数自动过滤，不做签名算法
                if('sign' == i){ continue; } // 文件参数自动过滤，不做签名算法
                reqDatas.push(i + "=" + data[i]);
                formData.append(i, data[i]);
            }
        }
        str += reqDatas.sort().join("&")+"&";
        var time = Date.now();
        formData.append("sign", sign(str, time));


        var requestUrl = url;
        if(url.indexOf('http') == -1){
            requestUrl = apiUrl + url
        }
        $.ajax({
            url: requestUrl,
            type: 'post',
            data: formData,
            timeout: 600000,
            contentType : false,
            cache: false,
            processData: false,
            xhrFields: {
                withCredentials: true
            },
            headers: {
                time: time
            },
            crossDomain: true,
            complete: function (xhr, status) {
                if (xhr.status == 200 && status == 'success') {
                    var result = JSON.parse(xhr.responseText);
                    cb(result);
                } else if (status == 'timeout') {
                    layer.closeAll('loading');
                    layer.msg('请求超时，请稍后重试');
                } else {
                    console.error(xhr);
                    layer.closeAll('loading');
                    layer.msg('请求失败，请稍后重试');
                }
            }
        })
    }


    /**
     * 公共调用处理参数。
     *
     * @param method
     * @param url
     * @param params
     * @param cb
     */
    cms.invoke = function (method, url, params , cb) {
        if(params){
            params._url = url;
        }else{
            params = {_url : url };
        }
        params = params || {method : method };

        if(cms.isDebug()){// URL参数存在debug，为debug模式
            params.debug = true;
        }

        if(params.formdata){
            var formData = params.formdata;
            delete params.formdata;
            cms.formDataRequest(cb,params,formData)
        }else{
            cms.baseRequest(method, cb, params);
        }

    }

    /**
     * get请求
     * @param url 接口地址
     * @param params 参数
     * @param cb 回调函数
     */
    cms.get = function (url, params , cb) {
        cms.invoke('get', url, params, cb);
    }


    /**
     * post请求
     * @param url 接口地址
     * @param params 参数
     * @param cb 回调函数
     */
    cms.post = function(url, params , cb){
        cms.invoke('post', url, params, cb);
    }
    cms.put = function(url, params , cb){
        cms.invoke('put', url, params, cb);
    }
    cms.delete = function(url, params , cb){
        cms.invoke('delete', url, params, cb);
    }


    /**
     * JSON对象转url参数
     * @param json
     */
    cms.jsonToParams = function(json){
        var params = Object.keys(json).map(function (key) {
            return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
        }).join("&");
        return params;
    }


    /**
     * 验证是否有权限
     * (必须加载了权限才能调用)
     *
     * @param permission 权限标识
     */
    cms.hasPermission = function(permission){
        var permissions = window.permissions;
        if(permissions){
            for(var i =0;i<permissions.length; i++){
                if(permission == permissions[i]) {
                    return true;
                }
            }
        }
        return false;
    }


    /**
     * 格式化时间
     * （yyyy-MM-dd hh:mm:ss）
     * @param time long
     */
    cms.formatTime = function(time){
        return new Date(time).format("yyyy-MM-dd hh:mm:ss");
    }

    /**
     * 创建单号
     * （yyyyMMddhhmmss）
     * @param time long
     */
    cms.makeOrderCode = function(time){
        var rand = Math.floor(Math.random() * 900) + 100;
        var time = new Date(time).format("yyyyMMddhhmmss");
        return time + rand;
    }

    /**
     * 格式化时间
     * （yyyy-MM-dd）
     * @param time long
     */
    cms.formatDay = function(time){
        return new Date(time).format("yyyy-MM-dd");
    }

    /**
     * 格式化时间
     * （yyyy-MM-dd）
     * @param time long
     */
    cms.formatMonth = function(time){
        return new Date(time).format("yyyy-MM");
    }

    /**
     * 格式化时间
     * （yyyy-MM-dd）
     * @param time long
     */
    cms.formatYear = function(time){
        return new Date(time).format("yyyy");
    }



    /**
     * 获取上一个月
     *
     * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
     */
    cms.getPreMonth = function(date) {
        var arr = date.split('-');
        var year = arr[0]; //获取当前日期的年份
        var month = arr[1]; //获取当前日期的月份
        var day = arr[2]; //获取当前日期的日
        var days = new Date(year, month, 0);
        days = days.getDate(); //获取当前日期中月的天数
        var year2 = year;
        var month2 = parseInt(month) - 1;
        if (month2 == 0) {
            year2 = parseInt(year2) - 1;
            month2 = 12;
        }
        var day2 = day;
        var days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();
        if (day2 > days2) {
            day2 = days2;
        }
        if (month2 < 10) {
            month2 = '0' + month2;
        }
        var t2 = year2 + '-' + month2 + '-' + day2;
        return t2;
    }

    /**
     * layer 加载精度条
     */
    cms.loading = function(){
        return layer.load(1, {
            shade: [0.1,'#fff'] //0.1透明度的白色背景
        });
    }

    /**
     * 客户端类型
     * (支持debug模式，渠道)
     */
    cms.clientType = function(){
        if(cms.isDebug()){
            var s = cms.getParameter("s");
            if(s){
                return s;
            }
        }

        var ua = navigator.userAgent.toLowerCase();
        if(ua.indexOf('heshenghuo') >= 0){// 和生活
            return 'hsh';
        }
        if(ua.indexOf('micromessenger') >= 0) { // 微信浏览器
            return 'weixin';
        }
        return 'other';
    }

    /**
     * 显示消息
     * @param msg 消息内容
     */
    cms.showMessage = function(msg){
        if(window.layer){
            layer.msg(msg);
        }else{
            alert(msg);
        }
    }







    /**
     * 获取根路径
     * @returns {string}
     */
    cms.getRootPath = function (){
        return document.location.protocol + '//' + window.location.host;
    }


    /**
     * 获取Web根路径，
     * @returns {string}
     */
    cms.getRootUrl = function(){
        var url = document.location.protocol + '//' + window.location.host;;
        var pathname = location.pathname;
        var index = pathname.lastIndexOf('/');
        return  url + pathname.substring(0,index);
    }


    /**
     * 获取URL参数对象
     * @returns {string} key
     */
    cms.getParameters = function() {
        var params = {};
        if(location.search){
            var paramStr = location.search.split('?')[1];
            var temp = paramStr.split('&');
            if(!temp){ return; }
            for(var i=0; i<temp.length;i++){
                var data = temp[i].split('=');
                if(data.length==2){
                    params[data[0]] = data[1];
                }
            }
        }
        return params;
    }






    /**
     * 获取layui的id集合
     *（逗号间隔的）
     * @param checkStatus
     * @returns {string}
     */
    cms.getLayUITableIdStatus = function(checkStatus){
        var data = checkStatus.data;
        var strs = [];
        $.each(data, function(i, o){
            strs.push(o.id);
        });
        return strs.join(',');
    }



    /**
     * cms 统计
     * (封装了百度统计的代码)
     * @type {{push: cms.count.push}}
     */
    cms.count = {
        extendInfo : function(){
           return {
                debug: cms.isDebug(),
                screen: cms.count.getScreen(),
                flash: cms.count.checkFlash(),
                system: cms.count.getSysInfo(),
                browser: cms.count.GetBrowserType(),
                browserVersion : cms.count.GetBrowserVersion(),
                language: cms.count.getLang(),
                phone: cms.count.getPhoneType(),
            }
        },

        /**
         *  推送前端统计消息
         *
         * 参数 例如：cms.count.push(['_trackEvent','download','jump',location.href]);
         * @param params
         */
        push : function(params){
            var type   = params[0];
            var option = params[1];
            var tag    = params[2];
            var desc   = params[3];

            var channel = cms.clientType();
            var isDebug  = cms.isDebug();

            var extend = cms.count.extendInfo();

            var data = {
                type: type,
                option: option,
                tag: tag,
                desc: desc,
                c: channel,
                ext: JSON.stringify(extend),
            }
            cms.invoke('collect', data, function(res){
                if(isDebug){  console.log(JSON.stringify(res)); }
            });
            // 调用百度统计
            if(window._hmt){
                _hmt.push([type, option, tag, location.href]);
            }

        }

        // 检查是否安装flash
        , checkFlash :  function (){
            var isIE = !-[1,];
            if(isIE){
                try{
                    new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                    return 1;
                } catch(e){
                    return 0;
                }
            } else {
                try{
                    var swf2 = navigator.plugins['Shockwave Flash'];
                    if(swf2 == undefined){
                        return 0;
                    }  else {
                        return 1;
                    }
                }catch(e){
                    return 0;
                }
            }
        },

        // 获取系统信息
        getSysInfo: function () {

            var ua = navigator.userAgent.toLowerCase();
            isWin7 = ua.indexOf("nt 6.1") > -1;
            isVista = ua.indexOf("nt 6.0") > -1;
            isWin2003 = ua.indexOf("nt 5.2") > -1;
            isWinXp = ua.indexOf("nt 5.1") > -1;
            isWin2000 = ua.indexOf("nt 5.0") > -1;
            isWindows = (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1);
            isMac = (ua.indexOf("macintosh") != -1 || ua.indexOf("mac os x") != -1);
            isAir = (ua.indexOf("adobeair") != -1);
            isLinux = (ua.indexOf("linux") != -1);

            if (isWin7) {
                sys = "Windows 7";
            } else if (isVista) {
                sys = "Vista";
            } else if (isWinXp) {
                sys = "Windows xp";
            } else if (isWin2003) {
                sys = "Windows 2003";
            } else if (isWin2000) {
                sys = "Windows 2000";
            } else if (isWindows) {
                sys = "Windows";
            } else if (isMac) {
                sys = "Macintosh";
            } else if (isAir) {
                sys = "Adobeair";
            } else if (isLinux) {
                sys = "Linux";
            } else {
                sys = "Unknow";
            }
            return sys;
        },

        // 获取浏览器类型
        GetBrowserType: function () {

            // chrome:mozilla/5.0 (windows nt 6.1; wow64) applewebkit/537.36 (khtml, like gecko) chrome/32.0.1700.76 safari/537.36
            // IE11:mozilla/5.0 (windows nt 6.1; wow64; trident/7.0; slcc2; .net clr 2.0.50727; .net clr 3.5.30729; .net clr 3.0.30729; media center pc 6.0; .net4.0c; .net4.0e; rv:11.0) like gecko
            // opera:mozilla/5.0 (windows nt 6.1; wow64) applewebkit/537.36 (khtml, like gecko) chrome/36.0.1985.125 safari/537.36 opr/23.0.1522.60
            // firefox:mozilla/5.0 (windows nt 6.1; wow64; rv:30.0) gecko/20100101 firefox/30.0
            var ua = navigator.userAgent.toLowerCase();

            if (ua == null) return "ie";

            else if (ua.indexOf('opr') != -1) return "opera";

            else if (ua.indexOf('chrome') != -1) return "chrome";

            else if (ua.indexOf('.net') != -1) return "ie";

            else if (ua.indexOf('safari') != -1) return "safari";

            else if (ua.indexOf('firefox') != -1) return "firefox";

            else if (ua.indexOf('ucbrowser') != -1) return "uc";

            else return "ie";

        },

        // 获取浏览器语言(小写)
        getLang: function  (){
            return navigator.language.toLowerCase();
        },

        // 获取浏览器版本
        GetBrowserVersion: function () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua == null) return "null";

            else if (ua.indexOf('opr') != -1) return ua.substring(ua.indexOf('opr') + 4, ua.length).split('.')[0];

            else if (ua.indexOf('chrome') != -1) return ua.substring(ua.indexOf('chrome') + 7, ua.length).split('.')[0];

            else if (ua.indexOf('.net') != -1) return ua.substring(ua.indexOf('rv:') + 3, ua.length).split('.')[0];

            else if (ua.indexOf('safari') != -1) return ua.substring(ua.indexOf('safari') + 7, ua.length).split('.')[0];

            else if (ua.indexOf('firefox') != -1) return ua.substring(ua.indexOf('firefox') + 8, ua.length).split('.')[0];

            else if (ua.indexOf('ucbrowser') != -1)  return ua.substring(ua.indexOf('ucbrowser') + 10, ua.length).split('.')[0];

            else return "null";

        },
        // 获取屏幕分辨率
        getScreen : function(){
            return window.screen.width +"*"+window.screen.height;
        },
        //获取手机型号函数begin
        getPhoneType: function(){
           //正则,忽略大小写
            var pattern_phone = new RegExp("iphone","i");
            var pattern_android = new RegExp("Android","i");
            var userAgent = navigator.userAgent.toLowerCase();
            var isAndroid = pattern_android.test(userAgent);
            var isIphone = pattern_phone.test(userAgent);
            var phoneType="phoneType";
            if(isAndroid){
                var zh_cnIndex = userAgent.indexOf("-");
                var spaceIndex = userAgent.indexOf("build",zh_cnIndex+4);
                var fullResult = userAgent.substring(zh_cnIndex,spaceIndex);
                phoneType=fullResult.split(";")[1];
            }else if(isIphone){
                //6   w=375    6plus w=414   5s w=320     5 w=320
                var wigth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                if(wigth>400){
                    phoneType = "iphone6 plus";
                }else if(wigth>370){
                    phoneType = "iphone6";
                }else if(wigth>315){
                    phoneType = "iphone5 or iphone5s";
                }else{
                    phoneType = "iphone 4s";
                }


            }else{
                phoneType = "您的设备太先进了";
            }




            return phoneType;
        }
    }



    function sign(str, signKey){
         // "; / ? : @ & = + $ , #"
        var param = encodeURIComponent(str + "key=" + signKey);
        cms.info("param:"+ param);
        var newStr = hex_md5(param).toUpperCase();
        cms.info("sign:"+ newStr);
        return newStr;
    };






    function Base64() {

        // private property
        _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for encoding
        this.encode = function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = _utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                    _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            }
            return output;
        }

        // public method for decoding
        this.decode = function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = _utf8_decode(output);
            return output;
        }

        // private method for UTF-8 encoding
        _utf8_encode = function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        }

        // private method for UTF-8 decoding
        _utf8_decode = function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    }





    /*
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for more info.
     */

    /*
     * Configurable variables. You may need to tweak these to be compatible with
     * the server-side, but the defaults work in most cases.
     */
    var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
    var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
    var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

    /*
     * These are the functions you'll usually want to call
     * They take string arguments and return either hex or base-64 encoded strings
     */
    function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
    function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
    function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
    function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
    function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
    function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

    /*
     * Perform a simple self-test to see if the VM is working
     */
    function md5_vm_test()
    {
        return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
    }

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length
     */
    function core_md5(x, len)
    {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;

        for(var i = 0; i < x.length; i += 16)
        {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
            d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
            d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
            d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
            d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
            d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
            c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
            d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
            c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
            d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
            c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
            d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
            c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
            d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
            d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
            d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
            d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
            d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
            d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
            d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
            d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);

    }

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    function md5_cmn(q, a, b, x, s, t)
    {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
    }
    function md5_ff(a, b, c, d, x, s, t)
    {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t)
    {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t)
    {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t)
    {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
     * Calculate the HMAC-MD5, of a key and some data
     */
    function core_hmac_md5(key, data)
    {
        var bkey = str2binl(key);
        if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

        var ipad = Array(16), opad = Array(16);
        for(var i = 0; i < 16; i++)
        {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }

        var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
        return core_md5(opad.concat(hash), 512 + 128);
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y)
    {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt)
    {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * Convert a string to an array of little-endian words
     * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
     */
    function str2binl(str)
    {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < str.length * chrsz; i += chrsz)
            bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
        return bin;
    }

    /*
     * Convert an array of little-endian words to a string
     */
    function binl2str(bin)
    {
        var str = "";
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < bin.length * 32; i += chrsz)
            str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
        return str;
    }

    /*
     * Convert an array of little-endian words to a hex string.
     */
    function binl2hex(binarray)
    {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++)
        {
            str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
                hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
        }
        return str;
    }

    /*
     * Convert an array of little-endian words to a base-64 string
     */
    function binl2b64(binarray)
    {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i += 3)
        {
            var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
            for(var j = 0; j < 4; j++)
            {
                if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
                else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
            }
        }
        return str;
    }

    // 请求路径
    cms.apiUrl = apiUrl;

    return cms;
});

