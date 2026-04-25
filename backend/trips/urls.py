from django.urls import path
from .views import health_check, plan_trip

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("plan/", plan_trip, name="plan-trip"),
]