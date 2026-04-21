from api.views import AnalyticsView
from rest_framework.request import Request
from django.http import HttpRequest
from django.contrib.auth.models import User

req = HttpRequest()
req.method = 'GET'
req.user = User.objects.get(username='admin')
req = Request(req)
view = AnalyticsView()
try:
    res = view.get(req)
    print(res.data)
except Exception as e:
    import traceback
    traceback.print_exc()
