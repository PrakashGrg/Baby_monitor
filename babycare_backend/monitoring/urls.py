from rest_framework.routers import DefaultRouter
from .views import EventViewSet, SystemLogViewSet

router = DefaultRouter()
router.register('logs', SystemLogViewSet, basename='systemlog')
router.register('', EventViewSet, basename='event')

urlpatterns = router.urls