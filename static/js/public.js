var userid = localStorage.getItem("kanban_userid");
var result = [];//chart的数据集
var changeShow = false;
var chartList = [];
var app = angular.module('myApp', []);
app.controller('myHeader', function ($scope, $http) {
    $scope.allassys = [];
    $scope.head_name = "";
    $scope.show_assy = false;
    $scope.user_id = localStorage.getItem("kanban_userid");
    $scope.user_name = localStorage.getItem("kanban_user_name");
    $scope.true_name = localStorage.getItem("kanban_true_name");
    $scope.model_name = "";
    $scope.show_menu = false;
    $scope.oldpassword = "";
    $scope.newpassword = "";
    $scope.r_newpassword = "";
    $scope.loadAssy = function () {
        var params = {
            "user_name": $scope.user_name,
        };
        $.ajax({
            url: "getAllPlans",  //获取
            type: "GET", //GET、PUT、DELETE
            async: false,    //是否异步
            timeout: 10000,    //超时时间
            data: params,
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                $scope.allassys = data.data;

            },
            error: function (xhr, textStatus) {
                // 调用时，发生错误
                toastr.info(textStatus);
            },
            complete: function () {
                // 交互后处理
            }
        })
    };
    //确定
    $scope.saveAssy = function () {
        var num = 0; //记录选中的个数
        for (var i = 0; i < this.allassys.length; i++) {
            if (this.allassys[i]["is_select"]) {
                num = num + 1;
            }
        }
        if (num == 0) {
            toastr.warning("请至少选择一条");
            return;
        }
        var params = {
            "user_id": this.user_id,
            "assy_cds": JSON.stringify(this.allassys),
        };
        $.ajax({
            url: "saveUserAssy",  //获取
            type: "POST", //GET、PUT、DELETE
            async: false,    //是否异步
            headers: {"X-CSRFToken": getCookie("csrftoken")},
            timeout: 10000,    //超时时间
            data: params,
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                window.location.reload();
            },
            error: function (xhr, textStatus) {
                // 调用时，发生错误
                toastr.info(textStatus);
            },
            complete: function () {
                // 交互后处理
            }
        })
    };
    $scope.showSelect = function () {
        if (!$scope.show_assy) {
            $("#show_assy").show();
            $scope.show_assy = true;
        } else {
            $("#show_assy").hide();
            $scope.show_assy = false;
        }
        //关闭另一个
        $("#show_menu").hide();
        $scope.show_menu = false;
    }
    $http.get("time_interval").success(function (result) {
        $scope.model_name = result[0].model_name
    });
    $scope.loadAssy();
    $scope.showMenu = function () {
        if (!$scope.show_menu) {
            $("#show_menu").show();
            $scope.show_menu = true;
        } else {
            $("#show_menu").hide();
            $scope.show_menu = false;
        }
        $("#show_assy").hide();
        $scope.show_assy = false;
    };
    //注销
    $scope.logout = function () {
        // 清空 LocalSotrge
        localStorage.removeItem('kanban_userid');
        localStorage.removeItem('kanban_user_name');
        localStorage.removeItem('kanban_true_name');
        localStorage.removeItem('kanban_is_admin');
        localStorage.removeItem('kanban_see_plan');
        window.open('go_Login', '_self')
    };
    //修改密码
    $scope.showPassword = function () {
        $("#show_menu").hide();
        $scope.show_menu = false;
        $('#passwordModel').modal();
        $("#oldpassword").val("");
        $("#newpassword").val("");
        $("#r_newpassword").val("");
    };
});


//生成csrftoken
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return decodeURI(arr[2]);
    else
        return null;
}

$(function () {
    $("#go_homePage").show();
    $("#go_history").show();
    if (localStorage.getItem("kanban_is_admin") == "true") {
        $("#go_User").show();
    }
    if (localStorage.getItem("kanban_see_plan") == "true") {
        $("#go_Plan").show();
    }
    var strUrl = window.location.href;   //判断有没有登陆
    var arrUrl = strUrl.split("/");
    var strPage = arrUrl[arrUrl.length - 1];  //url
    if (strPage != "login.html") {
        if (localStorage.getItem("kanban_userid") == null) {
            window.open('go_Login', '_self'); //没找到apptoken就返回登陆界面
        }
        if (strPage == "go_homePage") {
            //隐藏setting和切换
            $("#display_switch").show();
            $("#display_setting").show();
            $("#display_title").show();
        }
        if (strPage == "go_history") {
            //隐藏setting和切换
            $("#display_switch").show();
            $("#display_setting").show();
        }
    }
    $("#" + strPage).addClass("active");
    switchEvent("#changeShow", function () {
        changeShow = true;
        if (strPage == "go_homePage") {
            dawnChart(result, changeShow);
        }
        if (strPage == "go_history") {
            dawnHistoryChart(result, changeShow);
        }
    }, function () {
        changeShow = false;
        if (strPage == "go_homePage") {
            dawnChart(result, changeShow);
        }
        if (strPage == "go_history") {
            dawnHistoryChart(result, changeShow);
        }
    });
});


