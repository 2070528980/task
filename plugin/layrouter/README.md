# layrouter

Layui Router

[在线示例](https://taadis.gitee.io/layrouter/)

## 使用

首先注册路由

``` js
// 注册一个或多个路由
layrouter.register('home', function(){
    // 做你爱做的事...
    // 通常是加载页面/改变局部DOM
});

// 初始化
// 监听 hash 事件
layrouter.init();
```

## 参考

- [Layui 第三方组件发布规范](https://fly.layui.com/extend/demo/)