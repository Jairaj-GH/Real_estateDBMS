from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import connection, IntegrityError, DatabaseError
from django.db.models import Q, Sum, Count, Max
from django.contrib.auth.models import User

from .models import Owner, Agent, Buyer, Tenant, Property, Sale, Rent, Notification
from .serializers import (
    OwnerSerializer, AgentSerializer, BuyerSerializer, TenantSerializer,
    PropertySerializer, PropertyDetailSerializer, SaleSerializer, RentSerializer,
    NotificationSerializer,
)
from .permissions import IsOfficeOrAdmin, IsAgentOrAdmin, IsAdminRole, IsAnyAuthenticatedRole
from authentication.views import CurrentUserView
from authentication.models import UserProfile


# ─── Current User ───────────────────────────────────────────────────────────

class CurrentUserAPIView(CurrentUserView):
    pass


# ─── Properties ─────────────────────────────────────────────────────────────

class PropertyListView(generics.ListAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated, IsAnyAuthenticatedRole]

    def get_queryset(self):
        qs = Property.objects.select_related('owner', 'agent').all()
        params = self.request.query_params

        city = params.get('city')
        locality = params.get('locality')
        property_type = params.get('type')
        status_filter = params.get('status')
        min_price = params.get('min_price')
        max_price = params.get('max_price')
        bedrooms = params.get('no_of_bedroom')
        agent_id = params.get('agent_id')
        search = params.get('search')

        if agent_id:
            qs = qs.filter(agent_id=agent_id)

        if city and city != 'All Cities':
            qs = qs.filter(city__icontains=city)
        if locality:
            qs = qs.filter(locality__icontains=locality)
        if property_type:
            qs = qs.filter(type=property_type)
        if status_filter:
            qs = qs.filter(current_status=status_filter)
        if min_price:
            qs = qs.filter(listed_price__gte=min_price)
        if max_price:
            qs = qs.filter(listed_price__lte=max_price)
        if bedrooms:
            qs = qs.filter(no_of_bedroom=bedrooms)
        if search:
            qs = qs.filter(
                Q(address__icontains=search) |
                Q(locality__icontains=search) |
                Q(city__icontains=search)
            )
        return qs.order_by('-listed_date')


class PropertyDetailView(generics.RetrieveAPIView):
    queryset = Property.objects.select_related('owner', 'agent').all()
    serializer_class = PropertyDetailSerializer
    permission_classes = [IsAuthenticated, IsAnyAuthenticatedRole]
    lookup_field = 'property_id'


class PropertyMetaView(APIView):
    """Return distinct filter options (cities, localities, types)."""
    permission_classes = [IsAuthenticated, IsAnyAuthenticatedRole]

    def get(self, request):
        cities = list(Property.objects.values_list('city', flat=True).distinct().order_by('city'))
        localities = list(Property.objects.values_list('locality', flat=True).distinct().order_by('locality'))
        types = list(Property.objects.values_list('type', flat=True).distinct().order_by('type'))
        return Response({
            'cities': [c for c in cities if c],
            'localities': [l for l in localities if l],
            'types': [t for t in types if t],
        })


# ─── Agents ─────────────────────────────────────────────────────────────────

class AgentListView(generics.ListAPIView):
    queryset = Agent.objects.all().order_by('name')
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated, IsOfficeOrAdmin]


# ─── Buyers ─────────────────────────────────────────────────────────────────

class BuyerListCreateView(generics.ListCreateAPIView):
    queryset = Buyer.objects.all().order_by('name')
    serializer_class = BuyerSerializer
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]


# ─── Tenants ─────────────────────────────────────────────────────────────────

class TenantListCreateView(generics.ListCreateAPIView):
    queryset = Tenant.objects.all().order_by('name')
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]


# ─── Sales ──────────────────────────────────────────────────────────────────

