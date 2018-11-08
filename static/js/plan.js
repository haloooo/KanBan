app.controller('myCtrl', function ($scope) {
    //配置
    $scope.musers = [];
    $scope.count = 0;
    $scope.p_pernum = 10;
    $scope.isShow = false;
    $scope.s_assy_cd = "";

    //编辑表单元素
    $scope.assy_cd = "";
    $scope.plan_cnt = "";
    $scope.green = "";
    $scope.olive = "";
    $scope.orange = "";
    $scope.sort_num="";
    //变量
    $scope.p_current = 1;
    $scope.p_all_page = 0;
    $scope.pages = [];
    $scope.deleteCd = "";
    $scope.deleteName = "";
    $scope.isEdit = false;

    $scope.load_page = function (pageNum) {
        $scope.pageNum = pageNum;
        var params = {
            "assy_cd": this.s_assy_cd,
        };
        $.ajax({
            url: "getPlans",  //获取
            type: 'GET', //GET、PUT、DELETE
            async: false,    //是否异步
            timeout: 10000,    //超时时间
            data: params,
            dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                $scope.musers = data.data;
                if ($scope.musers.length > 0) {
                    $scope.isShow = true;
                } else {
                    $scope.isShow = false;
                }
            },
            error: function (xhr, textStatus) {
                // 调用时，发生错误
                toastr.warning(textStatus);
            },
            complete: function (XMLHttpRequest, textStatus) {
                // 交互后处理
            }
        })
    };
    $scope.showDelete = function (assy_cd) {
        $("#deleteTitle").text("是否删除   " + assy_cd);
        $scope.deleteCd = assy_cd;
        $scope.deleteName = assy_cd;
        $('#deleteModel').modal();
    };
    $scope.delete = function () {
        ///删除的API
        $.ajax({
            url: "deletePlan?assy_cd=" + $scope.deleteCd,  //
            type: "GET", //GET、PUT、DELETE
            async: false,    //是否异步
            timeout: 10000,    //超时时间
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                toastr.success("删除成功");
                $('#deleteModel').modal('hide');
                $scope.load_page(1);

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
    $scope.showEdit = function (num, id, truename, username) {
        for (var i = 0; i < this.musers.length; i++) {
            if (!this.musers[i]["plan_cnt"]) {
                toastr.warning("plan_cnt is null");
                return;
            }
            if (!this.musers[i]["green"]) {
                toastr.warning("green is null");
                return;
            }
            if (!this.musers[i]["olive"]) {
                toastr.warning("olive is null");
                return;
            }
            if (!this.musers[i]["orange"]) {
                toastr.warning("orange is null");
                return;
            }
        }
        if ($scope.isEdit) {
            $scope.isEdit = false;
        } else {
            $scope.isEdit = true;
        }
    };
    $scope.showAdd = function () {
        $("#editTitle").text("新增");
        $scope.assy_cd = "";
        $scope.plan_cnt = "";
        $scope.green = "";
        $scope.olive = "";
        $scope.orange = "";
        $scope.sort_num="";
        $('#editModel').modal();
    };
    $scope.saveInsert = function () {
        if ($scope.assy_cd == "") {
            toastr.warning("assy_cd is null");
            return;
        }
        if ($scope.plan_cnt == "") {
            toastr.warning("plan_cnt is null");
            return;
        }
        if ($scope.green == "") {
            toastr.warning("green is null");
            return;
        }
        if ($scope.olive == "") {
            toastr.warning("olive is null");
            return;
        }
        if ($scope.orange == "") {
            toastr.warning("orange is null");
            return;
        }
        var dataList = {
            'assy_cd': $scope.assy_cd,
            'plan_cnt': $scope.plan_cnt,
            'green': $scope.green,
            'olive': $scope.olive,
            'orange': $scope.orange,
            'sort_num': $scope.musers.length + 1,
        };
        //新增ajax
        $.ajax({
            url: "insertPlan",  //获取
            type: "POST", //GET、PUT、DELETE
            async: false,    //是否异步
            headers: {"X-CSRFToken": getCookie("csrftoken")},
            data: dataList,
            timeout: 10000,    //超时时间
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                if (data.code == 0) {
                    toastr.success("新增成功");
                    $('#editModel').modal('hide');
                    $scope.load_page(1);
                } else {
                    toastr.error(data.msg);
                }

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
    $scope.saveEdit = function () {
        if (!this.isEdit) {
            toastr.warning("请先编辑");
            return;
        }
        for (var i = 0; i < this.musers.length; i++) {
            if (!this.musers[i]["plan_cnt"]) {
                toastr.warning("plan_cnt is null");
                return;
            }
            if (!this.musers[i]["green"]) {
                toastr.warning("green is null");
                return;
            }
            if (!this.musers[i]["olive"]) {
                toastr.warning("olive is null");
                return;
            }
            if (!this.musers[i]["orange"]) {
                toastr.warning("orange is null");
                return;
            }
        }
        var params = {
            "assy_cds": JSON.stringify(this.musers),
        };
        //编辑ajax
        $.ajax({
            url: "editPlan",  //获取
            type: "POST", //GET、PUT、DELETE
            async: false,    //是否异步
            headers: {"X-CSRFToken": getCookie("csrftoken")},
            data: params,
            timeout: 10000,    //超时时间
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                if (data.code == 0) {
                    toastr.success("编辑成功");
                    $scope.isEdit = false;
                } else {
                    toastr.error(data.msg);
                }
            },
            error: function (xhr, textStatus) {
                // 调用时，发生错误
                toastr.info(textStatus);
            },
            complete: function () {
                // 交互后处理
            }
        })
    }
    $scope.load_page(1);
    $scope.up_Sort = function (item) {
        if (item["sort_num"] == 1) {
            toastr.error("this assy is first");
            return;
        }
        var sort = item["sort_num"] - 1;
        for (var i = 0; i < this.musers.length; i++) {
            if (this.musers[i]["sort_num"] == sort) {
                this.musers[i]["sort_num"] = item["sort_num"];
                break;
            }
        }
        item["sort_num"] = sort;
    };
    $scope.down_Sort = function (item) {
        if (item["sort_num"] == this.musers.length) {
            toastr.error("this assy is final");
            return;
        }
        var sort = item["sort_num"] + 1;
        for (var i = 0; i < this.musers.length; i++) {
            if (this.musers[i]["sort_num"] == sort) {
                this.musers[i]["sort_num"] = item["sort_num"];
                break;
            }
        }
        item["sort_num"] = sort;
    };
});

