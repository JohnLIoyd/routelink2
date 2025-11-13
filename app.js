// Initialize default admin account
const DEFAULT_ADMIN = {
    email: 'admin@routelink.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin'
};

// Initialize localStorage data if not exists
function initializeStorage() {
    if (!localStorage.getItem('users')) {
        const users = [DEFAULT_ADMIN];
        localStorage.setItem('users', JSON.stringify(users));
    }
    if (!localStorage.getItem('bookings')) {
        localStorage.setItem('bookings', JSON.stringify([]));
    }
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }
}

// Get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Get bookings from localStorage
function getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
}

// Save bookings to localStorage
function saveBookings(bookings) {
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Set current user
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Logout function
function logout() {
    setCurrentUser(null);
    window.location.href = 'index.html';
}

// Check authentication and redirect
function checkAuth() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!currentUser && currentPage !== 'index.html' && currentPage !== 'register.html') {
        window.location.href = 'index.html';
        return false;
    }
    
    if (currentUser) {
        const role = currentUser.role;
        if (role === 'admin' && currentPage !== 'admin.html') {
            window.location.href = 'admin.html';
            return false;
        } else if (role === 'user' && currentPage !== 'user.html') {
            window.location.href = 'user.html';
            return false;
        } else if (role === 'driver' && currentPage !== 'driver.html') {
            window.location.href = 'driver.html';
            return false;
        }
    }
    
    return true;
}

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                setCurrentUser(user);
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else if (user.role === 'user') {
                    window.location.href = 'user.html';
                } else if (user.role === 'driver') {
                    window.location.href = 'driver.html';
                }
            } else {
                errorMessage.textContent = 'Invalid email or password';
                errorMessage.style.display = 'block';
            }
        });
    }
    
    // Register functionality
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const roleSelect = document.getElementById('role');
        const licenseGroup = document.getElementById('licenseGroup');
        
        roleSelect.addEventListener('change', function() {
            if (this.value === 'driver') {
                licenseGroup.style.display = 'block';
                document.getElementById('license').required = true;
            } else {
                licenseGroup.style.display = 'none';
                document.getElementById('license').required = false;
            }
        });
        
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const license = document.getElementById('license').value;
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            
            const users = getUsers();
            
            // Check if email already exists
            if (users.find(u => u.email === email)) {
                errorMessage.textContent = 'Email already registered';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
                return;
            }
            
            // Prevent admin registration
            if (role === 'admin') {
                errorMessage.textContent = 'Admin accounts cannot be created';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
                return;
            }
            
            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                role,
                license: role === 'driver' ? license : null
            };
            
            users.push(newUser);
            saveUsers(users);
            
            successMessage.textContent = 'Registration successful! Redirecting to login...';
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
    }
    
    // Admin Dashboard
    if (window.location.pathname.includes('admin.html')) {
        if (!checkAuth()) return;
        
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role === 'admin') {
            document.getElementById('adminName').textContent = currentUser.name;
            loadAdminDashboard();
            setupProfileHandlers();
        }
    }
    
    // User Dashboard
    if (window.location.pathname.includes('user.html')) {
        if (!checkAuth()) return;
        
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role === 'user') {
            document.getElementById('userName').textContent = currentUser.name;
            initializeTrucks();
            loadTrucks();
            loadUserDashboard();
            setupProfileHandlers();
            
            const bookingForm = document.getElementById('bookingForm');
            if (bookingForm) {
                bookingForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    createBooking();
                });
            }
        }
    }
    
    // Driver Dashboard
    if (window.location.pathname.includes('driver.html')) {
        if (!checkAuth()) return;
        
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role === 'driver') {
            document.getElementById('driverName').textContent = currentUser.name;
            loadDriverDashboard();
            setupProfileHandlers();
        }
    }
});

// Profile Functions
function showProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Hide dashboard elements
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) statsGrid.style.display = 'none';
    
    const bookingFormCard = document.querySelector('.booking-form-card');
    if (bookingFormCard) bookingFormCard.style.display = 'none';
    
    const dashboardTitle = document.querySelector('.dashboard h1');
    if (dashboardTitle) dashboardTitle.style.display = 'none';
    
    // Hide other sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        if (section.id !== 'profileSection') {
            section.style.display = 'none';
        }
    });
    
    // Show profile section
    const profileSection = document.getElementById('profileSection');
    if (profileSection) {
        profileSection.style.display = 'block';
        loadProfileData();
    }
}

function hideProfile() {
    const profileSection = document.getElementById('profileSection');
    if (profileSection) {
        profileSection.style.display = 'none';
    }
    
    // Show dashboard elements
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) statsGrid.style.display = 'grid';
    
    const bookingFormCard = document.querySelector('.booking-form-card');
    if (bookingFormCard) bookingFormCard.style.display = 'block';
    
    const dashboardTitle = document.querySelector('.dashboard h1');
    if (dashboardTitle) dashboardTitle.style.display = 'block';
    
    // Show other sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        if (section.id !== 'profileSection') {
            section.style.display = 'block';
        }
    });
    
    // Reload dashboard based on role
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (currentUser.role === 'admin') {
            loadAdminDashboard();
        } else if (currentUser.role === 'user') {
            loadUserDashboard();
        } else if (currentUser.role === 'driver') {
            loadDriverDashboard();
        }
    }
}

