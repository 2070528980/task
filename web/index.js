define(['require', 'jquery', 'layer'], function (require, $, layer) {
    //加载依赖js,
    layui.config({
        base: '../plugin/layrouter/layui_exts/',
        // version: new Date().valueOf()
    }).extend({
        layrouter: 'layrouter/layrouter'
    }).use(['layrouter', 'layer', 'element'], function () {
        var layrouter = layui.layrouter;
        var layer = layui.layer;
        var element = layui.element;

        // 注册一些路由
        layrouter.register('/task', function () {
            $("#result").load("task/EditTask.html");
        });
        layrouter.register('/role', function () {
            $("#result").load("test/test1.html");
        });
        layrouter.register('/setUp', function () {
            $("#result").load("test/test2.html");
        });

        // 初始化
        // 监听 hash 事件
        layrouter.init();
    });

    function logout() {

        var index = layer.load(1);
        $.ajax({
            type: "POST",
            url: APIUrl + "api/login/logout",
            data: {},
            dataType: "json",
            success: function (data) {
                console.log(data);
                setTimeout(function () {
                    window.location.href = "/taskPlatform-web/web/login.html";
                }, 1000);
            }
            , error() {
                layer.msg('请检查网络设置，再重试');
            }
            , complete: function () {
                layer.close(index);

            }
        });

    }


});