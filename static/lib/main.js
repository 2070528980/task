

// requireJS

var options = {
    paths: { // 配置加载路径
          'jquery': '../../plugin/jquery/jquery-1.10.2.min',
          'layer': '../../plugin/layui/layui.all',
         'index': '../../web/index',
          'core': 'common.lib'
    }
};

// 初始化requrejs
window.require.config(options);

// 这里必须加上才会调用js,加上index才会访问index文件
window.require(["jquery","layer","index","core"],function($,layui,inde,core){
        // console.log(core.getRootUrl());
});




