from django.shortcuts import render
from RtMonSys.models.models_logger import Logger
from RtMonSys.models import models_common
from django.http import JsonResponse
import json


# Create your views here.
def go_User(request):
    Logger.write_log("用户一览")
    return render(request, 'User.html')


def listSql():
    sql = '''
        SELECT
            id,
            user_name,
            true_name,
            see_assys,
            see_plan
        FROM
            m_user
    '''
    return sql


def getUsers(request):
    # 解析参数
    user_name = str(request.GET.get("user_name"))
    true_name = str(request.GET.get("true_name"))
    currentPage = int(request.GET.get("currentPage"))
    pageSize = int(request.GET.get("pageSize"))
    # 构建分页数据start与end
    start = (currentPage - 1) * pageSize
    end = currentPage * pageSize
    # 构建查询
    where = " where is_admin=false "
    if user_name:
        where += " AND user_name LIKE '%" + user_name + "%'"
    if true_name:
        where += " AND true_name LIKE '%" + true_name + "%'"
    where = where + " ORDER BY id"
    sql_num = listSql() + where
    cur = models_common.get_cur()
    cur.execute(sql_num)
    num = cur.fetchall()
    count = len(num)
    sql_result = listSql() + where + "	LIMIT " + str(end) + " OFFSET " + str(start)
    cur.execute(sql_result)
    results = cur.fetchall()
    show_results = []
    for item in results:
        show_result = {}
        show_result["id"] = item[0]
        show_result["user_name"] = item[1]
        show_result["true_name"] = item[2]
        show_result["see_assys"] = item[3]
        show_result["see_plan"] = item[4]
        show_results.append(show_result)
    return JsonResponse({"totalDataNumber": count, "data": show_results})


def editUser(request):
    id = str(request.POST.get("id"))
    true_name = str(request.POST.get("true_name"))
    user_name = str(request.POST.get("user_name"))
    see_plan = str(request.POST.get("see_plan"))
    sql_is = listSql() + " WHERE user_name ='" + user_name + "' AND id <> '" + id + "'"
    cur = models_common.get_cur()
    cur.execute(sql_is)
    results = cur.fetchall()
    if len(results) > 0:
        return JsonResponse({"code": "1", "msg": "用户名已经存在"})
    else:
        sql = "UPDATE m_user SET true_name =  '%s',user_name= '%s',see_plan= '%s' WHERE id =  '%s'" % (
            true_name, user_name, see_plan, id)
        cur.execute(sql)
        return JsonResponse({"code": "0"})


def insertUser(request):
    true_name = str(request.POST.get("true_name"))
    user_name = str(request.POST.get("user_name"))
    see_plan = str(request.POST.get("see_plan"))
    user_password = str(request.POST.get("user_password"))
    is_admin = False
    sql_is = listSql() + " WHERE user_name='" + user_name + "'"
    cur = models_common.get_cur()
    cur.execute(sql_is)
    results = cur.fetchall()
    if len(results) > 0:
        return JsonResponse({"code": "1", "msg": "用户名已经存在"})
    else:
        sql = '''
                INSERT INTO m_user ( true_name, user_name, see_plan,is_admin,user_password)
                VALUES ( %s,%s,%s,%s,%s)
            '''
        cur.execute(sql, (true_name, user_name, see_plan, is_admin, user_password))
        return JsonResponse({"code": "0"})


def updatePassword(request):
    user_id = str(request.POST.get("user_id"))
    oldpassword = str(request.POST.get("oldpassword"))
    newpassword = str(request.POST.get("newpassword"))
    sql_is = listSql() + " WHERE id='" + user_id + "' AND  user_password='" + oldpassword + "'"
    cur = models_common.get_cur()
    cur.execute(sql_is)
    results = cur.fetchall()
    if len(results) == 0:
        return JsonResponse({"code": "1", "msg": "密码不正确"})
    else:
        sql = '''
                UPDATE m_user SET user_password = %s WHERE id = %s
            '''
        cur.execute(sql, (newpassword, user_id))
        return JsonResponse({"code": "0"})


def deleteUser(request):
    id = str(request.GET.get("id"))
    cur = models_common.get_cur()
    sql = '''
              DELETE FROM m_user where id= %s
           '''
    cur.execute(sql, (id,))
    return JsonResponse({"code": "0"})