// Global variable to store image data
let profileImageData = null;

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        event.target.value = '';
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        profileImageData = e.target.result;
        
        // Show preview
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `
            <img src="${profileImageData}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #667eea;">
            <p style="color: #28a745; margin-top: 5px; font-size: 14px;">✓ Image selected. Click "Update Profile" to save.</p>
        `;
        
        // Update avatar preview
        const profileImage = document.getElementById('profileImage');
        const profileInitials = document.getElementById('profileInitials');
        if (profileImage) {
            profileImage.src = profileImageData;
            profileImage.style.display = 'block';
            profileInitials.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

function loadProfileData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Get initials for avatar
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    // Set profile header
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    
    // Display profile image or initials
    const profileImage = document.getElementById('profileImage');
    const profileInitials = document.getElementById('profileInitials');
    
    if (currentUser.profileImage) {
        profileImage.src = currentUser.profileImage;
        profileImage.style.display = 'block';
        profileInitials.style.display = 'none';
    } else {
        profileInitials.textContent = initials;
        profileInitials.style.display = 'block';
        profileImage.style.display = 'none';
    }
    
    // Reset image data
    profileImageData = null;
    const imageInput = document.getElementById('profileImageInput');
    if (imageInput) {
        imageInput.value = '';
    }
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.innerHTML = '';
    }
    
    // Set form values
    document.getElementById('profileNameInput').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profileRoleInput').value = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    
    // Driver specific field
    const licenseField = document.getElementById('profileLicense');
    if (licenseField) {
        licenseField.value = currentUser.license || '';
    }
}

function setupProfileHandlers() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
}

function updateProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const users = getUsers();
    const user = users.find(u => u.id === currentUser.id || u.email === currentUser.email);
    
    if (!user) return;
    
    const newName = document.getElementById('profileNameInput').value;
    const newEmail = document.getElementById('profileEmail').value;
    
    // Check if email is already taken by another user
    const emailExists = users.find(u => u.email === newEmail && (u.id !== user.id && u.email !== currentUser.email));
    if (emailExists) {
        document.getElementById('profileSuccess').textContent = 'Email already in use by another account';
        document.getElementById('profileSuccess').style.display = 'block';
        document.getElementById('profileSuccess').style.color = '#dc3545';
        return;
    }
    
    // Update user data
    user.name = newName;
    user.email = newEmail;
    
    // Update profile image if a new one was uploaded
    if (profileImageData) {
        user.profileImage = profileImageData;
    }
    
    // Update driver license if applicable
    const licenseField = document.getElementById('profileLicense');
    if (licenseField && user.role === 'driver') {
        user.license = licenseField.value;
    }
    
    saveUsers(users);
    
    // Update current user session
    const updatedUser = { ...currentUser, name: newName, email: newEmail };
    if (profileImageData) {
        updatedUser.profileImage = profileImageData;
    }
    if (licenseField && user.role === 'driver') {
        updatedUser.license = licenseField.value;
    }
    setCurrentUser(updatedUser);
    
    // Update navbar name
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'admin.html') {
        document.getElementById('adminName').textContent = newName;
    } else if (currentPage === 'user.html') {
        document.getElementById('userName').textContent = newName;
    } else if (currentPage === 'driver.html') {
        document.getElementById('driverName').textContent = newName;
    }
    
    // Clear image data after saving
    if (profileImageData) {
        profileImageData = null;
    }
    
    // Reload profile data
    loadProfileData();
    
    // Show success message
    document.getElementById('profileSuccess').textContent = 'Profile updated successfully!';
    document.getElementById('profileSuccess').style.display = 'block';
    document.getElementById('profileSuccess').style.color = '#28a745';
    
    setTimeout(() => {
        document.getElementById('profileSuccess').style.display = 'none';
    }, 3000);
}

function changePassword() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const users = getUsers();
    const user = users.find(u => u.id === currentUser.id || u.email === currentUser.email);
    
    if (!user) return;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const passwordError = document.getElementById('passwordError');
    const passwordSuccess = document.getElementById('passwordSuccess');
    
    // Hide previous messages
    passwordError.style.display = 'none';
    passwordSuccess.style.display = 'none';
    
    // Validate current password
    if (user.password !== currentPassword) {
        passwordError.textContent = 'Current password is incorrect';
        passwordError.style.display = 'block';
        return;
    }
    
    // Validate new password match
    if (newPassword !== confirmPassword) {
        passwordError.textContent = 'New passwords do not match';
        passwordError.style.display = 'block';
        return;
    }
    
    // Validate password length
    if (newPassword.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        passwordError.style.display = 'block';
        return;
    }
    
    // Update password
    user.password = newPassword;
    saveUsers(users);
    
    // Update current user session
    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    
    // Show success message
    passwordSuccess.textContent = 'Password changed successfully!';
    passwordSuccess.style.display = 'block';
    
    // Clear form
    document.getElementById('passwordForm').reset();
    
    setTimeout(() => {
        passwordSuccess.style.display = 'none';
    }, 3000);
}

