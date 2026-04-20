"""
Models mirroring the existing MySQL real estate database schema (DBPROJECT).
All models use managed=False to prevent Django from managing these tables.
"""
from django.db import models


class Owner(models.Model):
    owner_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    phone = models.CharField(max_length=15, unique=True, blank=True, null=True)
    email = models.EmailField(max_length=50, unique=True, blank=True, null=True)

    class Meta:
        db_table = 'owner'
        managed = False

    def __str__(self):
        return self.name


class Agent(models.Model):
    agent_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    contact = models.CharField(max_length=15, db_column='phone', unique=True, blank=True, null=True)
    email = models.EmailField(max_length=50, unique=True, blank=True, null=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)

    class Meta:
        db_table = 'agent'
        managed = False

    def __str__(self):
        return self.name


class Buyer(models.Model):
    buyer_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    phone = models.CharField(max_length=15, unique=True, blank=True, null=True)
    email = models.EmailField(max_length=50, unique=True, blank=True, null=True)

    class Meta:
        db_table = 'buyer'
        managed = False

    def __str__(self):
        return self.name


class Tenant(models.Model):
    tenant_id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    phone = models.CharField(max_length=15, unique=True, blank=True, null=True)
    email = models.EmailField(max_length=50, unique=True, blank=True, null=True)

    class Meta:
        db_table = 'tenant'
        managed = False

    def __str__(self):
        return self.name


class Property(models.Model):
    property_id = models.IntegerField(primary_key=True)
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    locality = models.CharField(max_length=50)
    type = models.CharField(max_length=30)
    size = models.IntegerField()
    no_of_bedroom = models.IntegerField()
    listed_price = models.DecimalField(max_digits=12, decimal_places=2)
    listed_date = models.DateField()
    construction_year = models.IntegerField()
    current_status = models.CharField(max_length=20)
    
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, db_column='owner_id')
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, db_column='agent_id')

    class Meta:
        db_table = 'property'
        managed = False

    def __str__(self):
        return f"{self.address}, {self.city}"


class Sale(models.Model):
    # In new schema, property_id is the primary key for Sale
    property = models.OneToOneField(Property, on_delete=models.CASCADE, db_column='property_id', primary_key=True)
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE, db_column='buyer_id')
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, db_column='agent_id')
    sale_date = models.DateField()
    final_price = models.DecimalField(max_digits=12, decimal_places=2)
    days_on_market = models.IntegerField()

    class Meta:
        db_table = 'sale'
        managed = False


class Rent(models.Model):
    id = models.AutoField(primary_key=True)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, db_column='property_id')
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, db_column='tenant_id')
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, db_column='agent_id')
    start_date = models.DateField()
    end_date = models.DateField()
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'rent'
        managed = False
        unique_together = (('property', 'tenant', 'start_date'),)
