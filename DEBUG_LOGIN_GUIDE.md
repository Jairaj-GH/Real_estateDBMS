# 🚀 Real Estate Login Debug & Setup Guide

## Problem
Your login page shows mock values but "Invalid user password" error because demo users aren't in the database yet.

## Solution - 3 Steps

### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run Database Migrations
```bash
# Still in backend folder
python manage.py migrate
```

### Step 3: Create Demo Users
```bash
# Option A: Using the seeding script
python setup_demo.py

# Option B: Using Django management command
python manage.py seed_users
```

## ✅ Available Demo Accounts
After setup, these accounts will work:

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| 🏢 Office| office@realestate.com  | office123    |
| 🤝 Agent | agent1@realestate.com  | agent123     |
| 🏠 Customer | buyer1@example.com  | customer123  |
| 👨‍💼 Admin | admin@realestate.com   | admin123     |

## How to Use
1. Run `npm run dev` in the frontend folder
2. Click any **demo account button** (now with ⚡ icon)
3. **Instant sign-in!** No need to fill forms manually

## Changes Made to Frontend

### Before:
- Demo buttons just filled the form fields
- Required 2 clicks: fill + sign in
- Confusing UX

### After:
- Demo buttons **auto-login directly** 🎯
- **Single click instant sign-in** ⚡
- Better error messages if users don't exist
- Visual feedback with loading state

## Troubleshooting

### "ModuleNotFoundError: No module named 'django'"
```bash
# Make sure you're in the backend folder
cd backend
pip install -r requirements.txt
```

### Database connection error
Check `backend/real_estate_project/settings.py`:
- Verify MySQL is running
- Check DB_NAME, DB_USER, DB_PASSWORD, DB_HOST in your `.env` file (or set defaults in settings.py)

### "Invalid email or password" even after setup
- Run `python manage.py seed_users` again to check status
- Clear browser localStorage: DevTools → Application → Storage → Clear All
- Refresh the page and try again

## For Future Development

Your authentication system is set up with:
- ✅ JWT tokens (access + refresh)
- ✅ Role-based access (office, agent, customer, admin)
- ✅ Email login support
- ✅ Automatic token refresh on 401 errors

Enjoy your demo! 🎉
