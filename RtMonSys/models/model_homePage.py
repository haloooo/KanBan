# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
import time
from RtMonSys.models import models_common
from django.http import JsonResponse


def getDataList(model_name, process_cd, datatype_id, firstFlg=False):
    now = datetime.datetime.now()
    end_time = now.strftime("%Y-%m-%d %H:%M:%S")
    hour_interval = models_common.get_config("hour_interval")
    start_time = (now + datetime.timedelta(hours=-hour_interval)).strftime("%Y-%m-%d %H:%M:%S")
    # start_time = '2017-08-10 15:07:49.670181'
    result = models_common.getDetailList(model_name, process_cd, datatype_id, start_time, end_time, firstFlg)
    return result


def get_models():
    database = models_common.get_config("database")
    result = []
    flag = True
    for item in database:
        if (flag):
            model_name = item["MODEL"]
            process_cd = item["PROCESS"][0]
            datatype_id = item["DATA_TYPE"][0]
            flag = False
        line_counts = getDataList(model_name, process_cd, datatype_id, True)
        if line_counts == 101 or line_counts == 102:
            return line_counts
        process = []
        data_type = []
        line = []
        counts = []
        for processItem in item["PROCESS"]:
            process.append(processItem)
        for data_typeItem in item["DATA_TYPE"]:
            data_type.append(data_typeItem)
        for lineItem in item["LINE"]:
            num = 0
            line.append(lineItem)
            for line_id in line_counts:
                if (line_id['line_cd'] == lineItem):
                    num = line_id['ng_count']
            counts.append(num)
        result.append({'model': item["MODEL"], 'process': process, 'data_type': data_type, 'line': line})
    ng_rgb = models_common.get_config("NG_RGB")
    result.append({'ng_rgb': ng_rgb})
    result.append({'count': counts})
    return result


def get_all_line_count(model_name, process_cd, datatype_id):
    database = models_common.get_config("database")
    counts = []
    for item in database:
        if (item["MODEL"] == model_name):
            line_counts = getDataList(model_name, process_cd, datatype_id, True)
            for lineItem in item["LINE"]:
                num = 0
                for line_id in line_counts:
                    if (line_id['line_cd'] == lineItem):
                        num = line_id['ng_count']
                counts.append(num)
    return counts


def auto_updating():
    auto_update = models_common.get_config("auto_updating")
    return auto_update


