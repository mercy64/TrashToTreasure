from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_test_view(request):
    return JsonResponse({
        'status': 'success',
        'message': 'TrashToTreasure API is working!',
        'server_time': str(request.META.get('HTTP_DATE', 'Unknown')),
        'endpoints': {
            'auth': [
                '/api/auth/register/',
                '/api/auth/login/', 
                '/api/auth/profile/'
            ],
            'waste': [
                '/api/waste/listings/',
                '/api/waste/listings/create/',
                '/api/waste/listings/my/',
                '/api/waste/transactions/my/'
            ],
            'messaging': [
                '/api/messaging/conversations/',
                '/api/messaging/notifications/'
            ]
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test/', api_test_view, name='api-test'),
    path('api/auth/', include('accounts.urls')),
    path('api/waste/', include('waste_management.urls')),
    path('api/messaging/', include('messaging.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)