class SaleCreateView(generics.CreateAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except (IntegrityError, DatabaseError) as e:
            err = str(e)
            if 'already sold' in err.lower() or '1644' in err:
                return Response(
                    {'error': 'This property is already sold or a database trigger rejected this action.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response({'error': f'Database error: {err}'}, status=status.HTTP_400_BAD_REQUEST)


class SaleListView(generics.ListAPIView):
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated, IsOfficeOrAdmin]

    def get_queryset(self):
        qs = Sale.objects.select_related('property', 'buyer', 'agent').all()
        agent_id = self.request.query_params.get('agent_id')
        if agent_id:
            qs = qs.filter(agent_id=agent_id)
        return qs


# ─── Rents ──────────────────────────────────────────────────────────────────

class RentCreateView(generics.CreateAPIView):
    queryset = Rent.objects.all()
    serializer_class = RentSerializer
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except (IntegrityError, DatabaseError) as e:
            err = str(e)
            if 'overlap' in err.lower() or '1644' in err:
                return Response(
                    {'error': 'Overlapping rent period detected by database trigger. Choose different dates.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response({'error': f'Database error: {err}'}, status=status.HTTP_400_BAD_REQUEST)


class RentListView(generics.ListAPIView):
    serializer_class = RentSerializer
    permission_classes = [IsAuthenticated, IsOfficeOrAdmin]

    def get_queryset(self):
        qs = Rent.objects.select_related('property', 'tenant', 'agent').all()
        agent_id = self.request.query_params.get('agent_id')
        locality = self.request.query_params.get('locality')
        if agent_id:
            qs = qs.filter(agent_id=agent_id)
        if locality:
            qs = qs.filter(property__locality__icontains=locality)
        return qs


# ─── Reports ────────────────────────────────────────────────────────────────

class SalesReportView(APIView):
    permission_classes = [IsAuthenticated, IsOfficeOrAdmin]

    def get(self, request):
        agents = Agent.objects.all().order_by('name')
        report = []
        for agent in agents:
            sales = Sale.objects.select_related('property', 'buyer').filter(agent=agent)
            agent_data = {
                'agent_id': agent.agent_id,
                'agent_name': agent.name,
                'contact': agent.contact,
                'email': agent.email,
                'rating': str(agent.rating) if agent.rating else None,
                'total_sales': sales.count(),
                'total_revenue': str(sales.aggregate(total=Sum('final_price'))['total'] or 0),
                'sales': SaleSerializer(sales, many=True).data,
            }
            report.append(agent_data)
        return Response(report)


class RentalReportView(APIView):
    permission_classes = [IsAuthenticated, IsOfficeOrAdmin]

    def get(self, request):
        locality = request.query_params.get('locality')
        agents = Agent.objects.all().order_by('name')
        report = []
        for agent in agents:
            rents_qs = Rent.objects.select_related('property', 'tenant').filter(agent=agent)
            if locality:
                rents_qs = rents_qs.filter(property__locality__icontains=locality)
            agent_data = {
                'agent_id': agent.agent_id,
                'agent_name': agent.name,
                'contact': agent.contact,
                'email': agent.email,
                'rating': str(agent.rating) if agent.rating else None,
                'total_rentals': rents_qs.count(),
                'rents': RentSerializer(rents_qs, many=True).data,
            }
            report.append(agent_data)
        return Response(report)


# ─── Admin: SQL Console ──────────────────────────────────────────────────────

class AdminSQLView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        sql = request.data.get('query', '').strip()
        if not sql:
            return Response({'error': 'No query provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                if cursor.description:  # SELECT query
                    columns = [col[0] for col in cursor.description]
                    rows = cursor.fetchall()
                    return Response({
                        'type': 'select',
                        'columns': columns,
                        'rows': [list(r) for r in rows],
                        'row_count': len(rows),
                    })
                else:  # INSERT/UPDATE/DELETE
                    connection.connection.commit()
                    return Response({
                        'type': 'modify',
                        'affected_rows': cursor.rowcount,
                        'message': f'Query executed successfully. {cursor.rowcount} row(s) affected.',
                    })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ─── Admin: Database Stats ───────────────────────────────────────────────────

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        from datetime import date
        stats = {
            'total_properties': Property.objects.count(),
            'available_properties': Property.objects.filter(current_status='available').count(),
            'sold_properties': Property.objects.filter(current_status='sold').count(),
            'rented_properties': Property.objects.filter(current_status='rented').count(),
            'total_agents': Agent.objects.count(),
            'total_owners': Owner.objects.count(),
            'total_buyers': Buyer.objects.count(),
            'total_tenants': Tenant.objects.count(),
            'total_sales': Sale.objects.count(),
            'total_sales_revenue': str(Sale.objects.aggregate(t=Sum('final_price'))['t'] or 0),
            'total_rents': Rent.objects.count(),
            'active_rents': Rent.objects.filter(
                start_date__lte=date.today(),
                end_date__gte=date.today()
            ).count(),
        }
        return Response(stats)


# ─── Admin: Table Browser ───────────────────────────────────────────────────

ALLOWED_TABLES = {
    'Owner': Owner,
    'Agent': Agent,
    'Buyer': Buyer,
    'Tenant': Tenant,
    'Property': Property,
    'Sale': Sale,
    'Rent': Rent,
}

ALLOWED_SERIALIZERS = {
    'Owner': OwnerSerializer,
    'Agent': AgentSerializer,
    'Buyer': BuyerSerializer,
    'Tenant': TenantSerializer,
    'Property': PropertySerializer,
    'Sale': SaleSerializer,
    'Rent': RentSerializer,
}


class AdminTableView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, table_name):
        if table_name not in ALLOWED_TABLES:
            return Response(
                {'error': f'Table "{table_name}" not allowed. Choose from: {list(ALLOWED_TABLES.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        model = ALLOWED_TABLES[table_name]
        serializer_class = ALLOWED_SERIALIZERS[table_name]
        qs = model.objects.all()
        page = int(request.query_params.get('page', 1))
        page_size = 25
        total = qs.count()
        start = (page - 1) * page_size
        end = start + page_size
        data = serializer_class(qs[start:end], many=True).data
        return Response({
            'table': table_name,
            'total': total,
            'page': page,
            'page_size': page_size,
            'results': data,
        })


# ─── Admin: User Management ─────────────────────────────────────────────────

class AdminUserListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        users = User.objects.select_related('profile').all().order_by('email')
        data = []
        for u in users:
            try:
                role = u.profile.role
                agent_id = u.profile.agent_id
            except Exception:
                role = 'customer'
                agent_id = None
            data.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'full_name': u.get_full_name(),
                'is_active': u.is_active,
                'role': role,
                'agent_id': agent_id,
                'date_joined': u.date_joined.isoformat(),
            })
        return Response(data)

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()
        role = request.data.get('role', 'customer')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        agent_id = request.data.get('agent_id')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists.'}, status=400)

        username = email.split('@')[0]
        base = username
        i = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{i}"
            i += 1

        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name,
        )
        UserProfile.objects.create(user=user, role=role, agent_id=agent_id or None)
        return Response({'message': 'User created successfully.', 'id': user.id}, status=201)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

        is_active = request.data.get('is_active')
        role = request.data.get('role')
        agent_id = request.data.get('agent_id')

        if is_active is not None:
            user.is_active = is_active
            user.save()
        if role is not None:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.role = role
            if agent_id is not None:
                profile.agent_id = agent_id or None
            profile.save()
        return Response({'message': 'User updated successfully.'})

    def delete(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
            user.delete()
            return Response({'message': 'User deleted.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)


# ─── Agent's own transactions ────────────────────────────────────────────────

class AgentMyTransactionsView(APIView):
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]

    def get(self, request):
        try:
            agent_id = request.user.profile.agent_id
        except Exception:
            return Response({'error': 'No agent linked to this account.'}, status=400)
        if not agent_id:
            return Response({'error': 'No agent_id linked to this account.'}, status=400)
        sales = Sale.objects.filter(agent_id=agent_id).select_related('property', 'buyer')
        rents = Rent.objects.filter(agent_id=agent_id).select_related('property', 'tenant')
        return Response({
            'sales': SaleSerializer(sales, many=True).data,
            'rents': RentSerializer(rents, many=True).data,
        })


# ─── Overlap check endpoint ─────────────────────────────────────────────────

class RentOverlapCheckView(APIView):
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]

    def post(self, request):
        property_id = request.data.get('property_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not all([property_id, start_date, end_date]):
            return Response({'error': 'property_id, start_date, end_date required.'}, status=400)

        qs = Rent.objects.filter(
            property_id=property_id,
            start_date__lt=end_date,
            end_date__gt=start_date,
        )

        return Response({'overlaps': qs.exists()})


# ─── Analytics Dashboard ─────────────────────────────────────────────────────

class AnalyticsView(APIView):
    """Comprehensive analytics data from real database records."""
    permission_classes = [IsAuthenticated, IsAnyAuthenticatedRole]

    def get(self, request):
        from datetime import date
        from django.db.models import Avg, Max, Min
        from django.db.models.functions import ExtractYear, ExtractMonth

        # --- KPI Summary ---
        total_sales_revenue = Sale.objects.aggregate(t=Sum('final_price'))['t'] or 0
        total_sales_count = Sale.objects.count()
        avg_deal_size = Sale.objects.aggregate(a=Avg('final_price'))['a'] or 0
        active_rents = Rent.objects.filter(
            start_date__lte=date.today(),
            end_date__gte=date.today()
        ).count()
        total_properties = Property.objects.count()
        available_properties = Property.objects.filter(current_status='available').count()
        avg_days_on_market = Sale.objects.aggregate(a=Avg('days_on_market'))['a'] or 0

        # --- Agent Performance (Top 10 by revenue) ---
        agent_perf = []
        agents = Agent.objects.all().order_by('name')
        for agent in agents:
            sales = Sale.objects.filter(agent=agent)
            rents = Rent.objects.filter(agent=agent)
            rev = sales.aggregate(t=Sum('final_price'))['t'] or 0
            agent_perf.append({
                'name': agent.name,
                'agent_id': agent.agent_id,
                'sales_count': sales.count(),
                'rental_count': rents.count(),
                'revenue': float(rev),
                'rating': float(agent.rating) if agent.rating else 0,
                'achievements': agent.completed_deals,
            })
        agent_perf.sort(key=lambda x: x['revenue'], reverse=True)

        # --- Year-wise Sales Trend ---
        yearly_sales = (
            Sale.objects.annotate(year=ExtractYear('sale_date'))
            .values('year')
            .annotate(count=Count('property'), revenue=Sum('final_price'))
            .order_by('year')
        )
        year_trend = [
            {'year': int(y['year']), 'count': y['count'], 'revenue': float(y['revenue'] or 0)}
            for y in yearly_sales
        ]

        # --- Monthly Revenue (last 12 months / all available data) ---
        monthly_sales = (
            Sale.objects.annotate(
                year=ExtractYear('sale_date'),
                month=ExtractMonth('sale_date')
            )
            .values('year', 'month')
            .annotate(count=Count('property'), revenue=Sum('final_price'))
            .order_by('year', 'month')
        )
        monthly_trend = [
            {
                'year': int(m['year']),
                'month': int(m['month']),
                'count': m['count'],
                'revenue': float(m['revenue'] or 0),
            }
            for m in monthly_sales
        ]

        # --- Property Type Distribution ---
        type_dist = (
            Property.objects.values('type')
            .annotate(count=Count('property_id'))
            .order_by('-count')
        )
        property_types = [
            {'type': t['type'] or 'Unknown', 'count': t['count']}
            for t in type_dist
        ]

        # --- City-wise Breakdown ---
        city_dist = (
            Property.objects.values('city')
            .annotate(
                count=Count('property_id'),
                avg_price=Avg('listed_price')
            )
            .order_by('-count')
        )
        city_breakdown = [
            {'city': c['city'] or 'Unknown', 'count': c['count'], 'avg_price': float(c['avg_price'] or 0)}
            for c in city_dist
        ]

        # --- Property Status Distribution ---
        status_dist = (
            Property.objects.values('current_status')
            .annotate(count=Count('property_id'))
            .order_by('-count')
        )
        status_breakdown = [
            {'status': s['current_status'] or 'Unknown', 'count': s['count']}
            for s in status_dist
        ]

        # --- Recent Transactions (last 10 sales) ---
        recent_sales = Sale.objects.select_related('property', 'buyer', 'agent').order_by('-sale_date')[:10]
        recent = [
            {
                'address': s.property.address if s.property else 'N/A',
                'city': s.property.city if s.property else 'N/A',
                'buyer': s.buyer.name if s.buyer else 'N/A',
                'agent': s.agent.name if s.agent else 'N/A',
                'date': str(s.sale_date),
                'price': float(s.final_price),
                'days_on_market': s.days_on_market,
            }
            for s in recent_sales
        ]

        # --- Price Range Distribution ---
        price_ranges = [
            {'label': 'Under ₹20L', 'min': 0, 'max': 2000000},
            {'label': '₹20L - ₹40L', 'min': 2000000, 'max': 4000000},
            {'label': '₹40L - ₹60L', 'min': 4000000, 'max': 6000000},
            {'label': '₹60L - ₹80L', 'min': 6000000, 'max': 8000000},
            {'label': 'Above ₹80L', 'min': 8000000, 'max': 999999999},
        ]
        price_dist = []
        for pr in price_ranges:
            cnt = Property.objects.filter(listed_price__gte=pr['min'], listed_price__lt=pr['max']).count()
            price_dist.append({'label': pr['label'], 'count': cnt})

        return Response({
            'kpi': {
                'total_revenue': float(total_sales_revenue),
                'total_sales': total_sales_count,
                'avg_deal_size': float(avg_deal_size),
                'active_rents': active_rents,
                'total_properties': total_properties,
                'available_properties': available_properties,
                'avg_days_on_market': round(float(avg_days_on_market), 1),
            },
            'agent_performance': agent_perf[:15],
            'year_trend': year_trend,
            'monthly_trend': monthly_trend,
            'property_types': property_types,
            'city_breakdown': city_breakdown,
            'status_breakdown': status_breakdown,
            'recent_transactions': recent,
            'price_distribution': price_dist,
        })


class RegisterView(APIView):
    permission_classes = [] # Allow anyone to register

    def post(self, request):
        from django.db import transaction
        
        try:
            data = request.data
            role_choice = data.get('role', 'buyer')
            cid = data.get('id')
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            phone = data.get('phone')

            if not all([cid, email, password, name]):
                return Response({'error': 'All fields (ID, Email, Password, Name) are required.'}, status=400)

            with transaction.atomic():
                if User.objects.filter(email=email).exists():
                    return Response({'error': 'Account with this email already exists.'}, status=400)

                # Check for existing ID in specific table
                if role_choice == 'buyer':
                    if Buyer.objects.filter(buyer_id=cid).exists():
                        return Response({'error': f'Buyer ID {cid} is already taken.'}, status=400)
                else:
                    if Tenant.objects.filter(tenant_id=cid).exists():
                        return Response({'error': f'Tenant ID {cid} is already taken.'}, status=400)

                # 1. Create Django User
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    first_name=name.split()[0] if ' ' in name else name,
                    last_name=name.split()[1] if ' ' in name else ''
                )

                # 2. Update UserProfile (Created automatically by signals.py)
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.role = 'customer'
                profile.save()

                # 3. Create record in Buyer/Tenant table
                if role_choice == 'buyer':
                    Buyer.objects.create(
                        buyer_id=cid,
                        name=name,
                        phone=phone,
                        email=email
                    )
                else:
                    Tenant.objects.create(
                        tenant_id=cid,
                        name=name,
                        phone=phone,
                        email=email
                    )

            return Response({'message': 'Registration successful! You can now sign in.'}, status=201)

        except Exception as e:
            # transaction.atomic() handles rollback automatically on exception
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Registration failed: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=400)


# ─── New Workflow Views ───────────────────────────────────────────────────

class PropertyInquiryView(APIView):
    permission_classes = [IsAuthenticated, IsAnyAuthenticatedRole]

    def post(self, request, property_id):
        try:
            prop = Property.objects.get(property_id=property_id)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found.'}, status=404)

        inquiry_type = request.data.get('type') # 'buy_request' or 'rent_request'
        if inquiry_type not in ('buy_request', 'rent_request'):
            return Response({'error': 'Invalid inquiry type.'}, status=400)

        # Create notification for the specific agent
        agent_id = prop.agent.agent_id if prop.agent else None
        
        Notification.objects.create(
            sender_id=request.user.id,
            receiver_id=agent_id,
            property=prop,
            type=inquiry_type,
            message=request.data.get('message', f"Inquiry for {prop.address}")
        )
        return Response({'message': 'Interest successfully registered.'})


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated, IsAnyAuthenticatedRole]

    def get(self, request):
        role = get_user_role(request.user)
        if role == 'agent':
            try:
                agent_id = request.user.profile.agent_id
                qs = Notification.objects.filter(receiver_id=agent_id).order_by('-created_at')
            except:
                qs = Notification.objects.none()
        elif role in ('office', 'admin'):
            # Office sees deal closures
            qs = Notification.objects.filter(type='deal_closed').order_by('-created_at')
        else:
            # Customer sees their own sent notifications
            qs = Notification.objects.filter(sender_id=request.user.id).order_by('-created_at')
        
        return Response(NotificationSerializer(qs, many=True).data)


class ConfirmTransactionView(APIView):
    permission_classes = [IsAuthenticated, IsAgentOrAdmin]

    def post(self, request, notification_id):
        try:
            notif = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=404)

        if notif.status != 'pending':
            return Response({'error': 'This request has already been processed.'}, status=400)

        prop = notif.property
        agent = prop.agent

        from datetime import date
        
        try:
            if notif.type == 'buy_request':
                sender = User.objects.get(id=notif.sender_id)
                buyer_m = Buyer.objects.aggregate(m=Max('buyer_id'))['m'] or 0
                buyer, _ = Buyer.objects.get_or_create(
                    email=sender.email,
                    defaults={'name': sender.get_full_name() or sender.username, 'buyer_id': buyer_m + 1}
                )
                Sale.objects.create(
                    property=prop,
                    buyer=buyer,
                    agent=agent,
                    sale_date=date.today(),
                    final_price=prop.listed_price,
                    days_on_market=30
                )
            elif notif.type == 'rent_request':
                sender = User.objects.get(id=notif.sender_id)
                tenant_m = Tenant.objects.aggregate(m=Max('tenant_id'))['m'] or 0
                tenant, _ = Tenant.objects.get_or_create(
                    email=sender.email,
                    defaults={'name': sender.get_full_name() or sender.username, 'tenant_id': tenant_m + 1}
                )
                Rent.objects.create(
                    property=prop,
                    tenant=tenant,
                    agent=agent,
                    start_date=date.today(),
                    end_date=date.today().replace(year=date.today().year + 1),
                    monthly_rent=prop.listed_price / 100
                )

            # Update Agent Achievement
            agent.completed_deals += 1
            agent.save()

            # Mark notification as approved
            notif.status = 'approved'
            notif.save()

            # Notify Office
            Notification.objects.create(
                sender_id=request.user.id,
                receiver_id=None,
                property=prop,
                type='deal_closed',
                message=f"Transaction finalized for {prop.address} by {agent.name}."
            )

            return Response({'message': 'Transaction finalized and registry updated.'})

        except Exception as e:
            return Response({'error': f"Processing failed: {str(e)}"}, status=500)
