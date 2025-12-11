from rest_framework import serializers
from .models import Transaction
from cards.serializers import CardListSerializer

class TransactionSerializer(serializers.ModelSerializer):
    card_details = CardListSerializer(source='card', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ('id', 'user', 'user_name', 'card', 'card_details', 'amount', 
                  'currency', 'status', 'payment_method', 'description', 
                  'transaction_date', 'updated_at')
        read_only_fields = ('id', 'user', 'status', 'transaction_date', 'updated_at')
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        if value > 100000:
            raise serializers.ValidationError("Amount cannot exceed 100,000")
        return value

class TransactionCreateSerializer(serializers.Serializer):
    card_id = serializers.IntegerField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    currency = serializers.CharField(max_length=3, default='USD')
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        if value > 100000:
            raise serializers.ValidationError("Amount cannot exceed 100,000")
        return value