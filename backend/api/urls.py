from django.urls import path
from . import views
from authentication.views import CurrentUserView

urlpatterns = [
    # Current user
    path('current-user/', views.CurrentUserAPIView.as_view(), name='current-user'),

    # Properties
    path('properties/', views.PropertyListView.as_view(), name='property-list'),
    path('properties/meta/', views.PropertyMetaView.as_view(), name='property-meta'),
    path('properties/<int:property_id>/transaction/', views.ConfirmTransactionView.as_view(), name='property-transaction'),
    path('properties/<int:property_id>/inquire/', views.PropertyInquiryView.as_view(), name='property-inquire'),
    path('properties/<int:property_id>/', views.PropertyDetailView.as_view(), name='property-detail'),

    # Agents
    path('agents/', views.AgentListView.as_view(), name='agent-list'),

    # Buyers & Tenants
    path('buyers/', views.BuyerListCreateView.as_view(), name='buyer-list-create'),
    path('tenants/', views.TenantListCreateView.as_view(), name='tenant-list-create'),

    # Sales
    path('sales/', views.SaleCreateView.as_view(), name='sale-create'),
    path('sales/list/', views.SaleListView.as_view(), name='sale-list'),

    # Rents
    path('rents/', views.RentCreateView.as_view(), name='rent-create'),
    path('rents/list/', views.RentListView.as_view(), name='rent-list'),
    path('rents/check-overlap/', views.RentOverlapCheckView.as_view(), name='rent-overlap'),

    # Reports (office/admin)
    path('sales-report/', views.SalesReportView.as_view(), name='sales-report'),
    path('rental-report/', views.RentalReportView.as_view(), name='rental-report'),

    # Agent self-service
    path('my-transactions/', views.AgentMyTransactionsView.as_view(), name='my-transactions'),

    # Analytics
    path('analytics/', views.AnalyticsView.as_view(), name='analytics'),

    # Admin
    path('admin/sql/', views.AdminSQLView.as_view(), name='admin-sql'),
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('admin/tables/<str:table_name>/', views.AdminTableView.as_view(), name='admin-table'),
    path('admin/users/', views.AdminUserListCreateView.as_view(), name='admin-user-list'),
    path('admin/users/<int:user_id>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),

    # Notifications & Workflows
    path('register/', views.RegisterView.as_view(), name='register'),
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/confirm/', views.ConfirmTransactionView.as_view(), name='notification-confirm'),
]
