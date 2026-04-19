"""
Models mirroring the existing MySQL real estate database schema.
All models use managed=False to prevent Django from managing these tables
(they already exist with triggers and indexes).
"""
from django.db import models


class Owner(models.Model):
    owner_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'Owner'
        managed = False

    def __str__(self):
        return self.name


class Agent(models.Model):
    agent_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'Agent'
        managed = False

    def __str__(self):
        return self.name


class Buyer(models.Model):
    buyer_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    budget = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'Buyer'
        managed = False

    def __str__(self):
        return self.name


class Tenant(models.Model):
    tenant_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'Tenant'
        managed = False

    def __str__(self):
        return self.name


class Property(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
    ]
    TYPE_CHOICES = [
        ('Apartment', 'Apartment'),
        ('House', 'House'),
        ('Villa', 'Villa'),
        ('Plot', 'Plot'),
        ('Commercial', 'Commercial'),
        ('Studio', 'Studio'),
    ]

    property_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, db_column='owner_id')
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, db_column='agent_id')
    address = models.CharField(max_length=255)
    locality = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    property_type = models.CharField(max_length=50, choices=TYPE_CHOICES, blank=True, null=True, db_column='property_type')
    bedrooms = models.IntegerField(blank=True, null=True)
    bathrooms = models.IntegerField(blank=True, null=True)
    size_sqft = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    construction_year = models.IntegerField(blank=True, null=True)
    listed_price = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    description = models.TextField(blank=True, null=True)
    listed_date = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'Property'
        managed = False

    def __str__(self):
        return f"{self.address}, {self.city}"


class Sale(models.Model):
    sale_id = models.AutoField(primary_key=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, db_column='property_id')
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE, db_column='buyer_id')
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, db_column='agent_id')
    sale_date = models.DateField()
    final_price = models.DecimalField(max_digits=15, decimal_places=2)
    days_on_market = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'Sale'
        managed = False

    def __str__(self):
        return f"Sale #{self.sale_id} - {self.property}"


class Rent(models.Model):
    rent_id = models.AutoField(primary_key=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, db_column='property_id')
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, db_column='tenant_id')
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, db_column='agent_id')
    start_date = models.DateField()
    end_date = models.DateField()
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'Rent'
        managed = False

    def __str__(self):
        return f"Rent #{self.rent_id} - {self.property}"