// Load Admin Dashboard
function loadAdminDashboard() {
    const bookings = getBookings();
    const users = getUsers();
    const drivers = users.filter(u => u.role === 'driver');
    const regularUsers = users.filter(u => u.role === 'user');
    
    // Update summary cards
    const totalUsersEl = document.getElementById('totalUsers');
    const activeDriversEl = document.getElementById('activeDrivers');
    const totalBookingsEl = document.getElementById('totalBookings');
    
    if (totalUsersEl) totalUsersEl.textContent = regularUsers.length;
    if (activeDriversEl) activeDriversEl.textContent = drivers.length;
    if (totalBookingsEl) totalBookingsEl.textContent = bookings.length;
    
    // Load bookings table
    const bookingsBody = document.getElementById('bookingsBody');
    if (bookingsBody) {
        bookingsBody.innerHTML = '';
        
        bookings.forEach((booking, index) => {
            const row = document.createElement('tr');
            const user = users.find(u => u.id === booking.userId);
            const phone = user ? (user.phone || 'N/A') : 'N/A';
            const vehicleType = booking.cargoType || 'General';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${booking.customerName}</td>
                <td>${phone}</td>
                <td>${vehicleType}</td>
                <td>${booking.pickupLocation}</td>
                <td>${booking.destination}</td>
                <td>${booking.pickupDate}</td>
                <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                <td>
                    ${booking.status === 'pending' || booking.status === 'draft' ? `<button onclick="assignDriver(${booking.id})" class="btn btn-sm">Assign</button>` : ''}
                    ${booking.status === 'assigned' ? `<button onclick="updateBookingStatus(${booking.id}, 'in-transit')" class="btn btn-sm">Start</button>` : ''}
                    ${booking.status === 'in-transit' ? `<button onclick="updateBookingStatus(${booking.id}, 'completed')" class="btn btn-sm">Complete</button>` : ''}
                </td>
            `;
            bookingsBody.appendChild(row);
        });
        
        // Update table info
        const tableInfo = document.getElementById('tableInfo');
        if (tableInfo) {
            tableInfo.textContent = `Showing 1 to ${bookings.length} of ${bookings.length} entries`;
        }
    }
    
    // Load drivers table
    const driversBody = document.getElementById('driversBody');
    if (driversBody) {
        driversBody.innerHTML = '';
        
        drivers.forEach(driver => {
            const assignedCount = bookings.filter(b => b.driverId === driver.id && b.status !== 'completed').length;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${driver.name}</td>
                <td>${driver.email}</td>
                <td>${driver.license || 'N/A'}</td>
                <td><span class="status-badge ${assignedCount > 0 ? 'status-assigned' : 'status-available'}">${assignedCount > 0 ? 'Busy' : 'Available'}</span></td>
                <td>
                    <button onclick="viewDriverBookings(${driver.id})" class="btn btn-sm">View</button>
                </td>
            `;
            driversBody.appendChild(row);
        });
    }
}

// Admin Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleUserMenu(event) {
    event.stopPropagation();
    const userMenu = event.currentTarget.closest('.user-menu');
    userMenu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.user-menu')) {
        document.querySelectorAll('.user-menu').forEach(menu => menu.classList.remove('active'));
    }
});

function showDashboard() {
    setActiveNav('Dashboard');
    document.getElementById('currentPage').textContent = 'Overview';
    document.getElementById('bookingsSection').style.display = 'block';
    document.getElementById('driversSection').style.display = 'none';
    document.getElementById('summaryCards').style.display = 'grid';
    loadAdminDashboard();
}

function showUsers() {
    setActiveNav('Users');
    document.getElementById('currentPage').textContent = 'Users';
    document.getElementById('bookingsSection').style.display = 'none';
    document.getElementById('driversSection').style.display = 'none';
    document.getElementById('summaryCards').style.display = 'grid';
}

function showDrivers() {
    setActiveNav('Drivers');
    document.getElementById('currentPage').textContent = 'Drivers';
    document.getElementById('bookingsSection').style.display = 'none';
    document.getElementById('driversSection').style.display = 'block';
    document.getElementById('summaryCards').style.display = 'grid';
    loadAdminDashboard();
}

function showVehicles() {
    setActiveNav('Vehicles');
    document.getElementById('currentPage').textContent = 'Vehicles';
    document.getElementById('bookingsSection').style.display = 'none';
    document.getElementById('driversSection').style.display = 'none';
    document.getElementById('summaryCards').style.display = 'grid';
}

