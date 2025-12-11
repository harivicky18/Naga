from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_transaction, name='create_transaction'),
    path('list/', views.list_transactions, name='list_transactions'),
    path('<int:transaction_id>/', views.get_transaction, name='get_transaction'),
    path('<int:transaction_id>/update-status/', views.update_transaction_status, name='update_transaction_status'),
]