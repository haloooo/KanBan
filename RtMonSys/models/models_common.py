# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json
import datetime
from django.db import connections
import os

def get_config(key):
    # 加载配置文件
    file_path = os.getcwd() + '/config/config.json'
    fp = open(file_path)
    json_data = json.load(fp)
    return json_data[key]

def databaseException(exp):
    if 'could not connect to server' in str(exp):
        # return {'status': "fail", 'msg': 'Connect to database failed[101]'}
        return 101
    else:
        # return {'status': "fail", 'msg': 'Operate to database failed[102]'}
        return 102

# 获取ng数据
def getDetailList(model_name, process_cd, datatype_id, start_time, end_time, firstFlg):
    result = []
    sql_orderby = "ORDER BY line_cd, station_slot"

    # 获取产线按钮数据的场合
    if firstFlg:
        sql_orderby = " ORDER BY line_cd ASC, count_serial_cd DESC "

    try:
        # 从config文件中取得line数组
        database_list = get_config("database")
        lineArr = []
        limit = get_config("limit")
        for row in database_list:
            if row['MODEL'] == model_name:
                # 从配置文件里取得LINE
                lineArr = row['LINE']
                break
        cur = connections[model_name].cursor()
        sql = "SELECT \
                    line_cd,\
                    station_slot,\
                    COUNT( serial_cd ) AS count_serial_cd \
                FROM\
                    (\
                SELECT DISTINCT \
                    line_cd,\
                    T2.station_slot,\
                    T1.serial_cd,\
                    judge_text \
                FROM\
                    (\
                SELECT \
                    serial_cd,\
                    line_cd,\
                    judge_text \
                FROM\
                    (\
                SELECT \
				    serial_cd,\
				    process_at,\
				    line_cd,\
				    judge_text, \
                    ROW_NUMBER ( ) OVER ( PARTITION BY line_cd, serial_cd ORDER BY process_at DESC ) RANK1 \
			    FROM\
				    (\
				SELECT DISTINCT \
					i.serial_cd,\
					i.process_at,\
					p.line_cd,\
					i.judge_text,\
					ROW_NUMBER ( ) OVER ( PARTITION BY line_cd ORDER BY i.process_at DESC ) RANK \
				FROM \
					t_insp_" + model_name + " i,\
					m_process p \
				WHERE \
					i.proc_uuid = p.proc_uuid \
					AND p.line_cd IN ( %s ) \
					AND p.process_cd = '(process_cd)' \
                    AND i.process_at >= '(start_time)' \
					AND i.process_at <= '(end_time)' \
				ORDER BY i.process_at DESC \
				) BASE1 \
			    WHERE RANK <= (LIMIT) \
                ) BASE2 \
                WHERE \
                    judge_text = '1' \
                    AND RANK1 = 1 \
                ) T1 \
                    INNER JOIN (\
                SELECT DISTINCT \
                    f.partsserial_cd AS station_slot,\
                    f.serial_cd,\
                    f.process_at \
                FROM \
                    m_process p,\
                    t_faci_" + model_name + " f \
                WHERE \
                    f.proc_uuid = p.proc_uuid \
                    AND p.process_cd = '(process_cd)' \
                    AND f.datatype_id = '(datatype_id)' \
                    ) T2 ON T1.serial_cd = T2.serial_cd AND T1.judge_text = '1' \
                    ) T3 \
                GROUP BY \
                    line_cd,station_slot " + sql_orderby
        sql = sql % ','.join(['%s'] * len(lineArr))
        sql = sql.replace("(process_cd)", process_cd).replace("(start_time)", start_time).replace("(end_time)", end_time) \
            .replace("(datatype_id)", datatype_id).replace("(LIMIT)", str(limit))
        cur.execute(sql, lineArr)
        rows = cur.fetchall()

        # 产线按钮的场合
        if firstFlg:
            last_line = ""
            for row in rows:
                # 每条产线只取第一条数据（ng最大的station）
                if row[0] != last_line:
                    result.append({"line_cd": row[0], "ng_count": int(row[2]), })
                    last_line = row[0]
        else:# 下方ng列表的场合
            ngRgb = get_config("NG_RGB")
            ng_view_count = ngRgb[0]
            for row in rows:
                if int(row[2]) >= ng_view_count:
                    result.append({"line_cd":row[0], "station_slot":row[1], "ng_count":int(row[2]), })

    except BaseException as exp:
        print(exp)
        result = databaseException(exp)
    connections[model_name].close()
    return result

# 获取指定产线和datatype_id下的station和slot
def getStationSlot(model_name, datatype_id, line_cd):
    result = {}
    partsserial_cd = line_cd + "MS%"
    try:
        cur = connections[model_name].cursor()
        sql = "SELECT\
                    max(\
                    substr(\
                    partsserial_cd,\
                    position( 'MS' IN partsserial_cd ) + 2,\
                    ( position( '-' IN partsserial_cd ) - ( position( 'MS' IN partsserial_cd ) + 2 ) ) \
                    ) \
                    ) AS station,\
                    max( substr( partsserial_cd, position( '-' IN partsserial_cd ) + 1 ) ) AS slot \
                FROM\
                    t_faci_" + model_name + " faci \
                WHERE\
                    datatype_id = %s \
                    AND partsserial_cd LIKE %s"
        cur.execute(sql, (datatype_id, partsserial_cd))
        rows = cur.fetchall()
        for row in rows:
            result = {"station": row[0], "slot": row[1]}
    except BaseException as exp:
        print(exp)
        result = databaseException(exp)
    connections[model_name].close()
    return result

def get_cur():
    database = get_config("database")
    model_name = database[0]['MODEL']
    cur = connections[model_name].cursor()
    return cur
