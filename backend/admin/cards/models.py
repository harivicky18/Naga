from django.db import models
from django.conf import settings

class Card(models.Model):
    CARD_TYPES = [
        ('VISA', 'Visa'),
        ('MASTERCARD', 'Mastercard'),
        ('AMEX', 'American Express'),
        ('DISCOVER', 'Discover'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cards')
    card_type = models.CharField(max_length=20, choices=CARD_TYPES)
    masked_number = models.CharField(max_length=19)
    last_four_digits = models.CharField(max_length=4)
    card_holder_name = models.CharField(max_length=100)
    expiry_month = models.CharField(max_length=2)
    expiry_year = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cards'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.card_type} - {self.masked_number}"
    
    @staticmethod
    def mask_card_number(card_number):
        """Mask card number showing only last 4 digits"""
        if len(card_number) < 4:
            return '****'
        return '**** **** **** ' + card_number[-4:]
    
    @staticmethod
    def detect_card_type(card_number):
        """Detect card type based on card number"""
        card_number = card_number.replace(' ', '')
        
        if card_number[0] == '4':
            return 'VISA'
        elif card_number[:2] in ['51', '52', '53', '54', '55'] or (2221 <= int(card_number[:4]) <= 2720):
            return 'MASTERCARD'
        elif card_number[:2] in ['34', '37']:
            return 'AMEX'
        elif card_number[:4] == '6011' or card_number[:2] == '65':
            return 'DISCOVER'
        else:
            return 'UNKNOWN'