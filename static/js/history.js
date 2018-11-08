app.controller('myCtrl', function ($scope, $http, $interval) {
    $scope.select_date = "";
    $scope.table_result = [];
    $scope.loadChart = function () {
        if (!$scope.select_date) {
            $scope.select_date = new Date().Format("yyyy-MM-dd");
        }
        var params = {
            "user_id": localStorage.getItem("kanban_userid"),
            "select_date": $scope.select_date
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
                dawnHistoryChart(result, changeShow);
            },
            error: function (xhr, textStatus) {
                // 调用时，发生错误
                toastr.warning(textStatus);
            }
        })
    }
    $scope.doSearch = function () {
        $scope.loadChart();
        toastr.success("search success");
    };
    $scope.loadChart();
});