function showBookings() {
    setActiveNav('Bookings');
    document.getElementById('currentPage').textContent = 'Bookings';
    document.getElementById('bookingsSection').style.display = 'block';
    document.getElementById('driversSection').style.display = 'none';
    document.getElementById('summaryCards').style.display = 'grid';
    loadAdminDashboard();
}

function setActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.trim() === page) {
            link.classList.add('active');
        }
    });
}

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('bookingsTable');
    const tr = table.getElementsByTagName('tr');
    
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        let found = false;
        for (let j = 0; j < td.length; j++) {
            if (td[j]) {
                const txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        tr[i].style.display = found ? '' : 'none';
    }
}

function previousPage() {
    // Pagination logic
}

function nextPage() {
    // Pagination logic
}

// Assign driver to booking
function assignDriver(bookingId) {
    const bookings = getBookings();
    const users = getUsers();
    const drivers = users.filter(u => u.role === 'driver');
    
    const driverNames = drivers.map(d => d.name);
    const selectedDriver = prompt(`Select driver:\n${drivers.map((d, i) => `${i + 1}. ${d.name}`).join('\n')}\n\nEnter driver number:`);
    
    if (selectedDriver) {
        const driverIndex = parseInt(selectedDriver) - 1;
        if (driverIndex >= 0 && driverIndex < drivers.length) {
            const driver = drivers[driverIndex];
            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.driverId = driver.id;
                booking.driverName = driver.name;
                booking.status = 'assigned';
                saveBookings(bookings);
                loadAdminDashboard();
            }
        }
    }
}

// Update booking status
function updateBookingStatus(bookingId, newStatus) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        saveBookings(bookings);
        loadAdminDashboard();
    }
}

// Load User Dashboard
function loadUserDashboard() {
    const currentUser = getCurrentUser();
    const bookings = getBookings().filter(b => b.userId === currentUser.id);
    
    const bookingsContainer = document.getElementById('userBookings');
    bookingsContainer.innerHTML = '';
    
    if (bookings.length === 0) {
        bookingsContainer.innerHTML = '<p>No bookings yet. Create your first booking above!</p>';
        return;
    }
    
    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <div class="booking-header">
                <h3>Booking #${booking.id}</h3>
                <span class="status-badge status-${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><strong>From:</strong> ${booking.pickupLocation}</p>
                <p><strong>To:</strong> ${booking.destination}</p>
                <p><strong>Date:</strong> ${booking.pickupDate} at ${booking.pickupTime}</p>
                <p><strong>Cargo:</strong> ${booking.cargoType} (${booking.cargoWeight} kg)</p>
                ${booking.driverName ? `<p><strong>Driver:</strong> ${booking.driverName}</p>` : '<p><strong>Driver:</strong> Awaiting assignment</p>'}
                ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
            </div>
        `;
        bookingsContainer.appendChild(card);
    });
}

// Create booking
function createBooking() {
    const currentUser = getCurrentUser();
    const bookings = getBookings();
    
    // Check if editing existing order
    if (window.editingOrderId) {
        updateBooking(window.editingOrderId);
        return;
    }
    
    const newBooking = {
        id: Date.now(),
        userId: currentUser.id,
        customerName: currentUser.name,
        pickupLocation: document.getElementById('pickupLocation').value,
        destination: document.getElementById('destination').value,
        pickupDate: document.getElementById('pickupDate').value,
        pickupTime: document.getElementById('pickupTime').value,
        cargoType: document.getElementById('cargoType').value,
        cargoWeight: document.getElementById('cargoWeight').value,
        notes: document.getElementById('notes').value,
        status: 'draft',
        driverId: null,
        driverName: null
    };
    
    bookings.push(newBooking);
    saveBookings(bookings);
    
    // Reset form
    document.getElementById('bookingForm').reset();
    window.editingOrderId = null;
    
    // Hide form and show main content
    hideNewOrderForm();
    
    // Reload dashboard
    loadUserDashboard();
    
    alert('Order created successfully!');
}

// Load Driver Dashboard
function loadDriverDashboard() {
    const currentUser = getCurrentUser();
    const bookings = getBookings().filter(b => b.driverId === currentUser.id);
    
    // Update stats
    document.getElementById('assignedBookings').textContent = bookings.filter(b => b.status !== 'completed').length;
    document.getElementById('completedBookings').textContent = bookings.filter(b => b.status === 'completed').length;
    
    const bookingsContainer = document.getElementById('driverBookings');
    bookingsContainer.innerHTML = '';
    
    const activeBookings = bookings.filter(b => b.status !== 'completed');
    
    if (activeBookings.length === 0) {
        bookingsContainer.innerHTML = '<p>No assigned bookings at the moment.</p>';
        return;
    }
    
    activeBookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <div class="booking-header">
                <h3>Booking #${booking.id}</h3>
                <span class="status-badge status-${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><strong>Customer:</strong> ${booking.customerName}</p>
                <p><strong>From:</strong> ${booking.pickupLocation}</p>
                <p><strong>To:</strong> ${booking.destination}</p>
                <p><strong>Date:</strong> ${booking.pickupDate} at ${booking.pickupTime}</p>
                <p><strong>Cargo:</strong> ${booking.cargoType} (${booking.cargoWeight} kg)</p>
                ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                ${booking.status === 'assigned' ? `<button onclick="updateDriverBookingStatus(${booking.id}, 'in-transit')" class="btn btn-primary">Start Trip</button>` : ''}
                ${booking.status === 'in-transit' ? `<button onclick="updateDriverBookingStatus(${booking.id}, 'completed')" class="btn btn-success">Complete Delivery</button>` : ''}
            </div>
        `;
        bookingsContainer.appendChild(card);
    });
}

