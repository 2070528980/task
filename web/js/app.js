/**
 项目JS主入口
 **/
var GLOAB_VIEW_PATH = './';
layui.define(['laytpl', 'layer', 'element', 'form'], function (exports) {

    var laytpl = layui.laytpl
        , layer = layui.layer
        , element = layui.element
        , form = layui.form
        , $ = layui.$;
    var check = function () {
        var router = layui.router(location.hash)
            , params = router.search
            , path = router.path;


        // 通过 path 获得对应 view
        var view_path = GLOAB_VIEW_PATH, view_html = '';
        for (i = 0; i < path.length; i++) {
            view_path = view_path + '/' + path[i];
        }
        if (!path[0]) {
            view_path = view_path + '/index';
        }
        if (!path[1]) {
            view_path = view_path + '/index';
        }
        view_path += '.html';
        // console.log("path:"+path);
        // console.log("view_path:"+view_path);
        // var loading = layer.load(2);
        $.ajax({
            type: 'get'
            , url: view_path
            , success: function (res) {
                // console.log(res);
                // 填充到页面
                $('#result').html(res);
                // layer.close(loading);
                form.render();
            }
            , error: function (res) {
                layer.msg('模板不存在');
                // layer.close(loading);
                return 0;
            }
            , complete: function () {
                // layer.close(loading);

            }
        });
    };

    check();
        window.addEventListener('hashchange', function () {
        check();
    });

    // setting-icon
    $('.setting-icon').hover(function () {
        $(this).addClass('layui-anim layui-anim-rotate layui-anim-loop');
    }, function () {
        $(this).removeClass('layui-anim layui-anim-rotate layui-anim-loop');
    });

     // 侧边栏
    $('li.layui-nav-item').click(function () {

        // console.log($(this).hasClass("layui-nav-itemed"))
            
        // $(this).parent('li').removeClass("layui-nav-itemed");
        //
        // console.log($(this).closest("li").hasClass("layui-nav-itemed"))
        // if ($(this).closest("li").hasClass("layui-nav-itemed")) {
        //      $(this).closest("li").removeClass("layui-nav-itemed");
        // }
        // else {
        //      $(this).closest("li").addClass("layui-nav-itemed");
        // }
        // $(this).closest("li").addClass("layui-nav-itemed");

        // if ($(this).attr('href') != 'javascript:;') {   // 排除一级折叠菜单
        //     layui.data('layui-this', {key: 'href', value: $(this).attr('href')});
        //     $('.layui-nav-item a').parent('dd').removeClass('layui-this');
        //     $('.layui-nav-item a').parent('li').removeClass('layui-this');
        // }
    });


     // 设置侧边栏导航高亮
    var layui_side_a_href = layui.data('layui-this');
    $('.layui-nav-item a').parent('li').removeClass("layui-nav-itemed");
    $('.layui-nav-item a[href=\'' + layui_side_a_href.href + '\']').parent('dd').addClass('layui-this');
    $('.layui-nav-item a[href=\'' + layui_side_a_href.href + '\']').parent('li').addClass('layui-this');
    $('.layui-nav-item a[href=\'' + layui_side_a_href.href + '\']').closest("li").addClass("layui-nav-itemed");


    exports('app', {});
});
