


layui.use('table', function () {

    var table = layui.table;

    //监听工具条  test为加载的table的elem
    table.on('tool(test)', function (obj) {
        var userID = obj.data.userID;
        var userName = obj.data.userName;
        var data_id = 66 + userID;
        // 详情
        if (obj.event === 'details') {
            // window.parent.OpenTab("/windControlManagement/loan_risk_details?userID=" + userID, data_id, obj.data.userName + "-详情");
        }
        //编辑
        else if (obj.event === 'bt_edit') {

            // if(obj.data.FName==("进件中")||obj.data.FName==("初审中")||obj.data.FName==("复审中")){
            //     window.parent.OpenTab("/windControlManagement/loan_situation_edit?userID="+userID,data_id+20,obj.data.userName+"-编辑");
            // }else{
            //     layer.msg('复审过后的资料不能编辑！');
            // }
        }

    });


    //加载表格
    var tableIns = table.render({
        elem: '#test'
        , url: '/windControlManagement/getDKJD'   //获取json的地址
        // , toolbar: '#toolbarDemo' //上方工具栏
        , title: '贷款进度' //定义 table 的大标题（在文件导出等地方会用到）
        , totalRow: true //是否合计
        // , width: tWidth
        , cellMinWidth: 50 //全局定义常规单元格的最小宽度，layui 2.2.1 新增
        , id: 'testReload'
        , cols: [[       //sort 是否显示排序icon   hide 是否隐藏  totalRowText 显示自定义的合计文本
            {type: 'checkbox'}
            , {field: 'xuHao', title: '序号', type: 'numbers'}
            , {field: 'userID', title: '内码', type: 'numbers', hide: true}
            , {field: 'userName', title: '主借人姓名', width: 100, totalRowText: '合计'}
            , {field: 'phoneNumber', title: '主借人手机号', width: 150}
            , {field: 'id_number', title: '主借人身份证号', width: 200}
            , {field: 'marriage', title: '婚姻状况',width:100}
            , {field: 'userName2', title: '共同借款人姓名', width: 150}
            , {field: 'phoneNumber2', title: '共同借款人手机号', width: 150}
            , {field: 'id_number2', title: '共同借款人身份证号', width: 200}
            , {field: 'FName', title: '当前状态', width: 100}
            , {field: 'createDate', title: '申请日期', width: 170}
            , {field: 'updateDate', title: '最近操作日期', width: 170, sort: true}
            , {field: 'note', title: '备注', width: 170}
            , {fixed: 'right', title: '操作', width: 245, toolbar: '#barDemo'}
        ]]
        , page: true
        , where: {
            loan_state: 2
        }
    });

    //搜索按钮单击事件
    $('.layui-form-item .layui-btn').on('click', function () {

        var userName = $('#userName').val();
        tableIns.reload({
            where: { //设定异步数据接口的额外参数，任意设
                userName: userName
            }
            , page: {
                curr: 1 //重新从第 1 页开始
            }
        });

    });

});