// Update booking status from driver dashboard
function updateDriverBookingStatus(bookingId, newStatus) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        saveBookings(bookings);
        loadDriverDashboard();
    }
}

// Initialize trucks data
function initializeTrucks() {
    if (!localStorage.getItem('trucks')) {
        const trucks = [
            { id: 1, name: 'Small Truck', capacity: '1-3 tons', price: 500, available: true, type: 'Small' },
            { id: 2, name: 'Medium Truck', capacity: '4-7 tons', price: 800, available: true, type: 'Medium' },
            { id: 3, name: 'Large Truck', capacity: '8-15 tons', price: 1200, available: true, type: 'Large' },
            { id: 4, name: 'Extra Large Truck', capacity: '16+ tons', price: 1800, available: false, type: 'XL' },
            { id: 5, name: 'Refrigerated Truck', capacity: '5-10 tons', price: 1500, available: true, type: 'Refrigerated' }
        ];
        localStorage.setItem('trucks', JSON.stringify(trucks));
    }
}

// Load trucks
function loadTrucks() {
    const trucksGrid = document.getElementById('trucksGrid');
    if (!trucksGrid) return;
    
    const trucks = JSON.parse(localStorage.getItem('trucks') || '[]');
    trucksGrid.innerHTML = '';
    
    trucks.forEach(truck => {
        const card = document.createElement('div');
        card.className = `truck-card ${truck.available ? 'available' : 'unavailable'}`;
        card.innerHTML = `
            <div class="truck-header">
                <h3 class="truck-name">${truck.name}</h3>
                <span class="truck-status ${truck.available ? 'available' : 'unavailable'}">
                    ${truck.available ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <div class="truck-details">
                <p><strong>Type:</strong> ${truck.type}</p>
                <p><strong>Capacity:</strong> ${truck.capacity}</p>
            </div>
            <div class="truck-price">
                $${truck.price.toLocaleString()}
                <span>per trip</span>
            </div>
        `;
        trucksGrid.appendChild(card);
    });
}

// Dropdown toggle
function toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = event.currentTarget.closest('.dropdown');
    const allDropdowns = document.querySelectorAll('.dropdown');
    
    allDropdowns.forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('active');
        }
    });
    
    dropdown.classList.toggle('active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
    }
});

// Orders filtering
let currentOrderFilter = 'all';

function filterOrders(filter) {
    currentOrderFilter = filter;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim().toLowerCase() === filter || 
            (filter === 'all' && btn.textContent.trim().toLowerCase() === 'all')) {
            btn.classList.add('active');
        }
    });
    
    loadUserDashboard();
}

// Show/Hide New Order Form
function showNewOrderForm() {
    document.getElementById('newOrderSection').style.display = 'block';
    document.querySelector('.trucks-section').style.display = 'none';
    document.querySelector('.orders-section').style.display = 'none';
    document.querySelector('.track-driver-section').style.display = 'none';
    
    // Update form title if editing
    const formTitle = document.querySelector('#newOrderSection h2');
    if (window.editingOrderId) {
        formTitle.textContent = 'Edit Order';
    } else {
        formTitle.textContent = 'Create New Order';
        // Reset form
        document.getElementById('bookingForm').reset();
    }
}

function hideNewOrderForm() {
    document.getElementById('newOrderSection').style.display = 'none';
    document.querySelector('.trucks-section').style.display = 'block';
    document.querySelector('.orders-section').style.display = 'block';
    document.querySelector('.track-driver-section').style.display = 'block';
    window.editingOrderId = null;
    document.getElementById('bookingForm').reset();
}

// Settings functions
function showSettings() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'admin.html') {
        setActiveNav('Settings');
        document.getElementById('currentPage').textContent = 'Settings';
        document.getElementById('bookingsSection').style.display = 'none';
        document.getElementById('driversSection').style.display = 'none';
        document.getElementById('messagesSection').style.display = 'none';
        document.getElementById('mapSection').style.display = 'none';
        document.getElementById('summaryCards').style.display = 'none';
        const settingsSection = document.getElementById('settingsSection');
        if (settingsSection) {
            settingsSection.style.display = 'block';
        }
    } else {
        hideAllSections();
        document.getElementById('settingsSection').style.display = 'block';
        closeDropdowns();
    }
}