def initData(request):
    user_id = str(request.GET.get("user_id"))
    select_date = request.GET.get("select_date")  # 历史画面传参
    assy_cd = []
    result = []  # chart的数据集
    rows_1 = []
    table_result = []  # table的数据集
    cur = models_common.get_cur()
    # 1. 从m_plan中获得所有assy_cd
    SQL_1 = 'SELECT assy_cd FROM m_plan WHERE shift_date in (select max(shift_date) from m_plan b where b.assy_cd=assy_cd) ORDER BY sort_num '
    cur.execute(SQL_1)
    allrows = cur.fetchall()  # 查出所有的assy
    SQL_1 = 'SELECT see_assys FROM m_user WHERE id=' + user_id
    cur.execute(SQL_1)
    select_rows = cur.fetchall()  # 查出用户选择的assy
    if list(select_rows)[0][0]:  # 如果用户选择的不为null,取用户选择的
        assy = list(select_rows)[0][0]
        rows_select = assy.split(',')
        for item in allrows:
            for select in rows_select:
                if item[0] == select:
                    rows_1.append(select)
    else:
        for item in allrows:
            rows_1.append(item[0])
    # 2. 获取所有assy的数据
    SQL_2 = '''
        SELECT
            m_plan.assy_cd,
            t_history.timepart_label,
            t_history.cnt_result,
            t_history.from_at,
            t_history.to_at,
            m_plan.plan_cnt  AS plan_result,
            CASE
            (
            date_part ( 'hours', t_history.update_at - t_history.from_at ) * 60 + date_part ( 'minute', t_history.update_at - t_history.from_at ) 
            ) 
            WHEN 0 THEN
            0 ELSE ROUND(
            t_history.cnt_result * 60 / (
            date_part ( 'hours', t_history.update_at - t_history.from_at ) * 60 + date_part ( 'minute', t_history.update_at - t_history.from_at ) 
            ) 
            ) 
            END AS unit_result,
	        m_plan.green,
            m_plan.olive,
            m_plan.orange,
            t_history.shift_date,
            (date_part( 'hours', t_history.to_at - t_history.from_at ) * 60 + date_part( 'minute', t_history.to_at - t_history.from_at )) AS Differ,
            (date_part( 'hours', t_history.update_at - t_history.from_at) * 60 + date_part('minute',t_history.update_at - t_history.from_at)) AS differ_now,
            t_history.update_at
        FROM
            m_plan
            LEFT JOIN t_history ON m_plan.assy_cd = t_history.assy_cd 
        WHERE
            t_history.shift_date BETWEEN  %s  AND  %s  AND m_plan.shift_date IN 
            ( SELECT MAX (shift_date) FROM m_plan A WHERE A.assy_cd = m_plan.assy_cd AND A.shift_date<= %s) 
        ORDER BY
            t_history.assy_cd,
            t_history.from_at;
    '''
    # 3   查看当前系统时间之前的
    SQL_3 = '''
        SELECT
            assy_cd
        FROM
            t_history 
        WHERE
            to_char ( to_at, 'yyyy-MM-dd' ) =  %s
            AND shift_date =  %s
            AND from_at < %s
        GROUP BY assy_cd
    '''

    # date = '2018-09-10'
    now_time = datetime.datetime.now()  # 当前时间带时分秒
    datestr = time.strftime('%Y-%m-%d', time.localtime(time.time()))  # 当前时间年月日
    if select_date:  # 查询历史记录
        date_end = select_date  # 今天
        date_start = select_date
    else:
        date_end = datetime.datetime.strptime(datestr, '%Y-%m-%d')  # 今天
        date_start = date_end + datetime.timedelta(days=-1)  # 昨天
    cur.execute(SQL_3, (datestr, datestr, now_time))  # 查出各产线今天有没有数据
    rows_3 = cur.fetchall()
    main_rows = []  # 新的主表
    for row_1 in rows_1:
        main_row = {}
        main_row["assy_cd"] = row_1
        main_row["plan_cnt"] = row_1
        isFind = False
        for row_3 in rows_3:  # 每个assy只可能有一条
            if row_1 == row_3[0]:  # 如果找到了 说明这条产线的shiftdate取当天，没有就取昨天
                main_row["shift_date"] = date_end
                isFind = True
                break
        if isFind == False:  # 没有找到
            main_row["shift_date"] = date_start
        main_rows.append(main_row)
    cur.execute(SQL_2, (date_start, date_end, date_end))
    rows_2 = cur.fetchall()
    for item in main_rows:
        flash = ""
        warn = ""
        plan_cnt = [0]
        from_at = [0]
        cnt_result = [0]
        assy_cd.append(item["assy_cd"])
        sum_hours = 0
        sum_actual = 0
        unit_result = ""
        green = 0
        olive = 0
        orange = 0
        num = 1
        num_sum = 10
        plan_result = 0
        plan_show = 0
        now_result = 0
        slopes = [0]
        growth = 0
        last_slope = 0
        sign_slope = 0
        if select_date:
            item_data = select_date
        else:
            item_data = item["shift_date"].strftime('%Y-%m-%d')
        sum_minute = 0
        differ_time = 0
        differ_now = 0
        actual_minute = 0
        timepart_label = []  # table用  th值
        table_cnt_result = []  # table用 td值
        now_Actual = 0  # table用  合计
        for row_2 in rows_2:
            row_2_data = row_2[10].strftime('%Y-%m-%d')
            if item["assy_cd"] == row_2[0] and item_data == row_2_data:
                sum_minute = sum_minute + int(row_2[11])  # 求各产线合计的时间
        for row_2 in rows_2:
            row_2_data = row_2[10].strftime('%Y-%m-%d')
            if item["assy_cd"] == row_2[0] and item_data == row_2_data:  # 是assy的数据且条件符合
                timepart_label.append(row_2[1])  # table用
                differ_time = differ_time + int(row_2[11])  # 获取相差的事件数(分钟)
                plan_result = int(int(row_2[5]) * (differ_time / sum_minute))
                plan_cnt.append(plan_result)
                from_at.append(str(row_2[1]).split('-')[1])
                result_time = datetime.datetime.strptime(str(row_2[3]), "%Y-%m-%d %H:%M:%S")  #from的时间
                result_time_to = datetime.datetime.strptime(str(row_2[4]), "%Y-%m-%d %H:%M:%S") #to的时间
                if now_time >= result_time and now_time <= result_time_to:  #计算当前显示的plan的值
                    minutes = dateDiffInMinute(result_time, now_time)
                    actual_minute = actual_minute + minutes
                elif now_time > result_time_to:
                    actual_minute = actual_minute + int(row_2[11])
                if result_time < now_time:
                    if now_time < result_time_to:  #找到到当前时间的timepart
                        differ_now = int(row_2[12])  # 获取相差的时间数(分钟)实际的
                        last_timepart = int(row_2[11])  # 获取相差的时间数(分钟)总的
                        if differ_now == 0:
                            growth = 0
                        else:
                            growth = int(row_2[2]) * last_timepart / (differ_now)  # 记录增长量/当前产量
                        last_slope = int(sum_actual + growth)  # 记录except值(当前的sum_actual还是上一个timepart的值)
                        slopes.append(last_slope)
                        sum_actual = sum_actual + int(row_2[2])
                    else:
                        sum_actual = sum_actual + int(row_2[2])
                        slopes.append(sum_actual)# 记录except值
                    cnt_result.append(sum_actual)
                    unit_result = row_2[6]
                    green = row_2[7]
                    olive = row_2[8]
                    orange = row_2[9]
                    now_result = sum_actual
                    sign_slope = sum_actual  # 记录时间断点时候值
                    plan_show = int(int(row_2[5]) * (actual_minute / sum_minute))
                    # table用
                    color_green = False
                    color_olive = False
                    color_orange = False
                    color_red = False
                    # 算uph
                    table_differ = int(row_2[11])
                    table_value = int(row_2[2])
                    table_unit = table_value * 60 / table_differ  # 实际uph
                    if table_unit >= green:
                        color_green = True
                    elif table_unit < green and table_unit >= olive:
                        color_olive = True
                    elif table_unit < olive and table_unit >= orange:
                        color_orange = True
                    else:
                        color_red = True
                    table_cnt = {
                        'value': str(row_2[2]),
                        'color_green': color_green,
                        'color_olive': color_olive,
                        'color_orange': color_orange,
                        'color_red': color_red,
                        'color_nodata': False
                    }
                    table_cnt_result.append(table_cnt)
                    now_Actual = sum_actual
                else:  # 一旦发现超出查询时间
                    sum_actual = sum_actual + int(row_2[2])
                    cnt_result.append(sign_slope)
                    now_timepart = int(row_2[11])  # 获取相差的时间数(分钟)
                    now_growth = growth * now_timepart / last_timepart
                    now_slope = int(now_growth + last_slope)  # 上个的y值+增长量
                    slopes.append(now_slope)
                    last_slope = now_slope
                    table_cnt = {
                        'value': 'n/a',
                        'color_green': False,
                        'color_olive': False,
                        'color_orange': False,
                        'color_red': False,
                        'color_nodata': True
                    }
                    table_cnt_result.append(table_cnt)  # table用
                num = num + 1
        # table变颜色用
        color_green = False
        color_olive = False
        color_orange = False
        color_red = False
        color_nodata = False
        if unit_result:  # 判断当前uph变色
            if unit_result >= green:
                flash = "green"
                color_green = True
            elif unit_result < green and unit_result >= olive:
                flash = "olive"
                color_olive = True
            elif unit_result < olive and unit_result >= orange:
                flash = "orange"
                color_orange = True
            else:
                flash = "red"
                color_red = True
        else:
            flash = "red"
            color_red = True
        if now_result:
            if now_result >= plan_show:
                warn = "green"
            else:
                warn = "red"
        # assy_cd      chart的标题
        # plan_cnt     plan的线
        # from_at      x轴
        # cnt_result   Actual的线
        # slope        Except的线
        # flash        chart的闪烁颜色
        # plan_result  副标题plan的值
        # now_result   副标题Actual的值
        # datatime     标题的时间
        # warn         标题前圆圈的闪烁颜色
        result.append(
            {
                'assy_cd': item["assy_cd"],
                'plan_cnt': plan_cnt,
                'from_at': from_at,
                'cnt_result': cnt_result,
                'slope': slopes,
                'flash': flash,
                'plan_result': plan_show,
                'now_result': now_result,
                'datatime': item_data,
                'warn': warn
            })
        table_result.append(
            {
                'assy_cd': item["assy_cd"],
                'datatime': item_data,
                'timepart_label': timepart_label,
                'table_cnt_result': table_cnt_result,
                'now_Actual': now_Actual,
                'color_green': color_green,
                'color_olive': color_olive,
                'color_orange': color_orange,
                'color_red': color_red,
                'color_nodata': color_nodata
            }
        )
    return JsonResponse({"chart_data": result, "table_data": table_result})


def dateDiffInHours(t1, t2):
    td = t2 - t1
    return td.days * 24 + td.seconds / 3600


def dateDiffInMinute(t1, t2):
    td = (t2 - t1).total_seconds()
    return int(td / 60)


def straightSlope(x1, x2, y1, y2):
    k = (y2 - y1) / (x2 - x1)
    # x3 = x2 + 1
    x3 = 2
    y3 = k * x3 + y1
    return y3


if __name__ == '__main__':
    print(type(time.strftime('%Y-%m-%d', time.localtime(time.time()))))
