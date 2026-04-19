from django.contrib import admin
from .models import Owner, Agent, Buyer, Tenant, Property, Sale, Rent
admin.site.register(Owner)
admin.site.register(Agent)
admin.site.register(Buyer)
admin.site.register(Tenant)
admin.site.register(Property)
admin.site.register(Sale)
admin.site.register(Rent)