function savePassword() {
    if (!$("#oldpassword").val() || $("#oldpassword").val() == "") {
        toastr.warning("原密码不能为空");
        return;
    }
    if (!$("#newpassword").val() || $("#newpassword").val() == "") {
        toastr.warning("新密码不能为空");
        return;
    }
    if (!$("#r_newpassword").val() || $("#r_newpassword").val() == "") {
        toastr.warning("请再次输入新密码");
        return;
    }
    if ($("#newpassword").val() != $("#r_newpassword").val()) {
        toastr.warning("新密码两次不一致");
        return;
    }
    if ($("#oldpassword").val() == $("#newpassword").val()) {
        toastr.warning("新密码不能与旧密码一致");
        return;
    }
    $.ajax({
        headers: {"X-CSRFToken": getCookie("csrftoken")},
        url: "updatePassword",
        type: 'POST', //GET、PUT、DELETE
        async: false,    //是否异步
        timeout: 10000,    //超时时间
        data: {
            "user_id": userid,
            "oldpassword": $("#oldpassword").val(),
            "newpassword": $("#newpassword").val(),
        },
        dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        beforeSend: function (xhr) {
            // 发送前处理
        },
        success: function (data, textStatus, jqXHR) {
            if (data.code == "0") {
                toastr.success("修改成功");
                $('#passwordModel').modal('hide');
            } else {
                toastr.error(data.msg);
            }
        },
        error: function (xhr, textStatus) {
            // 调用时，发生错误
            toastr.warning(textStatus);
        },
        complete: function () {
            // 交互后处理
        }
    })
}

//画现在chart
function dawnChart(result, changeShow) {
    $('#row').empty();
    if (chartList.length > 0) {
        for (var i = 0; i < chartList.length; i++) {
            chartList[i].destroy();
            chartList.splice(i, 1);
        }
    }
    for (var i = 0; i < result.length; i++) {
        var time_interial = result[i].time_interial;
        // console.log(result[i].flash);
        // 动态创建Div并判断是否闪烁
        var flash = result[i].flash;
        var id = 'container' + i;
        var serial = [];
        var color = [];
        var chart;
        var warn_color = "";
        var title_color = "";
        switch (flash) {
            case "green":
                warn_color = "chart_green"
                title_color = "#000000"
                break;
            case "olive":
                warn_color = "chart_olive"
                title_color = "#000000"
                break;
            case "orange":
                warn_color = "chart_orange"
                title_color = "#000000"
                break;
            default:
                warn_color = "chart_red"
                title_color = "#000000"
                break;
        }
        if (changeShow) {
            var width = $('#myTabContent')[0].clientWidth;
            var height = parseInt(width / 2);
            $('#row').append('<div class="col-mg-12 col-pg-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 ' + warn_color + '" style="border: 1px solid #1f1f1f;margin-right:-1px; margin-bottom:-1px;height: ' + height + 'px"  id="' + id + '"></div>');
        } else {

            $('#row').append('<div class="col-mg-1 col-pg-2 col-lg-3 col-md-4 col-sm-6 col-xs-12 ' + warn_color + '" style="border: 1px solid #1f1f1f;margin-right:-1px; margin-bottom:-1px;min-width: 320px"  id="' + id + '"></div>');
        }
        chart = {backgroundColor: 'rgba(0,0,0,0)', type: 'line', zoomType: "xy"};
        // console.log(result[i].from_at);
        if (result[i].plan_cnt.length != 0) {
            serial.push({name: 'Plan', data: result[i].plan_cnt});
            color.push('#00BB55')
        }
        if (result[i].slope.length != 0) {
            serial.push({
                name: 'Expect',
                data: result[i].slope,
                dashStyle: 'longdash'
                // 'marker': {enabled: false}
            });
            color.push('#000000');
        }
        if (result[i].cnt_result.length != 0) {
            serial.push({name: 'Actual', data: result[i].cnt_result, 'marker': {enabled: false}});
            color.push('#0000FF')
        }
        // if(result[i].from_at.length != 0){
        if (result[i].warn == "red") {  //是否显示warn
            var options = {
                chart: chart,
                title: {
                    useHTML: true,
                    text: "<div class='warn_title'><div class=\"warn_position\"></div>" + result[i].assy_cd + "<span style='font-size: 14px; margin-left: 10px'>(" + result[i]["datatime"] + ")</span></div>",                 // 标题
                },
                subtitle: {
                    useHTML: true,
                    text: "Plan:<span style='color: #00BB55'>" + result[i].plan_result + "</span>&nbsp;&nbsp; Actual:<span style='color: #0000FF'>" + result[i].now_result + "</span>"
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    showFirstLabel: false,
                    categories: result[i].from_at, // x 轴分类
                },
                yAxis: {
                    title: {
                        text: ''                        // y 轴标题
                    }
                },
                colors: color,
                series: serial
            };
        } else {
            var options = {
                chart: chart,
                title: {
                    useHTML: true,
                    text: "<div class='warn_title'><div class=\"normal_position\"></div>" + result[i].assy_cd + "<span style='font-size: 14px; margin-left: 10px'>(" + result[i]["datatime"] + ")</span></div>",                 // 标题
                },
                subtitle: {
                    useHTML: true,
                    text: "Plan:<span style='color: #00BB55'>" + result[i].plan_result + "</span>&nbsp;&nbsp; Actual:<span style='color: #0000FF'>" + result[i].now_result + "</span>"
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    showFirstLabel: false,
                    categories: result[i].from_at, // x 轴分类
                },
                yAxis: {
                    title: {
                        text: ''                        // y 轴标题
                    }
                },
                colors: color,
                series: serial
            };
        }
        var chartName = 'chart' + i;
        chartName = Highcharts.chart('container' + i, options)
        chartList.push(chartName);
    }
}

