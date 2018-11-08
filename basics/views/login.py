from django.shortcuts import render
from RtMonSys.models.models_logger import Logger
from django.http import JsonResponse
from RtMonSys.models import models_common


# Create your views here.
def go_Login(request):
    Logger.write_log("登陆页面")
    return render(request, 'login.html')


def findSql():
    sql = '''
        SELECT
            id,
            user_name,
            true_name,
            is_admin,
            see_plan
        FROM
            m_user
    '''
    return sql


def user_Login(request):
    Logger.write_log("用户登陆")
    username = str(request.POST.get("username"))
    password = str(request.POST.get("password"))
    where = " WHERE "
    where += " user_name = '" + username + "'"
    where += " AND user_password = '" + password + "'"
    sql_num = findSql() + where
    cur = models_common.get_cur()
    cur.execute(sql_num)
    results = cur.fetchall()
    count = len(results)
    for item in results:
        show_result = {}
        show_result["id"] = item[0]
        show_result["user_name"] = item[1]
        show_result["true_name"] = item[2]
        show_result["is_admin"] = item[3]
        show_result["see_plan"] = item[4]
    if count > 0:
        return JsonResponse({"code": "0", "data": show_result})
    else:
        return JsonResponse({"code": "1", "msg": "用户名或密码不正确"})
