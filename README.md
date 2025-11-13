# RouteLink - Trucking Booking System

A complete trucking booking system with three user roles: Admin, User (Customer), and Driver.

## Features

- **User Authentication**: Login and registration system
- **Role-Based Access**: Three distinct user types with different dashboards
- **Booking Management**: Users can create bookings, admins can assign drivers, drivers can update status
- **Admin Dashboard**: View all bookings, manage drivers, assign bookings to drivers
- **User Dashboard**: Create new bookings and view booking history
- **Driver Dashboard**: View assigned bookings and update delivery status

## Default Admin Account

**Email:** admin@routelink.com  
**Password:** admin123

⚠️ **Note:** Only one admin account exists. New admin accounts cannot be created through registration.

## Getting Started

1. Open `index.html` in your web browser
2. Login with the admin credentials above, or register a new user/driver account
3. Navigate through the system based on your role

## User Roles

### Admin
- View all bookings and statistics
- Assign drivers to pending bookings
- Manage booking statuses
- View all registered drivers and users

### User (Customer)
- Create new trucking bookings
- View personal booking history
- Track booking status

### Driver
- View assigned bookings
- Update booking status (Start Trip, Complete Delivery)
- View booking details and customer information

## Booking Status Flow

1. **Pending** - Booking created, awaiting driver assignment
2. **Assigned** - Driver assigned by admin
3. **In-Transit** - Driver has started the trip
4. **Completed** - Delivery completed

## Technical Details

- **Storage**: Uses browser localStorage (data persists in browser)
- **No Backend Required**: Fully client-side application
- **Responsive Design**: Works on desktop and mobile devices

## File Structure

- `index.html` - Login page
- `register.html` - Registration page
- `admin.html` - Admin dashboard
- `user.html` - User dashboard
- `driver.html` - Driver dashboard
- `app.js` - Main application logic
- `styles.css` - Styling

## Usage Instructions

1. **For Admin:**
   - Login with admin credentials
   - View all bookings in the dashboard
   - Assign drivers to pending bookings
   - Monitor system statistics

2. **For Users:**
   - Register a new account (select "User" role)
   - Login and create bookings
   - Fill in pickup location, destination, date, cargo details
   - View booking status

3. **For Drivers:**
   - Register a new account (select "Driver" role)
   - Provide driver license number
   - Login to view assigned bookings
   - Update booking status as you progress

## Notes

- All data is stored in browser localStorage
- Clear browser data will reset all information
- For production use, consider implementing a backend database

