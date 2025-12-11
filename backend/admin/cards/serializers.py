from rest_framework import serializers
from .models import Card
import re
from datetime import datetime

class CardSerializer(serializers.ModelSerializer):
    card_number = serializers.CharField(write_only=True, required=True)
    cvv = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Card
        fields = ('id', 'card_type', 'masked_number', 'last_four_digits', 
                  'card_holder_name', 'expiry_month', 'expiry_year', 'created_at',
                  'card_number', 'cvv')
        read_only_fields = ('id', 'card_type', 'masked_number', 'last_four_digits', 'created_at')
    
    def validate_card_number(self, value):
        """Validate card number"""
        card_number = value.replace(' ', '').replace('-', '')
        
        if not card_number.isdigit():
            raise serializers.ValidationError("Card number must contain only digits")
        
        if not (13 <= len(card_number) <= 19):
            raise serializers.ValidationError("Card number must be between 13 and 19 digits")
        
        # Luhn Algorithm validation
        def luhn_check(card_num):
            digits = [int(d) for d in card_num]
            checksum = 0
            for i in range(len(digits) - 2, -1, -2):
                digits[i] *= 2
                if digits[i] > 9:
                    digits[i] -= 9
            return sum(digits) % 10 == 0
        
        if not luhn_check(card_number):
            raise serializers.ValidationError("Invalid card number")
        
        return card_number
    
    def validate_cvv(self, value):
        """Validate CVV"""
        if not value.isdigit():
            raise serializers.ValidationError("CVV must contain only digits")
        
        if not (3 <= len(value) <= 4):
            raise serializers.ValidationError("CVV must be 3 or 4 digits")
        
        return value
    
    def validate_card_holder_name(self, value):
        """Validate card holder name"""
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Card holder name must contain only letters")
        return value.upper()
    
    def validate(self, attrs):
        """Validate expiry date"""
        expiry_month = attrs.get('expiry_month')
        expiry_year = attrs.get('expiry_year')
        
        if not (1 <= int(expiry_month) <= 12):
            raise serializers.ValidationError({"expiry_month": "Month must be between 01 and 12"})
        
        if len(expiry_year) != 4:
            raise serializers.ValidationError({"expiry_year": "Year must be 4 digits"})
        
        current_date = datetime.now()
        expiry_date = datetime(int(expiry_year), int(expiry_month), 1)
        
        if expiry_date < datetime(current_date.year, current_date.month, 1):
            raise serializers.ValidationError({"expiry_date": "Card has expired"})
        
        return attrs
    
    def create(self, validated_data):
        card_number = validated_data.pop('card_number')
        validated_data.pop('cvv')  # Never store CVV
        
        validated_data['card_type'] = Card.detect_card_type(card_number)
        validated_data['masked_number'] = Card.mask_card_number(card_number)
        validated_data['last_four_digits'] = card_number[-4:]
        
        return super().create(validated_data)

class CardListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ('id', 'card_type', 'masked_number', 'last_four_digits', 
                  'card_holder_name', 'expiry_month', 'expiry_year', 'created_at')