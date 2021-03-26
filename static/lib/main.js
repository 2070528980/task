

// requireJS

var options = {
    baseUrl: '', //js文件存放的路径
    paths: { // 配置加载路径
          'jquery': '../../plugin/jquery/jquery-1.10.2.min',
          'layer': '../../plugin/layer/layer',
         'index': '../js/index.js',
          'core': 'common.lib'
    },
    shim: {
        'jquery': {
            exports: 'jquery',
        },
        'layer': {
            exports: 'layer',
        }
    }
};

// 初始化requrejs
window.require.config(options);