function hideSettings() {
    document.getElementById('settingsSection').style.display = 'none';
    showMainContent();
}

// Contact Us functions
function showContactUs() {
    hideAllSections();
    document.getElementById('contactSection').style.display = 'block';
    closeDropdowns();
}

function hideContactUs() {
    document.getElementById('contactSection').style.display = 'none';
    showMainContent();
}

// Messages functions
function showMessages() {
    setActiveNav('Messages');
    document.getElementById('currentPage').textContent = 'Messages';
    document.getElementById('bookingsSection').style.display = 'none';
    document.getElementById('driversSection').style.display = 'none';
    document.getElementById('summaryCards').style.display = 'none';
    const messagesSection = document.getElementById('messagesSection');
    if (messagesSection) {
        messagesSection.style.display = 'block';
        loadMessages();
    }
}

function hideMessages() {
    document.getElementById('messagesSection').style.display = 'none';
    showMainContent();
}

function loadMessages() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    messagesList.innerHTML = '<p>No messages yet.</p>';
}

// Map functions
function showMap() {
    setActiveNav('Track Drivers');
    document.getElementById('currentPage').textContent = 'Track Drivers';
    document.getElementById('bookingsSection').style.display = 'none';
    document.getElementById('driversSection').style.display = 'none';
    document.getElementById('summaryCards').style.display = 'none';
    const mapSection = document.getElementById('mapSection');
    if (mapSection) {
        mapSection.style.display = 'block';
        initializeMap();
    }
}

function hideMap() {
    document.getElementById('mapSection').style.display = 'none';
    showMainContent();
}

function initializeMap() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    
    // Simple map placeholder - in production, integrate with Google Maps or Leaflet
    mapDiv.innerHTML = `
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
            <div style="text-align: center;">
                <p style="margin-bottom: 10px;">📍 Map View</p>
                <p style="font-size: 14px; opacity: 0.9;">Driver tracking will be displayed here</p>
            </div>
        </div>
    `;
}

// Helper functions
function hideAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    const trucksSection = document.querySelector('.trucks-section');
    const ordersSection = document.querySelector('.orders-section');
    const trackDriverSection = document.querySelector('.track-driver-section');
    if (trucksSection) trucksSection.style.display = 'none';
    if (ordersSection) ordersSection.style.display = 'none';
    if (trackDriverSection) trackDriverSection.style.display = 'none';
}

// Show track driver section
function showTrackDriver() {
    hideAllSections();
    const trackDriverSection = document.querySelector('.track-driver-section');
    if (trackDriverSection) {
        trackDriverSection.style.display = 'block';
    }
    closeDropdowns();
}

function showMainContent() {
    const trucksSection = document.querySelector('.trucks-section');
    const ordersSection = document.querySelector('.orders-section');
    const trackDriverSection = document.querySelector('.track-driver-section');
    if (trucksSection) trucksSection.style.display = 'block';
    if (ordersSection) ordersSection.style.display = 'block';
    if (trackDriverSection) trackDriverSection.style.display = 'block';
}

function closeDropdowns() {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
}

function closeDropdown() {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
}

// Update loadUserDashboard to use orders and filtering
function loadUserDashboard() {
    const currentUser = getCurrentUser();
    const bookings = getBookings().filter(b => b.userId === currentUser.id);
    
    // Filter bookings based on current filter
    let filteredBookings = bookings;
    if (currentOrderFilter === 'approval') {
        filteredBookings = bookings.filter(b => b.status === 'pending' || b.status === 'assigned');
    } else if (currentOrderFilter === 'completed') {
        filteredBookings = bookings.filter(b => b.status === 'completed');
    } else if (currentOrderFilter === 'cancelled') {
        filteredBookings = bookings.filter(b => b.status === 'cancelled');
    } else if (currentOrderFilter === 'draft') {
        filteredBookings = bookings.filter(b => b.status === 'draft');
    }
    
    // Apply search filter if exists
    const searchInput = document.getElementById('ordersSearchInput');
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredBookings = filteredBookings.filter(b => 
            b.pickupLocation.toLowerCase().includes(searchTerm) ||
            b.destination.toLowerCase().includes(searchTerm) ||
            b.cargoType.toLowerCase().includes(searchTerm) ||
            (b.driverName && b.driverName.toLowerCase().includes(searchTerm)) ||
            b.id.toString().includes(searchTerm)
        );
    }
    
    const bookingsContainer = document.getElementById('userBookings');
    if (!bookingsContainer) return;
    
    bookingsContainer.innerHTML = '';
    
    if (filteredBookings.length === 0) {
        bookingsContainer.innerHTML = '<p>No orders found.</p>';
        return;
    }
    
    filteredBookings.forEach(booking => {
        const statusClass = booking.status === 'pending' || booking.status === 'assigned' ? 'approval' : 
                           booking.status === 'completed' ? 'completed' : 
                           booking.status === 'cancelled' ? 'cancelled' : 'draft';
        
        const card = document.createElement('div');
        card.className = `order-card status-${statusClass}`;
        card.innerHTML = `
            <div class="order-card-content">
                <div class="booking-header">
                    <h3>Order #${booking.id}</h3>
                    <span class="status-badge status-${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <p><strong>From:</strong> ${booking.pickupLocation}</p>
                    <p><strong>To:</strong> ${booking.destination}</p>
                    <p><strong>Date:</strong> ${booking.pickupDate} at ${booking.pickupTime}</p>
                    <p><strong>Cargo:</strong> ${booking.cargoType} (${booking.cargoWeight} kg)</p>
                    ${booking.driverName ? `<p><strong>Driver:</strong> ${booking.driverName}</p>` : '<p><strong>Driver:</strong> Awaiting assignment</p>'}
                    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                </div>
            </div>
            <div class="order-card-actions">
                <button onclick="editOrder(${booking.id})" class="btn-action btn-edit" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                    </svg>
                </button>
                <button onclick="deleteOrder(${booking.id})" class="btn-action btn-delete" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </div>
        `;
        bookingsContainer.appendChild(card);
    });
}

