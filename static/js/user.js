app.controller('myCtrl', function ($scope) {
    $scope.allassys = [];
    //配置
    $scope.musers = [];
    $scope.count = 0;
    $scope.p_pernum = 10;
    $scope.isShow = false;
    $scope.isHide = true;
    $scope.s_user_name = "";
    $scope.s_true_name = "";
    //编辑表单元素
    $scope.num = "";
    $scope.id = "";
    $scope.true_name = "";
    $scope.user_name = "";
    $scope.see_plan = "";
    //变量
    $scope.p_current = 1;
    $scope.p_all_page = 0;
    $scope.pages = [];
    $scope.deleteId = "";
    $scope.deleteNum = "";
    $scope.load_page = function (pageNum) {
        $scope.pageNum = pageNum;
        var params = {
            "user_name": this.s_user_name,
            "true_name": this.s_true_name,
            "currentPage": this.pageNum,
            "pageSize": this.p_pernum
        };
        $.ajax({
            url: "getUsers",  //获取
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
                $scope.p_current = pageNum;
                $scope.musers = data.data;
                for (i = 0; i < $scope.musers.length; i++) {
                    $scope.musers[i].num = i;
                }
                $scope.count = data["totalDataNumber"];
                if ($scope.count > 0) {
                    $scope.p_all_page = Math.ceil($scope.count / $scope.p_pernum);
                    $scope.pages = [];
                    for (i = 1; i <= $scope.p_all_page; i++) {
                        $scope.pages.push(i);
                    }
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
    $scope.showDelete = function (id, rolename, num) {
        $("#deleteTitle").text("是否删除   " + rolename);
        $scope.deleteId = id;
        $scope.deleteNum = num;
        $('#deleteModel').modal();
    };
    $scope.delete = function () {
        var id = $scope.deleteId;
        ///删除的API
        $.ajax({
            headers: {"X-CSRFToken": getCookie("csrftoken")},
            url: "deleteUser?id=" + id,  //获取
            type: "POST", //GET、PUT、DELETE
            async: false,    //是否异步
            timeout: 10000,    //超时时间
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                if (data.code == 0) {
                    toastr.success("删除成功");
                    $('#deleteModel').modal('hide');
                    $scope.load_page(1);
                } else {
                    toastr.error(data.msg)
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
    $scope.showEdit = function (num, id, truename, username, see_plan) {
        $("#editTitle").text("编辑用户");
        $scope.num = num;
        $scope.id = id;
        $scope.true_name = truename;
        $scope.user_name = username;
        $scope.see_plan = see_plan;
        $('#editModel').modal();
    };

    $scope.showAdd = function () {
        $("#editTitle").text("新增用户");
        $scope.id = "";
        $scope.true_name = "";
        $scope.user_name = "";
        $scope.see_plan = false;
        $('#editModel').modal();
    };
    $scope.save = function () {
        if ($scope.true_name == "") {
            toastr.warning("姓名不能为空");
            return;
        }
        if ($scope.user_name == "") {
            toastr.warning("用户名不能为空");
            return;
        }
        var dataList = {
            'id': $scope.id,
            'true_name': $scope.true_name,
            'user_name': $scope.user_name,
            'see_plan': $scope.see_plan,
            'user_password': "123456",
        };
        if ($scope.id == "") {  //新增
            //新增ajax
            $.ajax({
                url: "insertUser",  //获取
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
        } else {
            //编辑ajax
            $.ajax({
                headers: {"X-CSRFToken": getCookie("csrftoken")},
                url: "editUser",  //获取
                type: "POST", //GET、PUT、DELETE
                async: false,    //是否异步
                data: dataList,
                timeout: 10000,    //超时时间
                dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
                beforeSend: function (xhr) {
                    // 发送前处理
                },
                success: function (data, textStatus, jqXHR) {
                    // 调用成功，解析response中的data到自定义的data中
                    if (data.code == 0) {
                        toastr.success("编辑成功");
                        $('#editModel').modal('hide');
                        $scope.musers[$scope.num].true_name = $scope.true_name;
                        $scope.musers[$scope.num].user_name = $scope.user_name;
                        $scope.musers[$scope.num].see_plan = $scope.see_plan;
                    }
                    else {
                        toastr.error(data.msg)
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
    };
    $scope.clearSelect2Value = function () {
        var selectObj = $("#roleList").select2();
        selectObj.val('').trigger('change');
        selectObj.val('test').trigger('change');
    };

    $scope.disable = function (num, id) {
        ///警用的API
        $.ajax({
            headers: {
                'Authorization': auth
            },
            url: baseUserURL + "/" + id + "/disable",  //获取
            type: "PUT", //GET、PUT、DELETE
            async: false,    //是否异步
            timeout: 10000,    //超时时间
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                if (data.code == "0") {
                    $scope.musers[num].validtag = '0';
                    toastr.success(data.msg);
                } else if (data.code == 403) {
                    window.location.href = 'login.html'
                } else {
                    toastr.error(data.msg)
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
    $scope.canable = function (num, id) {
        ///启用的API
        $.ajax({
            headers: {
                'Authorization': auth
            },
            url: baseUserURL + "/" + id + "/enable",  //获取
            type: "PUT", //GET、PUT、DELETE
            async: false,    //是否异步
            timeout: 10000,    //超时时间
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                if (data.code == "0") {
                    $scope.musers[num].validtag = '1';
                    toastr.success(data.msg);
                } else if (data.code == 403) {
                    window.location.href = 'login.html'
                } else {
                    toastr.error(data.msg)
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
    $scope.getRolesList = function () {
        //获取角色列表(执行一次)
        var oneReq = [];
        $.ajax({
            headers: {
                'Authorization': auth
            },
            url: roleListURL,  //获取
            type: "GET", //GET、PUT、DELETE
            async: false,    //是否异步
            timeout: 10000,    //超时时间
            dataType: "json",    //返回的数据格式：json/xml/html/script/jsonp/text
            beforeSend: function (xhr) {
                // 发送前处理
            },
            success: function (data, textStatus, jqXHR) {
                // 调用成功，解析response中的data到自定义的data中
                if (data.code == 0) {
                    var dataRows = data.data.rows;
                    var row = {};
                    for (var i = 0; i < dataRows.length; i++) {
                        row = {id: dataRows[i].id, text: dataRows[i].rolename};
                        oneReq.push(row);
                    }
                    $("#roleList").select2({
                        data: oneReq,
                        allowClear: false,
                        tags: false,
                        // placeholder: '可多选'
                    });
                } else if (data.code == 403) {
                    window.location.href = 'login.html'
                } else {
                    toastr.error(data.msg)
                }
            },
            error: function (xhr, textStatus) {
                // 调用时，发生错误
                toastr.info(textStatus);
            },
            complete: function () {
                // 交互后处理
            }
        });
    };
    $scope.load_page(1);
    // $scope.getRolesList();
});