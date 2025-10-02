from django.http import JsonResponse
from django.urls import path

def api_test_view(request):
    return JsonResponse({
        'status': 'success',
        'message': 'TrashToTreasure API is working!',
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

# Add this to the main urlpatterns
test_urlpattern = path('api/test/', api_test_view, name='api-test')