// Filter orders by search
function filterOrdersSearch() {
    loadUserDashboard();
}

// Filter track driver
function filterTrackDriver() {
    const searchInput = document.getElementById('trackDriverSearchInput');
    if (!searchInput) return;
    // Placeholder for track driver search functionality
    console.log('Searching for driver:', searchInput.value);
}

// Edit order
function editOrder(orderId) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === orderId);
    if (!booking) return;
    
    // Populate form with booking data
    document.getElementById('pickupLocation').value = booking.pickupLocation;
    document.getElementById('destination').value = booking.destination;
    document.getElementById('pickupDate').value = booking.pickupDate;
    document.getElementById('pickupTime').value = booking.pickupTime;
    document.getElementById('cargoType').value = booking.cargoType;
    document.getElementById('cargoWeight').value = booking.cargoWeight;
    document.getElementById('notes').value = booking.notes || '';
    
    // Store editing order ID
    window.editingOrderId = orderId;
    
    // Show form
    showNewOrderForm();
}

// Update booking
function updateBooking(orderId) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === orderId);
    if (!booking) return;
    
    booking.pickupLocation = document.getElementById('pickupLocation').value;
    booking.destination = document.getElementById('destination').value;
    booking.pickupDate = document.getElementById('pickupDate').value;
    booking.pickupTime = document.getElementById('pickupTime').value;
    booking.cargoType = document.getElementById('cargoType').value;
    booking.cargoWeight = document.getElementById('cargoWeight').value;
    booking.notes = document.getElementById('notes').value;
    
    saveBookings(bookings);
    
    // Reset form
    document.getElementById('bookingForm').reset();
    window.editingOrderId = null;
    
    hideNewOrderForm();
    loadUserDashboard();
    alert('Order updated successfully!');
}

// Delete order
function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    const bookings = getBookings();
    const filteredBookings = bookings.filter(b => b.id !== orderId);
    saveBookings(filteredBookings);
    loadUserDashboard();
    alert('Order deleted successfully!');
}

