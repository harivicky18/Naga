from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('users/', views.manage_users, name='manage_users'),
    path('users/<int:user_id>/', views.get_user_details, name='get_user_details'),
    path('users/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle_user_status'),
    path('cards/', views.view_all_cards, name='view_all_cards'),
    path('transactions/', views.view_all_transactions, name='view_all_transactions'),
    path('daily-summary/', views.daily_payment_summary, name='daily_payment_summary'),
    path('export-transactions/', views.export_transactions_csv, name='export_transactions_csv'),
]