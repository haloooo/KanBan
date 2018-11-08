from django.shortcuts import render
from RtMonSys.models.models_logger import Logger
from RtMonSys.models import models_common
from django.http import JsonResponse
import json
import time


# Create your views here.
def go_Plan(request):
    Logger.write_log("计划一览")
    return render(request, 'Plan.html')


def listSql():
    sql = '''
        SELECT
            assy_cd,
            plan_cnt,
            green,
            olive,
            orange,
            sort_num,
            shift_date
        FROM
            m_plan  
    '''
    return sql


# 获取用户选择的plans
def getAllPlans(request):
    user_name = str(request.GET.get("user_name"))
    cur = models_common.get_cur()
    sql_assy = '''
        SELECT see_assys from m_user WHERE user_name= %s
    '''
    cur.execute(sql_assy, (user_name,))
    assys = cur.fetchall()
    if list(assys)[0][0]:
        assy = list(assys)[0][0]
        user_assys = assy.split(',')
        where = " WHERE shift_date in (select max(shift_date) from m_plan b where b.assy_cd=assy_cd)  ORDER BY sort_num "
        sql_num = listSql() + where
        cur.execute(sql_num)
        results = cur.fetchall()
        show_results = []
        for item in results:
            isfind = False
            for assy in user_assys:
                if item[0] == assy:
                    show_result = {}
                    show_result["assy_cd"] = item[0]
                    show_result["is_select"] = True
                    show_results.append(show_result)
                    isfind = True
                    break
            if isfind == False:
                show_result = {}
                show_result["assy_cd"] = item[0]
                show_result["is_select"] = False
                show_results.append(show_result)
        return JsonResponse({"data": show_results})
    else:
        sql_assy = listSql()
        cur.execute(sql_assy, (user_name,))
        results = cur.fetchall()
        show_results = []
        for item in results:
            show_result = {}
            show_result["assy_cd"] = item[0]
            show_result["is_select"] = True
            show_results.append(show_result)
        return JsonResponse({"data": show_results})


def getPlans(request):
    # 解析参数
    assy_cd = str(request.GET.get("assy_cd"))
    # currentPage = int(request.GET.get("currentPage"))
    # pageSize = int(request.GET.get("pageSize"))
    # # 构建分页数据start与end
    # start = (currentPage - 1) * pageSize
    # end = currentPage * pageSize
    # 构建查询
    where = " WHERE 1=1 "
    if assy_cd:
        where += " AND assy_cd LIKE '%" + assy_cd + "%'"
    where += " AND shift_date in (select max(shift_date) from m_plan b where b.assy_cd=assy_cd)"
    sql_result = listSql() + where
    cur = models_common.get_cur()
    cur.execute(sql_result)
    results = cur.fetchall()
    show_results = []
    for item in results:
        show_result = {}
        show_result["assy_cd"] = item[0]
        show_result["plan_cnt"] = item[1]
        show_result["green"] = item[2]
        show_result["olive"] = item[3]
        show_result["orange"] = item[4]
        show_result["sort_num"] = item[5]
        show_results.append(show_result)
    return JsonResponse({"data": show_results})


def insertPlan(request):
    assy_cd = str(request.POST.get("assy_cd"))
    plan_cnt = int(request.POST.get("plan_cnt"))
    green = int(request.POST.get("green"))
    olive = int(request.POST.get("olive"))
    orange = int(request.POST.get("orange"))
    sort_num = int(request.POST.get("sort_num"))
    sql_is = listSql() + " WHERE assy_cd='" + assy_cd + "'"
    cur = models_common.get_cur()
    cur.execute(sql_is)
    results = cur.fetchall()
    if len(results) > 0:
        return JsonResponse({"code": "1", "msg": "assy_cd已经存在"})
    else:
        sql = '''
                INSERT INTO m_plan ( assy_cd, plan_cnt, green, olive, orange,sort_num )
                VALUES ( %s,%s,%s,%s,%s,%s)
            '''
        cur.execute(sql, (assy_cd, plan_cnt, green, olive, orange, sort_num))
        return JsonResponse({"code": "0"})


def deletePlan(request):
    assy_cd = str(request.GET.get("assy_cd"))
    cur = models_common.get_cur()
    sql = '''
           DELETE FROM m_plan where assy_cd= %s
        '''
    cur.execute(sql, (assy_cd,))
    return JsonResponse({"code": "0"})


def editPlan(request):
    dateListstr = str(request.POST.get("assy_cds"))
    dateLists = json.loads(dateListstr)
    cur = models_common.get_cur()
    datestr = time.strftime('%Y-%m-%d', time.localtime(time.time()))  # 当前时间年月日
    for item in dateLists:
        assy_cd = item["assy_cd"]
        plan_cnt = item["plan_cnt"]
        green = item["green"]
        olive = item["olive"]
        orange = item["orange"]
        sort_num = item["sort_num"]
        where = " WHERE shift_date='" + str(datestr) + "' AND assy_cd='" + assy_cd + "'"
        sql_num = listSql() + where
        cur.execute(sql_num)
        plans = cur.fetchall()
        if len(plans) == 0:  # 没有找到今天的数据就新建
            sql = '''
                                INSERT INTO m_plan ( assy_cd, plan_cnt, green, olive, orange,sort_num,shift_date)
                                VALUES ( %s,%s,%s,%s,%s,%s,%s)
                            '''
            cur.execute(sql, (assy_cd, plan_cnt, green, olive, orange, sort_num, datestr))
        else:
            sql = "UPDATE m_plan SET plan_cnt =  '%s',green= '%s',olive= '%s',orange= '%s',sort_num= '%s' WHERE assy_cd =  '%s' AND shift_date= '%s' " % (
                plan_cnt, green, olive, orange, sort_num, assy_cd, datestr)
            cur.execute(sql)
    return JsonResponse({"code": "0"})


def saveUserAssy(request):
    user_id = str(request.POST.get("user_id"))
    assy_cds_str = str(request.POST.get("assy_cds"))
    assy_cds = json.loads(assy_cds_str)
    update = ""
    for item in assy_cds:
        if item["is_select"]:
            update += str(item["assy_cd"]) + ","
    update_sql = update[:-1]  # 去掉最后一个,
    cur = models_common.get_cur()
    sql = "UPDATE m_user SET see_assys =  '%s' WHERE id =  '%s'" % (
        update_sql, user_id)
    cur.execute(sql)
    return JsonResponse({"code": "0"})