// Show Home
function showHome() {
    hideAllSections();
    document.querySelector('.trucks-section').style.display = 'block';
    document.querySelector('.track-driver-section').style.display = 'block';
    document.querySelector('.orders-section').style.display = 'block';
    closeDropdowns();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show Available Trucks
function showAvailableTrucks() {
    hideAllSections();
    document.querySelector('.trucks-section').style.display = 'block';
    document.querySelector('.track-driver-section').style.display = 'block';
    document.querySelector('.orders-section').style.display = 'block';
    closeDropdowns();
    // Scroll to trucks section
    document.querySelector('.trucks-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Messages functions for user
function showMessages() {
    hideAllSections();
    const messagesSection = document.getElementById('messagesSection');
    if (messagesSection) {
        messagesSection.style.display = 'block';
    }
    closeDropdowns();
    loadUserMessages();
}

function hideMessages() {
    const messagesSection = document.getElementById('messagesSection');
    if (messagesSection) {
        messagesSection.style.display = 'none';
    }
    showMainContent();
}

// Messages data
let currentChatContact = null;
let messagesData = {};

// Initialize messages data
function initializeMessagesData() {
    if (!localStorage.getItem('messagesData')) {
        const sampleContacts = [
            { id: 1, name: 'Jhon Smith', initials: 'JS', online: true, lastMessage: 'Hello! 👋', lastTime: '11:27 pm' },
            { id: 2, name: 'Black, Marvin', initials: 'BM', online: false, lastMessage: 'Lorem ipsum dolor sit am...', lastTime: '01:55 pm' },
            { id: 3, name: 'Flores, Juanita', initials: 'FJ', online: true, lastMessage: 'Lorem ipsum dolor sit am...', lastTime: '07:13 pm' },
            { id: 4, name: 'Cooper, Kristin', initials: 'CK', online: false, lastMessage: 'Lorem ipsum dolor sit am...', lastTime: '02:02 am' },
            { id: 5, name: 'Nguyen, Shane', initials: 'NS', online: true, lastMessage: 'Lorem ipsum dolor sit am...', lastTime: '09:45 am' },
            { id: 6, name: 'Henry, Arthur', initials: 'HA', online: false, lastMessage: 'Lorem ipsum dolor sit am...', lastTime: '03:20 pm' }
        ];
        
        const sampleMessages = {
            1: [
                { id: 1, text: 'Hello! 👋', time: '11:27 pm', sent: false },
                { id: 2, text: 'Hello!', time: '11:30 pm', sent: true },
                { id: 3, text: "I want to order some food. What's on your menu?", time: '11:32 pm', sent: false },
                { id: 4, text: 'You can check our full menu on our website. We have appetizers, main courses, desserts, and drinks.', time: '01:33 pm', sent: true }
            ]
        };
        
        localStorage.setItem('messagesData', JSON.stringify({
            contacts: sampleContacts,
            messages: sampleMessages
        }));
    }
}

function loadUserMessages() {
    initializeMessagesData();
    const data = JSON.parse(localStorage.getItem('messagesData'));
    const currentUser = getCurrentUser();
    
    // Set user info in header
    if (currentUser) {
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        document.getElementById('messagesUserInitials').textContent = initials;
        document.getElementById('messagesUserName').textContent = currentUser.name;
    }
    
    // Load contacts
    loadContacts(data.contacts);
    messagesData = data;
}

function loadContacts(contacts) {
    const contactsList = document.getElementById('messagesContactsList');
    if (!contactsList) return;
    
    contactsList.innerHTML = '';
    
    contacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'messages-contact-item';
        contactItem.onclick = function() {
            selectContact(contact.id, this);
        };
        
        const avatarClass = contact.online ? 'messages-contact-avatar online' : 'messages-contact-avatar';
        
        contactItem.innerHTML = `
            <div class="${avatarClass}">${contact.initials}</div>
            <div class="messages-contact-info">
                <div class="messages-contact-name">${contact.name}</div>
                <div class="messages-contact-preview">${contact.lastMessage}</div>
            </div>
            <div class="messages-contact-time">${contact.lastTime}</div>
        `;
        
        contactsList.appendChild(contactItem);
    });
}

function selectContact(contactId, element) {
    currentChatContact = contactId;
    const data = JSON.parse(localStorage.getItem('messagesData'));
    const contact = data.contacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    // Update active contact
    document.querySelectorAll('.messages-contact-item').forEach(item => {
        item.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
    
    // Hide empty state
    const messagesContainer = document.getElementById('messagesChatMessages');
    if (messagesContainer) {
        const emptyState = messagesContainer.querySelector('.messages-empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    // Show chat header
    document.getElementById('messagesChatHeader').style.display = 'flex';
    document.getElementById('messagesChatAvatar').querySelector('span').textContent = contact.initials;
    document.getElementById('messagesChatName').textContent = contact.name;
    
    // Show chat input
    document.getElementById('messagesChatInput').style.display = 'flex';
    
    // Load messages
    loadChatMessages(contactId);
}

function loadChatMessages(contactId) {
    const messagesContainer = document.getElementById('messagesChatMessages');
    if (!messagesContainer) return;
    
    const data = JSON.parse(localStorage.getItem('messagesData'));
    const messages = data.messages[contactId] || [];
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="messages-empty-state"><p>No messages yet. Start the conversation!</p></div>';
        return;
    }
    
    messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `messages-message ${message.sent ? 'sent' : 'received'}`;
        messageDiv.innerHTML = `
            <div class="messages-message-bubble">${message.text}</div>
            <div class="messages-message-time">${message.time}</div>
        `;
        messagesContainer.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const inputField = document.getElementById('messagesInputField');
    const messageText = inputField.value.trim();
    
    if (!messageText || !currentChatContact) return;
    
    const data = JSON.parse(localStorage.getItem('messagesData'));
    if (!data.messages[currentChatContact]) {
        data.messages[currentChatContact] = [];
    }
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    
    const newMessage = {
        id: Date.now(),
        text: messageText,
        time: time,
        sent: true
    };
    
    data.messages[currentChatContact].push(newMessage);
    
    // Update contact's last message
    const contact = data.contacts.find(c => c.id === currentChatContact);
    if (contact) {
        contact.lastMessage = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        contact.lastTime = time;
    }
    
    localStorage.setItem('messagesData', JSON.stringify(data));
    messagesData = data;
    
    // Clear input
    inputField.value = '';
    
    // Reload messages and contacts
    loadChatMessages(currentChatContact);
    loadContacts(data.contacts);
}

// Handle Enter key in message input
document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('messagesInputField');
    if (inputField) {
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

