from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.http import HttpResponse
from datetime import datetime, timedelta
from cards.models import Card
from transactions.models import Transaction
from authentication.serializers import UserSerializer
from cards.serializers import CardListSerializer
from transactions.serializers import TransactionSerializer
import csv

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard(request):
    """Get admin dashboard statistics"""
    total_users = User.objects.count()
    total_cards = Card.objects.count()
    total_transactions = Transaction.objects.count()
    
    successful_transactions = Transaction.objects.filter(status='SUCCESS')
    total_revenue = successful_transactions.aggregate(Sum('amount'))['amount__sum'] or 0
    
    # Today's statistics
    today = datetime.now().date()
    today_transactions = Transaction.objects.filter(transaction_date__date=today)
    today_revenue = today_transactions.filter(status='SUCCESS').aggregate(Sum('amount'))['amount__sum'] or 0
    
    # Last 7 days statistics
    week_ago = datetime.now() - timedelta(days=7)
    week_transactions = Transaction.objects.filter(transaction_date__gte=week_ago)
    
    # Status breakdown
    status_breakdown = {
        'pending': Transaction.objects.filter(status='PENDING').count(),
        'success': Transaction.objects.filter(status='SUCCESS').count(),
        'failed': Transaction.objects.filter(status='FAILED').count(),
    }
    
    return Response({
        'status': 'success',
        'data': {
            'total_users': total_users,
            'total_cards': total_cards,
            'total_transactions': total_transactions,
            'total_revenue': float(total_revenue),
            'today_transactions': today_transactions.count(),
            'today_revenue': float(today_revenue),
            'week_transactions': week_transactions.count(),
            'status_breakdown': status_breakdown
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def manage_users(request):
    """Get all users"""
    users = User.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    
    return Response({
        'status': 'success',
        'data': serializer.data,
        'count': users.count()
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_user_details(request, user_id):
    """Get specific user details with their cards and transactions"""
    try:
        user = User.objects.get(id=user_id)
        cards = Card.objects.filter(user=user)
        transactions = Transaction.objects.filter(user=user)
        
        return Response({
            'status': 'success',
            'data': {
                'user': UserSerializer(user).data,
                'cards': CardListSerializer(cards, many=True).data,
                'transactions': TransactionSerializer(transactions, many=True).data,
                'stats': {
                    'total_cards': cards.count(),
                    'total_transactions': transactions.count(),
                    'total_spent': transactions.filter(status='SUCCESS').aggregate(Sum('amount'))['amount__sum'] or 0
                }
            }
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_user_status(request, user_id):
    """Activate or deactivate a user"""
    try:
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            'status': 'success',
            'message': f"User {'activated' if user.is_active else 'deactivated'} successfully",
            'data': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_all_cards(request):
    """View all cards in the system"""
    cards = Card.objects.select_related('user').all()
    
    data = []
    for card in cards:
        card_data = CardListSerializer(card).data
        card_data['user'] = {
            'id': card.user.id,
            'username': card.user.username,
            'email': card.user.email
        }
        data.append(card_data)
    
    return Response({
        'status': 'success',
        'data': data,
        'count': cards.count()
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def view_all_transactions(request):
    """View all transactions with filters"""
    transactions = Transaction.objects.select_related('user', 'card').all()
    
    # Filters
    status_filter = request.GET.get('status')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    if status_filter:
        transactions = transactions.filter(status=status_filter.upper())
    
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
            transactions = transactions.filter(transaction_date__gte=date_from_obj)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d')
            transactions = transactions.filter(transaction_date__lte=date_to_obj)
        except ValueError:
            pass
    
    serializer = TransactionSerializer(transactions, many=True)
    
    return Response({
        'status': 'success',
        'data': serializer.data,
        'count': transactions.count()
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def daily_payment_summary(request):
    """Get daily payment summary"""
    date_str = request.GET.get('date')
    
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        target_date = datetime.now().date()
    
    transactions = Transaction.objects.filter(transaction_date__date=target_date)
    
    summary = {
        'date': target_date.isoformat(),
        'total_transactions': transactions.count(),
        'successful': transactions.filter(status='SUCCESS').count(),
        'failed': transactions.filter(status='FAILED').count(),
        'pending': transactions.filter(status='PENDING').count(),
        'total_amount': float(transactions.aggregate(Sum('amount'))['amount__sum'] or 0),
        'successful_amount': float(transactions.filter(status='SUCCESS').aggregate(Sum('amount'))['amount__sum'] or 0),
    }
    
    return Response({
        'status': 'success',
        'data': summary
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def export_transactions_csv(request):
    """Export transactions to CSV"""
    # Check if user is authenticated via header or URL token
    from rest_framework_simplejwt.authentication import JWTAuthentication
    from rest_framework.exceptions import AuthenticationFailed
    
    user = None
    
    # Try to authenticate from Authorization header first
    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        # Try to get token from URL parameter
        token = request.GET.get('token')
        if token:
            try:
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
            except:
                pass
    
    # Check if user is admin
    if not user or not user.is_staff:
        return Response({
            'status': 'error',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="transactions_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['ID', 'User', 'Card Type', 'Amount', 'Currency', 'Status', 'Date', 'Description'])
    
    transactions = Transaction.objects.select_related('user', 'card').all()
    
    for txn in transactions:
        writer.writerow([
            txn.id,
            txn.user.username,
            txn.card.card_type,
            txn.amount,
            txn.currency,
            txn.status,
            txn.transaction_date.strftime('%Y-%m-%d %H:%M:%S'),
            txn.description
        ])
    
    return response