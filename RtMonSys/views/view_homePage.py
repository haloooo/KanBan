# -*-coding:utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render
from RtMonSys.models import model_homePage, models_common
from RtMonSys.models.models_logger import Logger
from django.http import HttpResponse
import json, time

def go_homePage(request):
    Logger.write_log("初始化Home Page数据")
    return render(request, 'HomePage.html')

def go_history(request):
    Logger.write_log("初始化History数据")
    return render(request, 'History.html')

def initData(request):
    Logger.write_log("获取所有产线数据")
    result = model_homePage.initData(request)
    return result

def time_interval(request):
    Logger.write_log("获取刷新时间")
    result = []
    database = models_common.get_config("database")
    model_name = database[0]['MODEL']
    timepart = models_common.get_config('time_interval')
    datestr = time.strftime('%Y-%m-%d', time.localtime(time.time()))
    result.append({'time':timepart,'model_name':model_name,'datetime':datestr})
    jsonstr = json.dumps(result)
    return HttpResponse(jsonstr)




