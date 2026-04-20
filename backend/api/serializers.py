from rest_framework import serializers
from .models import Owner, Agent, Buyer, Tenant, Property, Sale, Rent


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = '__all__'


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = '__all__'


class BuyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buyer
        fields = '__all__'


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'


class PropertySerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'property_id', 'owner', 'owner_name', 'agent', 'agent_name',
            'address', 'locality', 'city', 'type', 'no_of_bedroom',
            'size', 'construction_year', 'listed_price',
            'current_status', 'listed_date',
        ]

    def get_owner_name(self, obj):
        return obj.owner.name if obj.owner else "N/A"
    
    def get_agent_name(self, obj):
        return obj.agent.name if obj.agent else "N/A"


class PropertyDetailSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    agent = AgentSerializer(read_only=True)
    active_rent = serializers.SerializerMethodField()
    sale_info = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = '__all__'

    def get_active_rent(self, obj):
        from datetime import date
        rent = Rent.objects.filter(
            property=obj,
            start_date__lte=date.today(),
            end_date__gte=date.today()
        ).first()
        if rent:
            return {
                'tenant_name': rent.tenant.name if rent.tenant else "N/A",
                'monthly_rent': str(rent.monthly_rent),
                'start_date': str(rent.start_date),
                'end_date': str(rent.end_date),
            }
        return None

    def get_sale_info(self, obj):
        sale = Sale.objects.filter(property=obj).first()
        if sale:
            return {
                'buyer_name': sale.buyer.name if sale.buyer else "N/A",
                'sale_date': str(sale.sale_date),
                'final_price': str(sale.final_price),
            }
        return None


class SaleSerializer(serializers.ModelSerializer):
    property_address = serializers.SerializerMethodField()
    property_city = serializers.SerializerMethodField()
    property_locality = serializers.SerializerMethodField()
    property_type = serializers.SerializerMethodField()
    property_bedrooms = serializers.SerializerMethodField()
    buyer_name = serializers.SerializerMethodField()
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            'property', 'property_address', 'property_city',
            'property_locality', 'property_type', 'property_bedrooms',
            'buyer', 'buyer_name', 'agent', 'agent_name',
            'sale_date', 'final_price', 'days_on_market',
        ]

    def get_property_address(self, obj): return obj.property.address if obj.property else "Unknown"
    def get_property_city(self, obj): return obj.property.city if obj.property else "Unknown"
    def get_property_locality(self, obj): return obj.property.locality if obj.property else "Unknown"
    def get_property_type(self, obj): return obj.property.type if obj.property else "Unknown"
    def get_property_bedrooms(self, obj): return obj.property.no_of_bedroom if obj.property else 0
    def get_buyer_name(self, obj): return obj.buyer.name if obj.buyer else "N/A"
    def get_agent_name(self, obj): return obj.agent.name if obj.agent else "N/A"

    def validate(self, data):
        prop = data.get('property')
        if prop and prop.current_status == 'sold':
            raise serializers.ValidationError(
                f"Property '{prop.address}' is already sold."
            )
        if data.get('final_price', 0) < 0:
            raise serializers.ValidationError("Final price must be non-negative.")
        return data


class RentSerializer(serializers.ModelSerializer):
    property_address = serializers.SerializerMethodField()
    property_city = serializers.SerializerMethodField()
    property_locality = serializers.SerializerMethodField()
    tenant_name = serializers.SerializerMethodField()
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = Rent
        fields = [
            'id', 'property', 'property_address', 'property_city',
            'property_locality', 'tenant', 'tenant_name', 'agent', 'agent_name',
            'start_date', 'end_date', 'monthly_rent',
        ]

    def get_property_address(self, obj): return obj.property.address if obj.property else "Unknown"
    def get_property_city(self, obj): return obj.property.city if obj.property else "Unknown"
    def get_property_locality(self, obj): return obj.property.locality if obj.property else "Unknown"
    def get_tenant_name(self, obj): return obj.tenant.name if obj.tenant else "N/A"
    def get_agent_name(self, obj): return obj.agent.name if obj.agent else "N/A"

    def validate(self, data):
        prop = data.get('property')
        start = data.get('start_date')
        end = data.get('end_date')

        if prop and prop.current_status == 'sold':
            raise serializers.ValidationError(
                f"Property '{prop.address}' is sold and cannot be rented."
            )
        if start and end and end <= start:
            raise serializers.ValidationError("End date must be after start date.")
        if data.get('monthly_rent', 0) < 0:
            raise serializers.ValidationError("Monthly rent must be non-negative.")

        # Check for overlapping rent periods
        if prop and start and end:
            overlap = Rent.objects.filter(
                property=prop,
                start_date__lt=end,
                end_date__gt=start,
            )
            if self.instance:
                overlap = overlap.exclude(pk=self.instance.pk)
            if overlap.exists():
                raise serializers.ValidationError(
                    "Overlapping rent period exists for this property. "
                    "Please choose different dates."
                )
        return data


# ---- Report Serializers ----

class AgentSalesReportSerializer(serializers.Serializer):
    agent_id = serializers.IntegerField()
    agent_name = serializers.CharField()
    contact = serializers.CharField()
    email = serializers.CharField()
    rating = serializers.DecimalField(max_digits=2, decimal_places=1)
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=20, decimal_places=2)
    sales = SaleSerializer(many=True)


class AgentRentalReportSerializer(serializers.Serializer):
    agent_id = serializers.IntegerField()
    agent_name = serializers.CharField()
    contact = serializers.CharField()
    email = serializers.CharField()
    rating = serializers.DecimalField(max_digits=2, decimal_places=1)
    total_rentals = serializers.IntegerField()
    rents = RentSerializer(many=True)
