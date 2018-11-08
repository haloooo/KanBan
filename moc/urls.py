"""sf URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from RtMonSys.views import view_homePage
import basics.views.user
import basics.views.plan
import basics.views.login
from django.views.generic.base import RedirectView

urlpatterns = [
    # 看板显示
    url(r'^favicon.ico$',RedirectView.as_view(url=r'static/favicon.ico')),
    url(r'^$',  basics.views.login.go_Login),
    url(r'^go_homePage', view_homePage.go_homePage),
    url(r'^initData', view_homePage.initData),
    url(r'^time_interval', view_homePage.time_interval),
    url(r'^go_history', view_homePage.go_history),
    # 计划管理
    url(r'^go_Plan', basics.views.plan.go_Plan),  # 一览画面
    url(r'^getPlans', basics.views.plan.getPlans),  # 获取计划
    url(r'^insertPlan', basics.views.plan.insertPlan),
    url(r'^deletePlan', basics.views.plan.deletePlan),
    url(r'^editPlan', basics.views.plan.editPlan),
    url(r'^getAllPlans', basics.views.plan.getAllPlans),
    url(r'^saveUserAssy', basics.views.plan.saveUserAssy),

    # 用户管理
    url(r'^go_User', basics.views.user.go_User),  # 用户一览画面
    url(r'^getUsers', basics.views.user.getUsers),  # 获取用户
    url(r'^editUser', basics.views.user.editUser),  #
    url(r'^insertUser', basics.views.user.insertUser),  #
    url(r'^updatePassword', basics.views.user.updatePassword),  #
    url(r'^deleteUser', basics.views.user.deleteUser),  #

    # 登陆
    url(r'^go_Login', basics.views.login.go_Login),  # 登陆页面
    url(r'^user_Login', basics.views.login.user_Login),  # 登陆方法
]