//画历史chart
function dawnHistoryChart(result, changeShow) {
    $('#row').empty();
    if (chartList.length > 0) {
        for (var i = 0; i < chartList.length; i++) {
            chartList[i].destroy();
            chartList.splice(i, 1);
        }
    }
    for (var i = 0; i < result.length; i++) {
        var time_interial = result[i].time_interial;
        // console.log(result[i].flash);
        // 动态创建Div并判断是否闪烁
        var flash = result[i].flash;
        var id = 'container' + i;
        var serial = [];
        var color = [];
        var chart;
        var warn_color = "";
        var title_color = "";
        warn_color = "chart_green"
        title_color = "#000000"
        if (changeShow) {
            var width = $('#myTabContent')[0].clientWidth;
            var height = parseInt(width / 2);
            $('#row').append('<div class="col-mg-12 col-pg-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 ' + warn_color + '" style="border: 1px solid #1f1f1f;margin-right:-1px; margin-bottom:-1px;height: ' + height + 'px"  id="' + id + '"></div>');
        } else {
            $('#row').append('<div class="col-mg-1 col-pg-2 col-lg-3 col-md-4 col-sm-6 col-xs-12 ' + warn_color + '" style="border: 1px solid #1f1f1f;margin-right:-1px; margin-bottom:-1px;min-width: 320px"  id="' + id + '"></div>');
        }
        chart = {backgroundColor: 'rgba(0,0,0,0)', type: 'line', zoomType: "xy"};
        // console.log(result[i].from_at);
        if (result[i].plan_cnt.length != 0) {
            serial.push({name: 'Plan', data: result[i].plan_cnt});
            color.push('#00BB55')
        }
        // if (result[i].slope.length != 0) {
        //     serial.push({
        //         name: 'Expect',
        //         data: result[i].slope,
        //         dashStyle: 'longdash',
        //         'marker': {enabled: false}
        //     });
        //     color.push('#000000');
        // }
        if (result[i].cnt_result.length != 0) {
            serial.push({name: 'Actual', data: result[i].cnt_result, 'marker': {enabled: false}});
            color.push('#0000FF')
        }
        var options = {
            chart: chart,
            title: {
                useHTML: true,
                text: "<div class='warn_title'>" + result[i].assy_cd + "<span style='font-size: 14px; margin-left: 10px'>(" + result[i]["datatime"] + ")</span></div>",                 // 标题
            },
            credits: {
                enabled: false
            },
            xAxis: {
                showFirstLabel: false,
                categories: result[i].from_at, // x 轴分类
            },
            yAxis: {
                title: {
                    text: ''                        // y 轴标题
                }
            },
            colors: color,
            series: serial
        };
        var chartName = 'chart' + i;
        chartName = Highcharts.chart('container' + i, options)
        chartList.push(chartName);
    }
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}





