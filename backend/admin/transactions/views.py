from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime
from .models import Transaction
from .serializers import TransactionSerializer, TransactionCreateSerializer
from cards.models import Card
import csv
from django.http import HttpResponse

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    """Create a new transaction (will be processed by FastAPI)"""
    serializer = TransactionCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        card_id = serializer.validated_data['card_id']
        
        try:
            card = Card.objects.get(id=card_id, user=request.user)
        except Card.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Card not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create transaction with PENDING status
        transaction = Transaction.objects.create(
            user=request.user,
            card=card,
            amount=serializer.validated_data['amount'],
            currency=serializer.validated_data.get('currency', 'USD'),
            description=serializer.validated_data.get('description', ''),
            payment_method=f"{card.card_type} - {card.last_four_digits}",
            status='PENDING'
        )
        
        return Response({
            'status': 'success',
            'message': 'Transaction created successfully',
            'data': TransactionSerializer(transaction).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'status': 'error',
        'message': 'Failed to create transaction',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_transactions(request):
    """List all transactions for the authenticated user with filters"""
    transactions = Transaction.objects.filter(user=request.user)
    
    # Filters
    status_filter = request.GET.get('status')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    min_amount = request.GET.get('min_amount')
    max_amount = request.GET.get('max_amount')
    
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
    
    if min_amount:
        try:
            transactions = transactions.filter(amount__gte=float(min_amount))
        except ValueError:
            pass
    
    if max_amount:
        try:
            transactions = transactions.filter(amount__lte=float(max_amount))
        except ValueError:
            pass
    
    serializer = TransactionSerializer(transactions, many=True)
    
    return Response({
        'status': 'success',
        'data': serializer.data,
        'count': transactions.count()
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction(request, transaction_id):
    """Get a specific transaction"""
    try:
        transaction = Transaction.objects.get(id=transaction_id, user=request.user)
        serializer = TransactionSerializer(transaction)
        
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Transaction.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Transaction not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
def update_transaction_status(request, transaction_id):
    """Update transaction status (used by FastAPI payment processor)"""
    try:
        transaction = Transaction.objects.get(id=transaction_id)
        new_status = request.data.get('status')
        
        if new_status in ['SUCCESS', 'FAILED']:
            transaction.status = new_status
            transaction.save()
            
            return Response({
                'status': 'success',
                'message': f'Transaction status updated to {new_status}',
                'data': TransactionSerializer(transaction).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'message': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
    except Transaction.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Transaction not found'
        }, status=status.HTTP_404_NOT_FOUND)