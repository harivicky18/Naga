from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.add_card, name='add_card'),
    path('list/', views.list_cards, name='list_cards'),
    path('<int:card_id>/', views.get_card, name='get_card'),
    path('<int:card_id>/delete/', views.delete_card, name='delete_card'),
]