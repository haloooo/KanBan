app.controller('myCtrl', function ($scope, $http, $interval) {
    $scope.table_result = [];
    $scope.loadChart = function () {
        var params = {
            "user_id": localStorage.getItem("kanban_userid")
        };
        $.ajax({
            url: "initData",  //获取
            type: 'GET', //GET、PUT、DELETE
            async: false,    //是否异步
            data: params,
            timeout: 10000,    //超时时间
            dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                // 1. 清空div
                result = data["chart_data"];
                $scope.table_result = data["table_data"];
                // 3. 生成图表
                dawnChart(result, changeShow);
            },
            error: function (xhr, textStatus) {
                // 调用时，发生错误
                toastr.warning(textStatus);
            },
            complete: function (XMLHttpRequest, textStatus) {
                // 交互后处理
            }
        })
    }
    $scope.loadChart();

    $http.get("time_interval").success(function (result) {
        // console.log(result[0].time);
        var time = result[0].time * 1000;
        $scope.timer = $interval(function () {
            $scope.loadChart();
        }, time);
    });
});





