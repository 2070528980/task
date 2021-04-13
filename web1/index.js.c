
// 路由

var R = new Router();
R.init();

R.route('/task', function () {

    $("#result").load("task/EditTask.html");

});
R.route('/role', function () {

    $("#result").load("test1");

});
R.route('/setUp', function () {

    $("#result").load("test2");

});


function Router() {
    this.routes = {};
    this.curUrl = '';

    this.route = function (path, callback) {
        this.routes[path] = callback || function () {
        };
    };

    this.refresh = function () {
        this.curUrl = location.hash.slice(1) || '/';
        this.routes[this.curUrl]();
    };

    this.init = function () {
        window.addEventListener('load', this.refresh.bind(this), false);
        window.addEventListener('hashchange', this.refresh.bind(this), false);
    };
}


