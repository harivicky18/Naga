from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Card
from .serializers import CardSerializer, CardListSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_card(request):
    """Add a new card"""
    serializer = CardSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({
            'status': 'success',
            'message': 'Card added successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'status': 'error',
        'message': 'Failed to add card',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_cards(request):
    """List all cards for the authenticated user"""
    cards = Card.objects.filter(user=request.user)
    serializer = CardListSerializer(cards, many=True)
    
    return Response({
        'status': 'success',
        'data': serializer.data,
        'count': cards.count()
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_card(request, card_id):
    """Get a specific card"""
    try:
        card = Card.objects.get(id=card_id, user=request.user)
        serializer = CardListSerializer(card)
        
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Card.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Card not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_card(request, card_id):
    """Delete a card"""
    try:
        card = Card.objects.get(id=card_id, user=request.user)
        card_info = f"{card.card_type} - {card.masked_number}"
        card.delete()
        
        return Response({
            'status': 'success',
            'message': f'Card {card_info} deleted successfully'
        }, status=status.HTTP_200_OK)
    except Card.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Card not found'
        }, status=status.HTTP_404_NOT_FOUND)