// Karate Academy - Main JavaScript

// Admin email configuration
const ADMIN_EMAIL = 'h83132589@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// Default pricing settings (in INR)
const DEFAULT_PRICING = {
    'free': { price: 0, discount: 0, active: true },
    'bronze': { price: 1500, discount: 0, active: true },
    'silver': { price: 3000, discount: 0, active: true },
    'gold': { price: 3500, discount: 0, active: true },
    'emerald': { price: 7000, discount: 0, active: true }
};

// Load pricing settings from localStorage or use defaults
function getPricingSettings() {
    const saved = localStorage.getItem('karatePricing');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            console.log('Loaded pricing from localStorage:', parsed);
            // Ensure all prices are valid
            const levels = ['free', 'bronze', 'silver', 'gold', 'emerald'];
            levels.forEach(level => {
                if (!parsed[level] || typeof parsed[level].price !== 'number' || parsed[level].price < 0) {
                    console.log(`Resetting ${level} to default price`);
                    parsed[level] = DEFAULT_PRICING[level];
                }
            });
            return parsed;
        } catch (e) {
            console.error('Error parsing pricing settings:', e);
            return JSON.parse(JSON.stringify(DEFAULT_PRICING));
        }
    }
    console.log('Using default pricing (no saved data)');
    return JSON.parse(JSON.stringify(DEFAULT_PRICING));
}

// Clear pricing localStorage (for debugging)
function clearPricingCache() {
    localStorage.removeItem('karatePricing');
    console.log('Pricing cache cleared');
    alert('Pricing cache cleared! Refreshing page...');
    location.reload();
}

// Save pricing settings to localStorage
function savePricingSettings(settings) {
    localStorage.setItem('karatePricing', JSON.stringify(settings));
}

// Get formatted price with discount
function getFormattedPrice(level) {
    const pricing = getPricingSettings();
    const plan = pricing[level];
    if (!plan || !plan.active) return null;
    
    const originalPrice = plan.price;
    const discountAmount = Math.round(originalPrice * (plan.discount / 100));
    const finalPrice = originalPrice - discountAmount;
    
    if (plan.discount > 0) {
        return {
            original: `₹${originalPrice.toLocaleString()}`,
            discounted: `₹${finalPrice.toLocaleString()}`,
            discount: plan.discount
        };
    }
    return { original: `₹${originalPrice.toLocaleString()}`, discounted: null, discount: 0 };
}

// Membership levels hierarchy
const MEMBERSHIP_LEVELS = {
    'free': 0,
    'bronze': 1,
    'silver': 2,
    'gold': 3,
    'emerald': 4
};

// Default key settings
const DEFAULT_KEY_SETTINGS = {
    'bronze': {
        prefix: 'KK',
        min: 100,
        max: 999,
        length: 3,
        status: 'active'
    },
    'silver': {
        prefix: 'KK',
        min: 444,
        max: 777,
        length: 3,
        status: 'active'
    },
    'gold': {
        prefix: 'KK',
        min: 88,
        max: 99,
        length: 2,
        status: 'active'
    },
    'emerald': {
        prefix: 'KK',
        min: 0,
        max: 9,
        length: 1,
        status: 'active'
    }
};

// Load key settings from localStorage or use defaults
function getKeySettings() {
    const saved = localStorage.getItem('karateKeySettings');
    if (saved) {
        return JSON.parse(saved);
    }
    return JSON.parse(JSON.stringify(DEFAULT_KEY_SETTINGS));
}

// Save key settings to localStorage
function saveKeySettingsToStorage(settings) {
    localStorage.setItem('karateKeySettings', JSON.stringify(settings));
}

// Used keys registry - stores keys that have been used
function getUsedKeys() {
    const saved = localStorage.getItem('karateUsedKeys');
    if (saved) {
        return JSON.parse(saved);
    }
    return [];
}

function saveUsedKeys(keys) {
    localStorage.setItem('karateUsedKeys', JSON.stringify(keys));
}

// Check if a key is valid and available
function validateKey(key) {
    if (!key) {
        return { valid: false, message: 'No key entered' };
    }
    
    const keySettings = getKeySettings();
    const usedKeys = getUsedKeys();
    const upperKey = key.toUpperCase();
    
    // Check if key is already used
    if (usedKeys.includes(upperKey)) {
        return { valid: false, message: 'This key has already been used' };
    }
    
    // Check against each membership level's key settings
    for (const [level, settings] of Object.entries(keySettings)) {
        if (settings.status !== 'active') continue;
        
        const prefix = settings.prefix;
        const min = settings.min;
        const max = settings.max;
        
        // Check if key starts with the correct prefix
        if (upperKey.startsWith(prefix)) {
            const numberPart = upperKey.substring(prefix.length);
            const numValue = parseInt(numberPart);
            
            // Check if the number part is valid
            if (!isNaN(numValue) && numValue >= min && numValue <= max) {
                return { 
                    valid: true, 
                    level: level,
                    message: `Valid ${level} membership key`
                };
            }
        }
    }
    
    return { valid: false, message: 'Invalid key. Please check your key and try again.' };
}

// Mark a key as used
function markKeyAsUsed(key) {
    const usedKeys = getUsedKeys();
    const upperKey = key.toUpperCase();
    if (!usedKeys.includes(upperKey)) {
        usedKeys.push(upperKey);
        saveUsedKeys(usedKeys);
    }
}

// Check authentication on page load
console.log('DOMContentLoaded - karate.js is loading');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    checkAuth();
    loadSavedLogo();
    loadSavedContactDetails();
    loadVideosFromStorage();
    initializeAdminFeatures();
    initializeMembership();
    
    // Update membership display after a short delay to ensure DOM is ready
    setTimeout(function() {
        console.log('Calling updateMembershipDisplay');
        updateMembershipDisplay();
    }, 100);
    
    // Also call after full page load to ensure all elements exist
    window.addEventListener('load', function() {
        setTimeout(function() {
            console.log('Calling updateMembershipDisplay on load');
            updateMembershipDisplay();
        }, 200);
    });
});

// Authentication Check
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const isGuest = sessionStorage.getItem('isGuest') === 'true';
    const currentPage = window.location.pathname;
    
    // If not logged in and not on login page, redirect to login
    if (!isLoggedIn && !currentPage.includes('karate_login.html')) {
        window.location.href = 'karate_login.html';
        return;
    }
    
    // If logged in and on login page, redirect to main page (but not for guests)
    if (isLoggedIn && currentPage.includes('karate_login.html') && !isGuest) {
        window.location.href = 'karate_index.html';
        return;
    }
    
    // Check if user is blocked (not for guests)
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (isLoggedIn && !isGuest && !isAdmin) {
        const userEmail = sessionStorage.getItem('userEmail');
        const users = getUsers();
        const user = users[userEmail];
        
        if (user && user.status === 'inactive') {
            // User is blocked, logout and redirect
            sessionStorage.clear();
            alert('❌ Access Denied!\n\nYour account has been blocked.\n\nPlease contact the administrator.');
            window.location.href = 'karate_login.html';
            return;
        }
    }
    
    // If logged in, update the profile dropdown username
    if (isLoggedIn) {
        const username = sessionStorage.getItem('username') || 'Sensei';
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = username;
        }
        
        // Update profile badge for admin
        const isAdminUser = sessionStorage.getItem('isAdmin') === 'true';
        if (isAdminUser) {
            updateProfileForAdmin();
        }
        
        // Hide profile menu items for guests
        if (isGuest) {
            const profileMenu = document.getElementById('profileMenu');
            if (profileMenu) {
                profileMenu.innerHTML = `
                    <li><a href="#" onclick="guestMessage(); return false;"><i class="fas fa-info-circle"></i> Guest Mode</a></li>
                    <li><a href="karate_login.html" onclick="logout()"><i class="fas fa-sign-in-alt"></i> Login</a></li>
                `;
            }
            const userRole = document.getElementById('userRole');
            if (userRole) {
                userRole.textContent = 'Guest Visitor';
            }
        } else if (!isAdminUser) {
            // For non-admin logged-in users, hide Members option
            const profileMenu = document.getElementById('profileMenu');
            if (profileMenu) {
                const membersItem = profileMenu.querySelector('a[onclick*="showMembers"]');
                if (membersItem) {
                    membersItem.parentElement.style.display = 'none';
                }
            }
        }
    }
}

// Guest mode info message
function guestMessage() {
    alert('👋 Guest Mode\n\nAs a guest, you can view photos and content.\n\nLogin or Sign Up to access videos and premium features.');
}

// Update profile UI for admin users
function updateProfileForAdmin() {
    const profileHeader = document.querySelector('.profile-header p');
    if (profileHeader) {
        profileHeader.innerHTML = '<span style="background: #28a745; padding: 3px 10px; border-radius: 10px; font-size: 12px;">ADMIN</span>';
    }
    
    // Update user role text
    const userRole = document.getElementById('userRole');
    if (userRole) {
        userRole.textContent = 'Administrator';
    }
    
    // Add admin badge to profile icon
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
        profileAvatar.style.border = '3px solid #28a745';
    }
    
    // Show admin-only menu items
    const adminOnlyItems = document.querySelectorAll('.admin-only-item');
    adminOnlyItems.forEach(item => {
        item.style.display = 'block';
    });
}

// Initialize admin features
function initializeAdminFeatures() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    if (isAdmin) {
        // Show admin controls
        showAdminControls();
    } else {
        // Hide admin controls for non-admin users
        hideAdminControls();
    }
}

// Show admin-only controls
function showAdminControls() {
    // Add "Edit" buttons to winner photos
    const winnerPhotos = document.querySelectorAll('.winner-photo');
    winnerPhotos.forEach(photo => {
        const editBtn = document.createElement('div');
        editBtn.className = 'edit-photo-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Photo';
        editBtn.onclick = function() {
            const winnerCard = this.closest('.winner-card');
            editWinnerPhoto(winnerCard);
        };
        photo.appendChild(editBtn);
    });
    
    // Add edit button to video cards
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        const editBtn = document.createElement('div');
        editBtn.className = 'edit-video-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Video';
        editBtn.onclick = function() {
            editVideo(this.closest('.video-card'));
        };
        card.appendChild(editBtn);
    });
    
    // Add "Add Video" button
    const videoSection = document.querySelector('#videos');
    if (videoSection) {
        const addVideoBtn = document.createElement('button');
        addVideoBtn.className = 'add-video-btn';
        addVideoBtn.innerHTML = '<i class="fas fa-plus"></i> Add New Video';
        addVideoBtn.onclick = openAddVideoModal;
        addVideoBtn.style.cssText = 'margin-top: 30px; padding: 15px 30px; background: #28a745; color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; display: block; margin-left: auto; margin-right: auto;';
        
        const videoControls = document.querySelector('.video-controls');
        if (videoControls) {
            videoControls.parentNode.insertBefore(addVideoBtn, videoControls.nextSibling);
        }
    }
    
    // Add admin indicator in profile
    const profileIcon = document.querySelector('.profile-icon');
    if (profileIcon) {
        const adminBadge = document.createElement('div');
        adminBadge.className = 'admin-badge';
        adminBadge.innerHTML = '<i class="fas fa-crown"></i>';
        adminBadge.title = 'Administrator';
        adminBadge.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #28a745; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;';
        profileIcon.style.position = 'relative';
        profileIcon.appendChild(adminBadge);
    }
    
    // Add "Edit" buttons to master photos
    const masterPhotos = document.querySelectorAll('.master-photo');
    masterPhotos.forEach(photo => {
        const editBtn = document.createElement('div');
        editBtn.className = 'edit-photo-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Photo';
        editBtn.onclick = function() {
            const masterCard = this.closest('.master-card');
            editMasterPhoto(masterCard);
        };
        photo.appendChild(editBtn);
    });
    
    // Update CSS for master-photo hover
    const existingStyle = document.querySelector('style');
    if (existingStyle) {
        let styleContent = existingStyle.textContent;
        if (!styleContent.includes('.master-photo:hover')) {
            styleContent += '\n.master-photo:hover .edit-photo-btn { opacity: 1; }';
            existingStyle.textContent = styleContent;
        }
    }
    
    // Add "Manage Pricing" button in membership section
    const membershipSection = document.querySelector('#membership');
    if (membershipSection) {
        const pricingBtn = document.createElement('button');
        pricingBtn.className = 'manage-pricing-btn';
        pricingBtn.innerHTML = '<i class="fas fa-tag"></i> Manage Pricing';
        pricingBtn.onclick = openPricingModal;
        pricingBtn.style.cssText = 'margin: 20px auto 30px; padding: 12px 25px; background: #6f42c1; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; display: block;';
        
        const subtitle = membershipSection.querySelector('.section-subtitle');
        if (subtitle) {
            subtitle.parentNode.insertBefore(pricingBtn, subtitle.nextSibling);
        }
    }
    
    // Add "Edit Contact Details" button in footer
    const footer = document.querySelector('.footer');
    if (footer) {
        const contactEditBtn = document.createElement('button');
        contactEditBtn.className = 'edit-contact-btn';
        contactEditBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Contact';
        contactEditBtn.onclick = openContactDetailsModal;
        contactEditBtn.title = 'Edit contact details';
        contactEditBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px; font-weight: 600;';
        
        const footerContent = footer.querySelector('.footer-content');
        if (footerContent) {
            footerContent.style.position = 'relative';
            footerContent.appendChild(contactEditBtn);
        }
    }
    
    // Add edit buttons to membership cards
    const membershipCards = document.querySelectorAll('.membership-card');
    membershipCards.forEach(card => {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-price-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Price';
        editBtn.onclick = function() {
            openPricingModal();
        };
        editBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 8px 12px; background: rgba(40, 167, 69, 0.9); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s ease;';
        
        const header = card.querySelector('.membership-header');
        if (header) {
            header.style.position = 'relative';
            header.appendChild(editBtn);
        }
    });
    
    // Add CSS for edit price button hover
    const style = document.createElement('style');
    style.textContent = `
        .membership-card:hover .edit-price-btn,
        .footer-content:hover .edit-contact-btn {
            opacity: 1;
        }
        .edit-price-btn:hover,
        .edit-contact-btn:hover {
            background: rgba(40, 167, 69, 1) !important;
        }
        .edit-contact-btn {
            opacity: 0.6 !important;
        }
    `;
    document.head.appendChild(style);
}

// Open Pricing Management Modal
function openPricingModal() {
    const modal = document.getElementById('pricingModal');
    if (!modal) {
        createPricingModal();
    }
    loadPricingSettings();
    document.getElementById('pricingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Create Pricing Modal
function createPricingModal() {
    const modal = document.createElement('div');
    modal.id = 'pricingModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2><i class="fas fa-tag"></i> Manage Pricing & Discounts</h2>
                <span class="close-btn" onclick="closePricingModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div id="pricingSettings">Loading...</div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="clearPricingCache()">Clear Cache</button>
                <button class="btn btn-secondary" onclick="resetPricingDefaults()">Reset to Defaults</button>
                <button class="btn btn-secondary" onclick="closePricingModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveAllPricing()">Save All Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add CSS for pricing modal
    const style = document.createElement('style');
    style.textContent = `
        #pricingModal .pricing-row {
            display: flex;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
            gap: 10px;
        }
        #pricingModal .pricing-row:last-child {
            border-bottom: none;
        }
        #pricingModal .pricing-label {
            flex: 1;
            font-weight: 600;
            text-transform: capitalize;
        }
        #pricingModal .pricing-fixed {
            width: 100px;
            padding: 8px;
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            color: #333;
        }
        #pricingModal .pricing-input {
            width: 100px;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
            text-align: center;
        }
        #pricingModal .pricing-discount {
            width: 80px;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
            text-align: center;
        }
        #pricingModal .pricing-preview {
            width: 120px;
            text-align: right;
            font-weight: bold;
            color: #28a745;
        }
        #pricingModal .pricing-original {
            text-decoration: line-through;
            color: #999;
            font-size: 0.9em;
        }
        #pricingModal .pricing-badge {
            background: #28a745;
            color: white;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 0.8em;
            margin-left: 5px;
        }
        #pricingModal .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        #pricingModal .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        #pricingModal .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        #pricingModal .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        #pricingModal input:checked + .toggle-slider {
            background-color: #28a745;
        }
        #pricingModal input:checked + .toggle-slider:before {
            transform: translateX(26px);
        }
    `;
    document.head.appendChild(style);
}

// Load Pricing Settings into Modal
function loadPricingSettings() {
    const pricing = getPricingSettings();
    console.log('Loading pricing settings:', pricing);
    const container = document.getElementById('pricingSettings');
    
    let html = '';
    const levels = ['bronze', 'silver', 'gold', 'emerald'];
    
    levels.forEach(level => {
        const plan = pricing[level];
        const originalPrice = plan?.price || 0;
        const discountAmount = Math.round(originalPrice * (plan?.discount || 0) / 100);
        const finalPrice = originalPrice - discountAmount;
        
        console.log(`${level}: price=${originalPrice}, discount=${plan?.discount}`);
        
        html += `
            <div class="pricing-row">
                <label class="pricing-label">${level}</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="${level}Active" ${plan?.active ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
                <div class="pricing-fixed">₹</div>
                <input type="number" id="${level}Price" class="pricing-input" value="${originalPrice}" min="0" onchange="updatePricePreview('${level}')">
                <span>%</span>
                <input type="number" id="${level}Discount" class="pricing-discount" value="${plan?.discount || 0}" min="0" max="100" onchange="updatePricePreview('${level}')">
                <div class="pricing-preview" id="${level}Preview">
                    ${(plan?.discount || 0) > 0 ? `<span class="pricing-original">₹${originalPrice}</span> ₹${finalPrice}<span class="pricing-badge">-${plan?.discount}%</span>` : `₹${originalPrice}`}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update Price Preview
function updatePricePreview(level) {
    const price = parseInt(document.getElementById(`${level}Price`).value) || 0;
    const discount = parseInt(document.getElementById(`${level}Discount`).value) || 0;
    const discountAmount = Math.round(price * (discount / 100));
    const finalPrice = price - discountAmount;
    
    const previewEl = document.getElementById(`${level}Preview`);
    if (discount > 0) {
        previewEl.innerHTML = `<span class="pricing-original">₹${price}</span> ₹${finalPrice}<span class="pricing-badge">-${discount}%</span>`;
    } else {
        previewEl.innerHTML = `₹${price}`;
    }
}

// Save All Pricing Settings
function saveAllPricing() {
    const pricing = getPricingSettings();
    const levels = ['bronze', 'silver', 'gold', 'emerald'];
    
    console.log('=== saveAllPricing ===');
    console.log('Original pricing:', pricing);
    
    levels.forEach(level => {
        const priceInput = document.getElementById(`${level}Price`);
        const discountInput = document.getElementById(`${level}Discount`);
        const activeInput = document.getElementById(`${level}Active`);
        
        console.log(`${level}Price element:`, priceInput);
        console.log(`${level}Price value:`, priceInput?.value);
        
        // Get values with fallback to current settings
        const currentPrice = pricing[level]?.price || 0;
        const price = priceInput ? (parseInt(priceInput.value) || currentPrice) : currentPrice;
        const discount = discountInput ? (parseInt(discountInput.value) || 0) : 0;
        const active = activeInput ? activeInput.checked : (pricing[level]?.active ?? true);
        
        console.log(`Saving ${level}: price=${price}, discount=${discount}, active=${active}`);
        
        pricing[level] = {
            price: price,
            discount: discount,
            active: active
        };
    });
    
    console.log('Final pricing settings:', pricing);
    savePricingSettings(pricing);
    closePricingModal();
    alert('✅ Pricing settings saved successfully!');
    
    // Refresh membership display if on that page
    if (typeof updateMembershipDisplay === 'function') {
        updateMembershipDisplay();
    }
}

// Reset Pricing to Defaults
function resetPricingDefaults() {
    if (confirm('Reset all pricing to default values?')) {
        savePricingSettings(JSON.parse(JSON.stringify(DEFAULT_PRICING)));
        loadPricingSettings();
        alert('✅ Pricing reset to defaults!');
    }
}

// Close Pricing Modal
function closePricingModal() {
    const modal = document.getElementById('pricingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Contact Details Management
const DEFAULT_CONTACT_DETAILS = {
    address: '123 Dojo Street',
    phone: '(555) 123-4567',
    email: 'info@karateacademy.com',
    academyName: 'Karate Academy',
    tagline: 'Mastering the art since 2004'
};

// Load contact details from localStorage or use defaults
function getContactDetails() {
    const saved = localStorage.getItem('karateContactDetails');
    if (saved) {
        return JSON.parse(saved);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONTACT_DETAILS));
}

// Save contact details to localStorage
function saveContactDetails(details) {
    localStorage.setItem('karateContactDetails', JSON.stringify(details));
}

// Open Contact Details Edit Modal
function openContactDetailsModal() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        alert('Only admin can edit contact details.');
        return;
    }
    
    const modal = document.getElementById('contactDetailsModal');
    if (!modal) {
        createContactDetailsModal();
    }
    
    const details = getContactDetails();
    document.getElementById('contactAcademyName').value = details.academyName;
    document.getElementById('contactTagline').value = details.tagline;
    document.getElementById('contactAddress').value = details.address;
    document.getElementById('contactPhone').value = details.phone;
    document.getElementById('contactEmail').value = details.email;
    
    document.getElementById('contactDetailsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Create Contact Details Modal
function createContactDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'contactDetailsModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-address-card"></i> Edit Contact Details</h2>
                <span class="close-btn" onclick="closeContactDetailsModal()">&times;</span>
            </div>
            <form onsubmit="saveContactDetailsSubmit(event)">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="contactAcademyName">Academy Name</label>
                        <input type="text" id="contactAcademyName" required placeholder="Enter academy name">
                    </div>
                    <div class="form-group">
                        <label for="contactTagline">Tagline</label>
                        <input type="text" id="contactTagline" placeholder="Enter tagline">
                    </div>
                    <div class="form-group">
                        <label for="contactAddress">Address</label>
                        <input type="text" id="contactAddress" required placeholder="Enter address">
                    </div>
                    <div class="form-group">
                        <label for="contactPhone">Phone Number</label>
                        <input type="text" id="contactPhone" required placeholder="Enter phone number">
                    </div>
                    <div class="form-group">
                        <label for="contactEmail">Email</label>
                        <input type="email" id="contactEmail" required placeholder="Enter email">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeContactDetailsModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

// Save Contact Details Submit
function saveContactDetailsSubmit(e) {
    e.preventDefault();
    
    const details = {
        academyName: document.getElementById('contactAcademyName').value,
        tagline: document.getElementById('contactTagline').value,
        address: document.getElementById('contactAddress').value,
        phone: document.getElementById('contactPhone').value,
        email: document.getElementById('contactEmail').value
    };
    
    saveContactDetails(details);
    updateContactDetailsDisplay();
    closeContactDetailsModal();
    alert('✅ Contact details updated successfully!');
}

// Close Contact Details Modal
function closeContactDetailsModal() {
    const modal = document.getElementById('contactDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Update Contact Details Display
function updateContactDetailsDisplay() {
    const details = getContactDetails();
    
    // Update footer content
    const footerSections = document.querySelectorAll('.footer-section');
    if (footerSections.length >= 3) {
        // Academy name and tagline
        if (footerSections[0].querySelector('h3')) {
            footerSections[0].querySelector('h3').textContent = details.academyName;
            footerSections[0].querySelector('p').textContent = details.tagline;
        }
        
        // Contact info
        const contactParagraphs = footerSections[2].querySelectorAll('p');
        if (contactParagraphs.length >= 3) {
            contactParagraphs[0].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${details.address}`;
            contactParagraphs[1].innerHTML = `<i class="fas fa-phone"></i> ${details.phone}`;
            contactParagraphs[2].innerHTML = `<i class="fas fa-envelope"></i> ${details.email}`;
        }
    }
}

// Load saved contact details on page load
function loadSavedContactDetails() {
    const details = getContactDetails();
    
    // Update footer content
    const footerSections = document.querySelectorAll('.footer-section');
    if (footerSections.length >= 3) {
        // Academy name and tagline
        if (footerSections[0].querySelector('h3')) {
            footerSections[0].querySelector('h3').textContent = details.academyName;
            footerSections[0].querySelector('p').textContent = details.tagline;
        }
        
        // Contact info
        const contactParagraphs = footerSections[2].querySelectorAll('p');
        if (contactParagraphs.length >= 3) {
            contactParagraphs[0].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${details.address}`;
            contactParagraphs[1].innerHTML = `<i class="fas fa-phone"></i> ${details.phone}`;
            contactParagraphs[2].innerHTML = `<i class="fas fa-envelope"></i> ${details.email}`;
        }
    }
}

// Update Membership Display
function updateMembershipDisplay() {
    const pricing = getPricingSettings();
    
    console.log('=== updateMembershipDisplay ===');
    console.log('Pricing data:', pricing);
    
    // Direct DOM updates with IDs
    const priceIds = ['freePrice', 'bronzePrice', 'silverPrice', 'goldPrice', 'emeraldPrice'];
    const levelNames = ['free', 'bronze', 'silver', 'gold', 'emerald'];
    
    priceIds.forEach((id, index) => {
        const priceEl = document.getElementById(id);
        if (priceEl) {
            const level = levelNames[index];
            const plan = pricing[level];
            
            console.log(`Updating ${id} for level ${level}:`, plan);
            
            if (plan && plan.active) {
                if (plan.discount > 0) {
                    const finalPrice = plan.price - Math.round(plan.price * (plan.discount / 100));
                    priceEl.innerHTML = `<span class="original-price">₹${plan.price}</span> ₹${finalPrice}<span class="discount-badge">-${plan.discount}%</span><span>/month</span>`;
                } else {
                    priceEl.innerHTML = `₹${plan.price}<span>/month</span>`;
                }
            } else {
                priceEl.innerHTML = 'Unavailable';
            }
        } else {
            console.log(`Price element ${id} NOT FOUND in DOM`);
            // Try to find by class as fallback
            const allElements = document.querySelectorAll(`[id*="Price"]`);
            console.log('Elements with Price in ID:', allElements);
        }
    });

    // Also update by class as backup
    const levels = ['free', 'bronze', 'silver', 'gold', 'emerald'];
    levels.forEach(level => {
        const card = document.querySelector(`.membership-card.${level}`);
        if (card) {
            const priceEl = card.querySelector('.membership-price');
            if (priceEl) {
                const plan = pricing[level];
                if (plan && plan.active) {
                    if (plan.discount > 0) {
                        const finalPrice = plan.price - Math.round(plan.price * (plan.discount / 100));
                        priceEl.innerHTML = `<span class="original-price">₹${plan.price}</span> ₹${finalPrice}<span class="discount-badge">-${plan.discount}%</span><span>/month</span>`;
                    } else {
                        priceEl.innerHTML = `₹${plan.price}<span>/month</span>`;
                    }
                } else {
                    priceEl.innerHTML = 'Unavailable';
                }
            }
        }
    });
}

// Hide admin controls for non-admin users
function hideAdminControls() {
    const editButtons = document.querySelectorAll('.edit-photo-btn, .edit-video-btn, .add-video-btn, .admin-badge, .edit-price-btn, .edit-contact-btn, .manage-pricing-btn');
    editButtons.forEach(btn => btn.remove());
}

// Login Form Handler (for karate_login.html)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.toLowerCase();
        const password = document.getElementById('password').value;
        
        // Check if admin email
        const isAdminUser = username === ADMIN_EMAIL;
        const isAdminPassword = password === ADMIN_PASSWORD;
        
        if (isAdminUser && isAdminPassword) {
            // Admin login
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', 'Admin');
            sessionStorage.setItem('userEmail', ADMIN_EMAIL);
            sessionStorage.setItem('isAdmin', 'true');
            
            // Initialize admin user in database
            initializeUserOnLogin(ADMIN_EMAIL);
            
            const loginBtn = document.querySelector('.login-btn');
            loginBtn.textContent = 'Welcome Admin!';
            loginBtn.style.background = '#28a745';
            
            setTimeout(() => {
                window.location.href = 'karate_index.html';
            }, 500);
        } else if (username && password) {
            // Check if user exists and is not blocked
            const users = getUsers();
            const user = users[username.toLowerCase()];
            
            if (!user) {
                alert('❌ Access Denied!\n\nNo account found with this email.\n\nPlease sign up first.');
                return;
            }
            
            if (user.status === 'inactive') {
                alert('❌ Access Denied!\n\nYour account has been blocked.\n\nPlease contact the administrator.');
                return;
            }
            
            // Check if user has a valid membership key
            // Users without a key (free members) cannot login
            if (!user.key || user.membership === 'free') {
                alert('❌ Access Denied!\n\nYou need a valid membership key to login.\n\nPlease sign up with a valid security key to access the system.');
                return;
            }
            
            // Regular user login
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userEmail', username);
            sessionStorage.setItem('isAdmin', 'false');
            
            // Initialize user in database and load their membership
            initializeUserOnLogin(username);
            
            const loginBtn = document.querySelector('.login-btn');
            loginBtn.textContent = 'Welcome!';
            loginBtn.style.background = '#28a745';
            
            setTimeout(() => {
                window.location.href = 'karate_index.html';
            }, 500);
        } else {
            alert('Please enter username/email and password');
        }
    });
}

// Profile Menu Toggle
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close profile dropdown when clicking outside
document.addEventListener('click', function(e) {
    const profileIcon = document.querySelector('.profile-icon');
    const dropdown = document.getElementById('profileDropdown');
    
    if (profileIcon && dropdown && !profileIcon.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Logout Function
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('isGuest');
    window.location.href = 'karate_login.html';
}

// Toggle Profile Menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        
        // Close dropdown when clicking outside
        if (dropdown.classList.contains('active')) {
            setTimeout(() => {
                document.addEventListener('click', closeProfileOnClickOutside);
            }, 0);
        }
    }
}

// Close profile dropdown when clicking outside
function closeProfileOnClickOutside(event) {
    const dropdown = document.getElementById('profileDropdown');
    const profileBtn = document.querySelector('.profile-nav-btn');
    
    if (dropdown && !dropdown.contains(event.target) && (!profileBtn || !profileBtn.contains(event.target))) {
        dropdown.classList.remove('active');
        document.removeEventListener('click', closeProfileOnClickOutside);
    }
}

// Open Logo Upload Modal
function openLogoUpload() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
        alert('Only admin can change the logo.');
        return;
    }
    const modal = document.getElementById('logoUploadModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Logo Upload Modal
function closeLogoUploadModal() {
    const modal = document.getElementById('logoUploadModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Upload Logo
function uploadLogo(e) {
    e.preventDefault();
    const logoInput = document.getElementById('logoUpload');
    
    if (logoInput && logoInput.files && logoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const logoData = event.target.result;
            
            // Save logo to localStorage
            localStorage.setItem('karateLogo', logoData);
            
            // Update all logo instances
            const logos = document.querySelectorAll('.logo-icon');
            logos.forEach(logo => {
                logo.src = logoData;
            });
            
            closeLogoUploadModal();
            alert('Logo uploaded successfully!');
        };
        reader.readAsDataURL(logoInput.files[0]);
    }
}

// Load saved logo on page load
function loadSavedLogo() {
    const savedLogo = localStorage.getItem('karateLogo');
    if (savedLogo) {
        const logos = document.querySelectorAll('.logo-icon');
        logos.forEach(logo => {
            logo.src = savedLogo;
        });
    }
}

// Video Filtering
function filterVideos(category) {
    const buttons = document.querySelectorAll('.video-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const videos = document.querySelectorAll('.video-card');
    videos.forEach(video => {
        const videoCategory = video.getAttribute('data-category');
        
        if (category === 'all' || videoCategory === category) {
            video.classList.remove('hidden');
            video.style.animation = 'fadeIn 0.5s ease';
        } else {
            video.classList.add('hidden');
        }
    });
}

// Add Fade In Animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .edit-photo-btn, .edit-video-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(40, 167, 69, 0.9);
        color: white;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .winner-photo:hover .edit-photo-btn,
    .video-card:hover .edit-video-btn {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Add Winner Modal Functions
function openAddWinnerModal() {
    const modal = document.getElementById('addWinnerModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAddWinnerModal() {
    const modal = document.getElementById('addWinnerModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
const modal = document.getElementById('addWinnerModal');
if (modal) {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAddWinnerModal();
        }
    });
}

// Edit Winner Photo
function editWinnerPhoto(winnerCard) {
    const newPhoto = prompt('Enter new photo URL or select a file:');
    if (newPhoto) {
        const photoDiv = winnerCard.querySelector('.winner-photo');
        if (photoDiv) {
            photoDiv.innerHTML = `<img src="${newPhoto}" alt="Winner" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        alert('Photo updated successfully!');
    }
}

// Edit Video
function editVideo(videoCard) {
    const titleEl = videoCard.querySelector('.video-info h3');
    const currentTitle = titleEl.textContent;
    const newTitle = prompt('Edit video title:', currentTitle);
    
    if (newTitle && newTitle !== currentTitle) {
        titleEl.textContent = newTitle;
        alert('Video updated successfully!');
    }
}

// Add Video Modal
function openAddVideoModal() {
    const modalHTML = `
        <div class="modal" id="addVideoModal">
            <div class="modal-content">
                <span class="modal-close" onclick="closeAddVideoModal()">&times;</span>
                <h2>Add New Video</h2>
                <form id="addVideoForm" onsubmit="addVideo(event)">
                    <div class="form-group">
                        <label for="videoTitle">Video Title</label>
                        <input type="text" id="videoTitle" required placeholder="Enter video title">
                    </div>
                    <div class="form-group">
                        <label for="videoDescription">Description</label>
                        <input type="text" id="videoDescription" required placeholder="Enter description">
                    </div>
                    <div class="form-group">
                        <label for="videoCategory">Category</label>
                        <select id="videoCategory" style="width: 100%; padding: 12px 15px; border: 2px solid #eee; border-radius: 10px; font-size: 1rem;">
                            <option value="basics">Basics</option>
                            <option value="kata">Kata</option>
                            <option value="sparring">Sparring</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="videoFile">Video File (from Gallery)</label>
                        <input type="file" id="videoFile" accept="video/*" placeholder="Select video from gallery">
                    </div>
                    <div class="form-group">
                        <label for="videoThumbnailFile">Thumbnail Image (from Gallery)</label>
                        <input type="file" id="videoThumbnailFile" accept="image/*" placeholder="Select thumbnail from gallery">
                    </div>
                    <div class="form-group">
                        <label for="videoDuration">Duration</label>
                        <input type="text" id="videoDuration" placeholder="e.g., 10:30" required>
                    </div>
                    <button type="submit" class="submit-btn">Add Video</button>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('addVideoModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('addVideoModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAddVideoModal() {
    const modal = document.getElementById('addVideoModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => modal.remove(), 300);
    }
}

// Add New Video
function addVideo(e) {
    e.preventDefault();
    
    const title = document.getElementById('videoTitle').value;
    const description = document.getElementById('videoDescription').value;
    const category = document.getElementById('videoCategory').value;
    const videoFileInput = document.getElementById('videoFile');
    const thumbnailFileInput = document.getElementById('videoThumbnailFile');
    const duration = document.getElementById('videoDuration').value;
    
    // Handle video file from gallery
    let videoDataUrl = null;
    if (videoFileInput && videoFileInput.files && videoFileInput.files[0]) {
        videoDataUrl = URL.createObjectURL(videoFileInput.files[0]);
    }
    
    // Handle thumbnail file from gallery
    let thumbnailDataUrl = null;
    if (thumbnailFileInput && thumbnailFileInput.files && thumbnailFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            thumbnailDataUrl = event.target.result;
            completeVideoAdd(title, description, category, thumbnailDataUrl, videoDataUrl, duration);
        };
        reader.readAsDataURL(thumbnailFileInput.files[0]);
    } else {
        completeVideoAdd(title, description, category, null, videoDataUrl, duration);
    }
}

// Complete video add after thumbnail is processed
function completeVideoAdd(title, description, category, thumbnail, videoUrl, duration) {
    // Create new video card
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.setAttribute('data-category', category);
    
    // Add video click handler if video file was uploaded
    let thumbnailStyle = thumbnail 
        ? `background: url(${thumbnail}) center/cover` 
        : 'linear-gradient(135deg, #1a1a2e, #16213e)';
    let playIconAction = videoUrl 
        ? `onclick="playVideo('${videoUrl}')" style="cursor: pointer"` 
        : '';
    
    videoCard.innerHTML = `
        <div class="video-thumbnail" style="${thumbnailStyle}" ${playIconAction}>
            <i class="fas fa-${videoUrl ? 'play-circle' : 'video'}"></i>
            <span class="video-duration">${duration}</span>
        </div>
        <div class="video-info">
            <h3>${title}</h3>
            <p>${description}</p>
            <span class="video-tag">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            ${videoUrl ? '<p style="color: #28a745; font-size: 0.85rem; margin-top: 5px;"><i class="fas fa-check-circle"></i> Video uploaded from gallery</p>' : ''}
        </div>
    `;
    
    // Add to grid
    const videoGrid = document.getElementById('videoGrid');
    if (videoGrid) {
        videoGrid.insertBefore(videoCard, videoGrid.firstChild);
        videoCard.style.animation = 'fadeIn 0.5s ease';
    }
    
    // Save to localStorage
    saveVideoToStorage({
        title,
        description,
        category,
        thumbnail,
        videoUrl,
        duration,
        createdAt: new Date().toISOString()
    });
    
    closeAddVideoModal();
    document.getElementById('addVideoForm').reset();
    alert('Video added successfully!');
}

// Play uploaded video
function playVideo(videoUrl) {
    if (videoUrl) {
        const videoModalHTML = `
            <div class="modal" id="videoPlayerModal">
                <div class="modal-content" style="max-width: 800px; background: #000;">
                    <span class="modal-close" onclick="closeVideoPlayerModal()">&times;</span>
                    <video controls style="width: 100%; max-height: 70vh;" autoplay>
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', videoModalHTML);
        const modal = document.getElementById('videoPlayerModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close video player modal
function closeVideoPlayerModal() {
    const modal = document.getElementById('videoPlayerModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => modal.remove(), 300);
    }
}

// Save video to localStorage
function saveVideoToStorage(video) {
    const savedVideos = localStorage.getItem('karateVideos');
    let videos = savedVideos ? JSON.parse(savedVideos) : [];
    videos.unshift(video);
    localStorage.setItem('karateVideos', JSON.stringify(videos));
}

// Load videos from localStorage
function loadVideosFromStorage() {
    const savedVideos = localStorage.getItem('karateVideos');
    if (savedVideos) {
        const videos = JSON.parse(savedVideos);
        const videoGrid = document.getElementById('videoGrid');
        if (videoGrid) {
            videos.forEach(video => {
                const videoCard = document.createElement('div');
                videoCard.className = 'video-card';
                videoCard.setAttribute('data-category', video.category);
                
                // Check if video has uploaded video file
                let playIconAction = video.videoUrl 
                    ? `onclick="playVideo('${video.videoUrl}')" style="cursor: pointer"` 
                    : '';
                
                videoCard.innerHTML = `
                    <div class="video-thumbnail" style="background: ${video.thumbnail ? `url(${video.thumbnail}) center/cover` : 'linear-gradient(135deg, #1a1a2e, #16213e)'}" ${playIconAction}>
                        <i class="fas fa-${video.videoUrl ? 'play-circle' : 'video'}"></i>
                        <span class="video-duration">${video.duration}</span>
                    </div>
                    <div class="video-info">
                        <h3>${video.title}</h3>
                        <p>${video.description}</p>
                        <span class="video-tag">${video.category.charAt(0).toUpperCase() + video.category.slice(1)}</span>
                        ${video.videoUrl ? '<p style="color: #28a745; font-size: 0.85rem; margin-top: 5px;"><i class="fas fa-check-circle"></i> Video uploaded from gallery</p>' : ''}
                    </div>
                `;
                videoGrid.appendChild(videoCard);
            });
        }
    }
}

// Save winners to localStorage
function saveWinner(name, competition, achievement, photo) {
    const savedWinners = localStorage.getItem('karateWinners');
    let winners = savedWinners ? JSON.parse(savedWinners) : [];
    
    winners.push({
        name,
        competition,
        achievement,
        photo
    });
    
    localStorage.setItem('karateWinners', JSON.stringify(winners));
}

// Add Winner Form Handler
function addWinner(e) {
    e.preventDefault();
    
    const name = document.getElementById('winnerName').value;
    const competition = document.getElementById('winnerCompetition').value;
    const achievement = document.getElementById('winnerAchievement').value;
    const photoInput = document.getElementById('winnerPhoto');
    
    let photoData = null;
    if (photoInput && photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoData = e.target.result;
            saveAndDisplayWinner(name, competition, achievement, photoData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveAndDisplayWinner(name, competition, achievement, photoData);
    }
    
    function saveAndDisplayWinner(name, competition, achievement, photo) {
        saveWinner(name, competition, achievement, photo);
        
        const winnerCard = document.createElement('div');
        winnerCard.className = 'winner-card';
        winnerCard.innerHTML = `
            <div class="winner-photo">
                ${photo ? `<img src="${photo}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                    <i class="fas fa-user-plus"></i>
                    <span class="add-photo">${name}</span>
                `}
            </div>
            <div class="winner-info">
                <h3>${name}</h3>
                <p>Competition: ${competition}</p>
                <p>Achievement: ${achievement}</p>
            </div>
        `;
        
        const gallery = document.querySelector('.winners-gallery');
        if (gallery) {
            gallery.appendChild(winnerCard);
            
            // Add edit button for admin
            if (sessionStorage.getItem('isAdmin') === 'true') {
                const editBtn = document.createElement('div');
                editBtn.className = 'edit-photo-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.title = 'Edit Photo';
                editBtn.onclick = function() {
                    editWinnerPhoto(winnerCard);
                };
                winnerCard.querySelector('.winner-photo').appendChild(editBtn);
            }
        }
        
        closeAddWinnerModal();
        document.getElementById('addWinnerForm').reset();
        alert('Champion added successfully!');
    }
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav-links a.active')?.classList.remove('active');
            document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.add('active');
        }
    });
});

// Video Play Simulation
document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
    thumbnail.addEventListener('click', function() {
        const videoInfo = this.nextElementSibling;
        const videoTitle = videoInfo.querySelector('h3').textContent;
        alert(`Playing: ${videoTitle}\n\n(In a real application, this would open a video player)`);
    });
});

// Initialize winners from localStorage
function loadWinners() {
    const savedWinners = localStorage.getItem('karateWinners');
    if (savedWinners) {
        const winners = JSON.parse(savedWinners);
        const gallery = document.querySelector('.winners-gallery');
        
        if (gallery) {
            winners.forEach(winner => {
                const winnerCard = document.createElement('div');
                winnerCard.className = 'winner-card';
                winnerCard.innerHTML = `
                    <div class="winner-photo">
                        ${winner.photo ? `<img src="${winner.photo}" alt="${winner.name}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                            <i class="fas fa-user-plus"></i>
                            <span class="add-photo">${winner.name}</span>
                        `}
                    </div>
                    <div class="winner-info">
                        <h3>${winner.name}</h3>
                        <p>Competition: ${winner.competition}</p>
                        <p>Achievement: ${winner.achievement}</p>
                    </div>
                `;
                gallery.appendChild(winnerCard);
            });
        }
    }
}

// Load winners on page load
document.addEventListener('DOMContentLoaded', loadWinners);

// ============ MASTERS SECTION FUNCTIONS ============

// Open Add Master Modal
function openAddMasterModal() {
    const modal = document.getElementById('addMasterModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Add Master Modal
function closeAddMasterModal() {
    const modal = document.getElementById('addMasterModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Open Add Awarded Photo Modal
function openAddAwardedPhotoModal() {
    const modal = document.getElementById('addAwardedPhotoModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Add Awarded Photo Modal
function closeAddAwardedPhotoModal() {
    const modal = document.getElementById('addAwardedPhotoModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
const masterModal = document.getElementById('addMasterModal');
if (masterModal) {
    masterModal.addEventListener('click', function(e) {
        if (e.target === masterModal) {
            closeAddMasterModal();
        }
    });
}

// Save Master to localStorage
function saveMaster(name, title, belt, experience, photo) {
    const savedMasters = localStorage.getItem('karateMasters');
    let masters = savedMasters ? JSON.parse(savedMasters) : [];
    
    masters.push({
        name,
        title,
        belt,
        experience,
        photo
    });
    
    localStorage.setItem('karateMasters', JSON.stringify(masters));
}

// Add Master Form Handler
function addMaster(e) {
    e.preventDefault();
    
    const name = document.getElementById('masterName').value;
    const title = document.getElementById('masterTitle').value;
    const belt = document.getElementById('masterBelt').value;
    const experience = document.getElementById('masterExperience').value;
    const photoInput = document.getElementById('masterPhoto');
    
    let photoData = null;
    if (photoInput && photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoData = e.target.result;
            saveAndDisplayMaster(name, title, belt, experience, photoData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveAndDisplayMaster(name, title, belt, experience, photoData);
    }
    
    function saveAndDisplayMaster(name, title, belt, experience, photo) {
        saveMaster(name, title, belt, experience, photo);
        
        const masterCard = document.createElement('div');
        masterCard.className = 'master-card';
        masterCard.innerHTML = `
            <div class="master-photo">
                ${photo ? `<img src="${photo}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                    <i class="fas fa-user-plus"></i>
                    <span class="add-photo">${name}</span>
                `}
            </div>
            <div class="master-info">
                <h3>${name}</h3>
                <p class="master-title">${title}</p>
                <p class="master-belt">${belt}</p>
                <p class="master-experience">${experience}</p>
            </div>
        `;
        
        const gallery = document.querySelector('.masters-gallery');
        if (gallery) {
            gallery.appendChild(masterCard);
            
            // Add edit button for admin
            if (sessionStorage.getItem('isAdmin') === 'true') {
                const editBtn = document.createElement('div');
                editBtn.className = 'edit-photo-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.title = 'Edit Photo';
                editBtn.onclick = function() {
                    editMasterPhoto(masterCard);
                };
                masterCard.querySelector('.master-photo').appendChild(editBtn);
            }
        }
        
        closeAddMasterModal();
        document.getElementById('addMasterForm').reset();
        alert('Master added successfully!');
    }
}

// Edit Master Photo
function editMasterPhoto(btn) {
    // Handle both cases - passing button element or masterCard object
    let masterCard;
    if (btn instanceof HTMLElement) {
        masterCard = btn.closest('.master-card');
    } else {
        masterCard = btn;
    }
    
    if (!masterCard) return;
    
    const newPhoto = prompt('Enter new photo URL or click Cancel to upload a file:');
    if (newPhoto) {
        updateMasterPhoto(masterCard, newPhoto);
    }
}

// Update master photo
function updateMasterPhoto(masterCard, photoUrl) {
    const photoDiv = masterCard.querySelector('.master-photo');
    if (photoDiv) {
        const actionsDiv = photoDiv.querySelector('.admin-photo-actions');
        photoDiv.innerHTML = `
            <img src="${photoUrl}" alt="Master" style="width: 100%; height: 100%; object-fit: cover;">
        `;
        // Re-add the actions buttons
        if (actionsDiv) {
            photoDiv.appendChild(actionsDiv);
        }
    }
    alert('Photo updated successfully!');
}

// Delete Master Photo
function deleteMasterPhoto(btn) {
    const masterCard = btn.closest('.master-card');
    if (!masterCard) return;
    
    if (confirm('Are you sure you want to delete this master profile?')) {
        masterCard.remove();
        alert('Master profile deleted successfully!');
    }
}

// Add Awarded Photo Form Handler
function addAwardedPhoto(e) {
    e.preventDefault();
    
    const title = document.getElementById('awardedTitle').value;
    const date = document.getElementById('awardedDate').value;
    const description = document.getElementById('awardedDescription').value;
    const photoInput = document.getElementById('awardedPhoto');
    
    let photoData = null;
    if (photoInput && photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoData = e.target.result;
            saveAndDisplayAwardedPhoto(title, date, description, photoData);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveAndDisplayAwardedPhoto(title, date, description, photoData);
    }
    
    function saveAndDisplayAwardedPhoto(title, date, description, photo) {
        saveAwardedPhoto(title, date, description, photo);
        
        const awardedCard = document.createElement('div');
        awardedCard.className = 'awarded-card';
        awardedCard.innerHTML = `
            <div class="awarded-photo">
                ${photo ? `<img src="${photo}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                    <i class="fas fa-certificate"></i>
                    <span class="add-photo">${title}</span>
                `}
            </div>
            <div class="awarded-info">
                <h3>${title}</h3>
                <p class="awarded-date">Date: ${date}</p>
                <p class="awarded-description">${description}</p>
            </div>
        `;
        
        const gallery = document.querySelector('.awarded-gallery');
        if (gallery) {
            gallery.appendChild(awardedCard);
        }
        
        closeAddAwardedPhotoModal();
        document.getElementById('addAwardedPhotoForm').reset();
        alert('Award photo added successfully!');
    }
}

// Save awarded photo to localStorage
function saveAwardedPhoto(title, date, description, photo) {
    let awardedPhotos = JSON.parse(localStorage.getItem('karateAwardedPhotos') || '[]');
    awardedPhotos.push({
        title,
        date,
        description,
        photo,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('karateAwardedPhotos', JSON.stringify(awardedPhotos));
}

// Load Masters from localStorage
function loadMasters() {
    const savedMasters = localStorage.getItem('karateMasters');
    if (savedMasters) {
        const masters = JSON.parse(savedMasters);
        const gallery = document.querySelector('.masters-gallery');
        
        if (gallery) {
            masters.forEach(master => {
                const masterCard = document.createElement('div');
                masterCard.className = 'master-card';
                masterCard.innerHTML = `
                    <div class="master-photo">
                        ${master.photo ? `<img src="${master.photo}" alt="${master.name}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                            <i class="fas fa-user-plus"></i>
                            <span class="add-photo">${master.name}</span>
                        `}
                    </div>
                    <div class="master-info">
                        <h3>${master.name}</h3>
                        <p class="master-title">${master.title}</p>
                        <p class="master-belt">${master.belt}</p>
                        <p class="master-experience">${master.experience}</p>
                    </div>
                `;
                gallery.appendChild(masterCard);
            });
        }
    }
}

// Initialize masters on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMasters();
    loadAwardedPhotos();
    initializeAdminFeatures();
});

// Load Awarded Photos from localStorage
function loadAwardedPhotos() {
    const savedPhotos = localStorage.getItem('karateAwardedPhotos');
    if (savedPhotos) {
        const photos = JSON.parse(savedPhotos);
        const gallery = document.querySelector('.awarded-gallery');
        
        if (gallery) {
            // Clear existing placeholders
            gallery.innerHTML = '';
            
            photos.forEach(photo => {
                const awardedCard = document.createElement('div');
                awardedCard.className = 'awarded-card';
                awardedCard.innerHTML = `
                    <div class="awarded-photo">
                        ${photo.photo ? `<img src="${photo.photo}" alt="${photo.title}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                            <i class="fas fa-certificate"></i>
                            <span class="add-photo">${photo.title}</span>
                        `}
                    </div>
                    <div class="awarded-info">
                        <h3>${photo.title}</h3>
                        <p class="awarded-date">Date: ${photo.date}</p>
                        <p class="awarded-description">${photo.description}</p>
                    </div>
                `;
                gallery.appendChild(awardedCard);
            });
        }
    }
}

// ============ MEMBERSHIP SYSTEM ============

// Initialize membership system
function initializeMembership() {
    const isGuest = sessionStorage.getItem('isGuest') === 'true';
    
    // Hide membership navigation link and section for guests
    if (isGuest) {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === '#membership') {
                link.parentElement.style.display = 'none';
            }
        });
        
        // Hide membership section
        const membershipSection = document.getElementById('membership');
        if (membershipSection) {
            membershipSection.style.display = 'none';
        }
    }
    
    // Get user's membership level (default to free)
    let userMembership = sessionStorage.getItem('membershipLevel');
    
    if (!userMembership) {
        // Set default to free for new users
        userMembership = 'free';
        sessionStorage.setItem('membershipLevel', 'free');
    }
    
    // Update membership badge
    updateMembershipBadge(userMembership);
    
    // Update video locks based on membership
    updateVideoLocks(userMembership);
    
    // Update membership cards to show current plan
    updateMembershipCards(userMembership);
}

// Update membership badge display
function updateMembershipBadge(level) {
    const isGuest = sessionStorage.getItem('isGuest') === 'true';
    
    if (isGuest) {
        // Hide membership badge for guests
        const badge = document.getElementById('currentMembershipBadge');
        if (badge) {
            badge.style.display = 'none';
        }
        return;
    }
    
    const badge = document.getElementById('currentMembershipBadge');
    if (badge) {
        badge.textContent = getMembershipLabel(level) + ' Member';
        badge.className = 'membership-badge ' + level;
    }
}

// Get membership label
function getMembershipLabel(level) {
    const labels = {
        'free': 'Free',
        'bronze': 'Bronze',
        'silver': 'Silver',
        'gold': 'Gold',
        'emerald': 'Emerald'
    };
    return labels[level] || 'Free';
}

// Update video locks based on membership level
function updateVideoLocks(userMembership) {
    const videoCards = document.querySelectorAll('.video-card');
    const userLevel = MEMBERSHIP_LEVELS[userMembership] || 0;
    const isGuest = sessionStorage.getItem('isGuest') === 'true';
    
    videoCards.forEach(card => {
        const videoMembership = card.getAttribute('data-membership');
        const videoLevel = MEMBERSHIP_LEVELS[videoMembership] || 0;
        const lockOverlay = card.querySelector('.lock-overlay');
        
        if (lockOverlay) {
            if (isGuest) {
                // Guest user - show login prompt for all videos
                card.classList.add('locked');
                card.classList.remove('unlocked');
                lockOverlay.style.display = 'flex';
                lockOverlay.innerHTML = `
                    <div class="lock-icon">
                        <i class="fas fa-user-lock"></i>
                    </div>
                    <p>Login to Watch</p>
                `;
                
                card.querySelector('.video-thumbnail').onclick = function() {
                    alert('👋 Guest Access\n\nPlease login or sign up to watch videos.\n\nAs a guest, you can only view photos.');
                };
            } else if (userLevel >= videoLevel) {
                // User has access - remove lock
                card.classList.add('unlocked');
                card.classList.remove('locked');
                lockOverlay.style.display = 'none';
                
                // Enable click to play
                card.querySelector('.video-thumbnail').onclick = function() {
                    playVideo(card);
                };
            } else {
                // User doesn't have access - show lock
                card.classList.add('locked');
                card.classList.remove('unlocked');
                lockOverlay.style.display = 'flex';
                
                // Disable click and show upgrade prompt
                card.querySelector('.video-thumbnail').onclick = function() {
                    showUpgradePrompt(videoMembership, card);
                };
            }
        }
    });
}

// Play video (for unlocked videos)
function playVideo(card) {
    const title = card.querySelector('.video-info h3').textContent;
    alert(`Playing: ${title}\n\n(In a real application, this would open a video player)`);
}

// Edit video
function editVideo(videoId) {
    const videoCard = document.querySelector(`.video-card[data-video-id="${videoId}"]`);
    if (!videoCard) return;
    
    const title = videoCard.querySelector('.video-info h3').textContent;
    const description = videoCard.querySelector('.video-info p').textContent;
    const category = videoCard.getAttribute('data-category');
    const membership = videoCard.getAttribute('data-membership');
    
    const newTitle = prompt('Edit Video Title:', title);
    if (newTitle && newTitle !== title) {
        videoCard.querySelector('.video-info h3').textContent = newTitle;
        alert('Video title updated!');
    }
}

// Delete video
function deleteVideo(videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        const videoCard = document.querySelector(`.video-card[data-video-id="${videoId}"]`);
        if (videoCard) {
            videoCard.remove();
            alert('Video deleted successfully!');
        }
    }
}

// Security key validation patterns
const KEY_PATTERNS = {
    'bronze': /^KK\d{3}$/, // KK + 3 digits (100-999)
    'silver': /^KK\d{3}$/, // KK + 3 digits (444-777)
    'gold': /^KK\d{2}$/,   // KK + 2 digits (88-99)
    'emerald': /^KK\d{1}$/ // KK + 1 digit (0-9)
};

// Validate security key using admin-defined settings
function validateSecurityKey(key, membershipLevel) {
    const settings = getKeySettings();
    const levelSettings = settings[membershipLevel];
    
    if (!levelSettings || levelSettings.status !== 'active') return false;
    
    // Check prefix
    if (!key.startsWith(levelSettings.prefix)) return false;
    
    // Check length
    const numPart = key.substring(levelSettings.prefix.length);
    if (numPart.length !== levelSettings.length) return false;
    
    // Check if numeric
    if (!/^\d+$/.test(numPart)) return false;
    
    // Check range
    const numValue = parseInt(numPart);
    return numValue >= levelSettings.min && numValue <= levelSettings.max;
}

// Show security key prompt for locked videos - Open upgrade modal
function showUpgradePrompt(requiredMembership, card) {
    const pricing = getPricingSettings();
    const plan = pricing[requiredMembership];
    const price = plan ? plan.price : 0;
    const discount = plan ? plan.discount : 0;
    const finalPrice = discount > 0 ? price - Math.round(price * (discount / 100)) : price;
    
    // Store the card for later use
    sessionStorage.setItem('upgradeVideoCard', card.getAttribute('data-video-id'));
    sessionStorage.setItem('upgradeRequiredMembership', requiredMembership);
    
    // Open upgrade modal
    openVideoUnlockModal(requiredMembership, finalPrice, price, discount);
}

// Open Video Unlock Modal
function openVideoUnlockModal(requiredMembership, price, originalPrice, discount) {
    const modal = document.getElementById('videoUnlockModal');
    if (!modal) {
        createVideoUnlockModal();
    }
    
    const requiredLabel = getMembershipLabel(requiredMembership);
    
    // Get pricing from settings
    const pricing = getPricingSettings();
    const plan = pricing[requiredMembership];
    const planPrice = plan ? plan.price : 1500;
    const planDiscount = plan ? plan.discount : 0;
    const finalPrice = planDiscount > 0 ? planPrice - Math.round(planPrice * (planDiscount / 100)) : planPrice;
    
    // Store required membership for redirect
    sessionStorage.setItem('upgradeRequiredMembership', requiredMembership);
    
    // Update modal content
    document.getElementById('unlockRequiredMembership').textContent = requiredLabel;
    
    // Update price display
    document.getElementById('unlockPrice').textContent = `₹${finalPrice.toLocaleString()}`;
    
    if (planDiscount > 0) {
        document.getElementById('unlockOriginalPrice').textContent = `₹${planPrice.toLocaleString()}`;
        document.getElementById('unlockDiscount').textContent = `-${planDiscount}%`;
        document.getElementById('unlockDiscount').style.display = 'inline';
    } else {
        document.getElementById('unlockOriginalPrice').textContent = '';
        document.getElementById('unlockDiscount').style.display = 'none';
    }
    
    // Update buy membership text
    const buyTextEl = document.getElementById('buyMembershipText');
    if (buyTextEl) {
        buyTextEl.textContent = `Get full access to all ${requiredLabel} membership features for ₹${finalPrice.toLocaleString()}`;
    }
    
    // Reset key input
    document.getElementById('unlockKey').value = '';
    
    // Show modal
    document.getElementById('videoUnlockModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Create Video Unlock Modal
function createVideoUnlockModal() {
    const modal = document.createElement('div');
    modal.id = 'videoUnlockModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <h2><i class="fas fa-lock"></i> Unlock Video</h2>
                <span class="close-btn" onclick="closeVideoUnlockModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="unlock-info">
                    <p>This video requires <span id="unlockRequiredMembership" class="highlight"></span> membership.</p>
                    <p>Choose an option to unlock:</p>
                </div>
                
                <!-- Option 1: Enter Key -->
                <div class="unlock-option">
                    <h3><i class="fas fa-key"></i> Enter Security Key</h3>
                    <form onsubmit="unlockWithKey(event)">
                        <div class="form-group">
                            <label for="unlockKey">Security Key</label>
                            <input type="text" id="unlockKey" required placeholder="Enter your security key">
                        </div>
                        <button type="submit" class="submit-btn" style="background: #6f42c1;">
                            <i class="fas fa-unlock"></i> Unlock with Key
                        </button>
                    </form>
                </div>
                
                <!-- Option 2: Buy Now -->
                <div class="unlock-option buy-option">
                    <h3><i class="fas fa-shopping-cart"></i> Buy Membership</h3>
                    <div class="price-display">
                        <span id="unlockOriginalPrice" style="text-decoration: line-through; color: #999; margin-right: 10px;"></span>
                        <span id="unlockPrice" class="highlight" style="font-size: 1.8em;"></span>
                        <span id="unlockDiscount" style="background: #28a745; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; margin-left: 10px;"></span>
                    </div>
                    <p id="buyMembershipText" class="price-note">Get full access to all membership features</p>
                    <button class="submit-btn" style="background: #28a745; width: 100%;" onclick="redirectToMembership()">
                        <i class="fas fa-shopping-cart"></i> View Plans & Buy
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add CSS for unlock modal
    const style = document.createElement('style');
    style.textContent = `
        #videoUnlockModal .unlock-info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 1.1em;
        }
        #videoUnlockModal .unlock-info .highlight {
            color: #28a745;
            font-weight: bold;
        }
        #videoUnlockModal .unlock-option {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 15px 0;
        }
        #videoUnlockModal .unlock-option h3 {
            margin: 0 0 15px;
            font-size: 1.1em;
            color: #333;
        }
        #videoUnlockModal .buy-option {
            border: 2px solid #28a745;
            background: #fff;
        }
        #videoUnlockModal .price-display {
            text-align: center;
            margin: 15px 0;
        }
        #videoUnlockModal .price-note {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-bottom: 15px;
        }
        #videoUnlockModal .close-btn {
            cursor: pointer;
            font-size: 28px;
            font-weight: bold;
            color: #aaa;
            float: right;
            line-height: 20px;
        }
        #videoUnlockModal .close-btn:hover {
            color: #000;
        }
    `;
    document.head.appendChild(style);
}

// Unlock with Key
function unlockWithKey(e) {
    e.preventDefault();
    
    const key = document.getElementById('unlockKey').value.trim();
    if (!key) return;
    
    const requiredMembership = sessionStorage.getItem('upgradeRequiredMembership');
    
    // Validate the key
    const validation = validateKey(key);
    if (!validation.valid) {
        alert('❌ Invalid Key\n\n' + validation.message);
        return;
    }
    
    // Key is valid, upgrade membership
    const requiredLabel = getMembershipLabel(requiredMembership);
    
    // Mark key as used
    markKeyAsUsed(key);
    
    // Update membership
    sessionStorage.setItem('membershipLevel', requiredMembership);
    
    // Update user data if logged in
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail && userEmail !== 'guest') {
        const users = getUsers();
        if (users[userEmail]) {
            users[userEmail].membership = requiredMembership;
            users[userEmail].key = key;
            saveUsers(users);
        }
    }
    
    // Update UI
    updateMembershipBadge(requiredMembership);
    updateVideoLocks(requiredMembership);
    updateMembershipCards(requiredMembership);
    
    // Close modal
    closeVideoUnlockModal();
    
    // Show success message
    alert(`✅ Key Accepted!\n\n🎉 Congratulations! You now have ${requiredLabel} membership.\n\nYour current membership: ${requiredLabel}\n\nYou can now access all ${requiredLabel} videos and below!`);
    
    // Try to play the video
    const videoId = sessionStorage.getItem('upgradeVideoCard');
    if (videoId) {
        const card = document.querySelector(`.video-card[data-video-id="${videoId}"]`);
        if (card) {
            setTimeout(() => {
                playVideo(card);
            }, 500);
        }
    }
}

// Buy Membership - Redirect to membership section
function buyMembership() {
    // This function is now replaced by redirectToMembership
}

// Redirect to Membership Section
function redirectToMembership() {
    closeVideoUnlockModal();
    
    // Scroll to membership section
    const membershipSection = document.querySelector('.pricing-section') || document.querySelector('.membership-section');
    if (membershipSection) {
        membershipSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Try to find by ID
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Close Video Unlock Modal
function closeVideoUnlockModal() {
    const modal = document.getElementById('videoUnlockModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============ ADMIN KEY MANAGEMENT ============

// Initialize admin features
function initializeAdminFeatures() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const isGuest = sessionStorage.getItem('isGuest') === 'true';
    
    if (isGuest) {
        // Hide membership section for guests
        const membershipSection = document.getElementById('membership');
        if (membershipSection) {
            membershipSection.style.display = 'none';
        }
        
        // Hide key management section for guests
        const adminSection = document.getElementById('admin-keys');
        if (adminSection) {
            adminSection.style.display = 'none';
        }
        
        return;
    }
    
    if (isAdmin) {
        // Add is-admin class to body for admin-only UI elements
        document.body.classList.add('is-admin');
        
        // Show admin key management section
        const adminSection = document.getElementById('admin-keys');
        if (adminSection) {
            adminSection.style.display = 'block';
        }
        
        // Load key settings into form
        loadKeySettingsForm();
        
        // Load users list
        loadUsersList();
        
        // Add Members option to profile menu
        addMembersToProfileMenu();
        
        // Give admin full access
        sessionStorage.setItem('membershipLevel', 'emerald');
        updateMembershipBadge('emerald');
        updateVideoLocks('emerald');
        updateMembershipCards('emerald');
        
        // Add admin link to navigation
        addAdminNavLink();
    }
}

// Add admin link to navigation
function addAdminNavLink() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !navLinks.querySelector('.admin-link')) {
        const adminLink = document.createElement('li');
        adminLink.className = 'admin-link';
        adminLink.innerHTML = '<a href="#admin-keys" style="color: #ffd700;">🔐 Admin</a>';
        navLinks.appendChild(adminLink);
    }
}

// Load key settings into form
function loadKeySettingsForm() {
    const settings = getKeySettings();
    
    ['bronze', 'silver', 'gold', 'emerald'].forEach(level => {
        const levelSettings = settings[level];
        if (levelSettings) {
            document.getElementById(`${level}Prefix`).value = levelSettings.prefix;
            document.getElementById(`${level}Min`).value = levelSettings.min;
            document.getElementById(`${level}Max`).value = levelSettings.max;
            document.getElementById(`${level}Length`).value = levelSettings.length;
            document.getElementById(`${level}Status`).value = levelSettings.status;
            
            // Update example
            updateKeyExample(level);
        }
    });
    
    // Update keys list
    updateKeysList();
}

// Update key example display
function updateKeyExample(level) {
    const settings = getKeySettings();
    const levelSettings = settings[level];
    
    if (levelSettings) {
        const exampleEl = document.getElementById(`${level}Example`);
        const midValue = Math.floor((levelSettings.min + levelSettings.max) / 2);
        const numStr = midValue.toString().padStart(levelSettings.length, '0');
        exampleEl.textContent = levelSettings.prefix + numStr;
    }
}

// Save key settings
function saveKeySettings(level) {
    const settings = getKeySettings();
    
    settings[level] = {
        prefix: document.getElementById(`${level}Prefix`).value.toUpperCase(),
        min: parseInt(document.getElementById(`${level}Min`).value),
        max: parseInt(document.getElementById(`${level}Max`).value),
        length: parseInt(document.getElementById(`${level}Length`).value),
        status: document.getElementById(`${level}Status`).value
    };
    
    // Validate settings
    if (settings[level].min > settings[level].max) {
        alert('Error: Minimum value cannot be greater than maximum value!');
        return;
    }
    
    // Save to storage
    saveKeySettingsToStorage(settings);
    
    // Update example
    updateKeyExample(level);
    
    // Update keys list
    updateKeysList();
    
    alert(`${level.charAt(0).toUpperCase() + level.slice(1)} key settings saved successfully!\n\nFormat: ${settings[level].prefix}[X] (Range: ${settings[level].min}-${settings[level].max})`);
}

// Reset to default settings
function resetToDefaults() {
    if (confirm('Are you sure you want to reset all key settings to default values?')) {
        saveKeySettingsToStorage(JSON.parse(JSON.stringify(DEFAULT_KEY_SETTINGS)));
        loadKeySettingsForm();
        alert('Key settings have been reset to defaults!');
    }
}

// Generate test keys
function generateTestKeys() {
    const settings = getKeySettings();
    let message = 'Test Keys Generated:\n\n';
    
    ['bronze', 'silver', 'gold', 'emerald'].forEach(level => {
        const levelSettings = settings[level];
        if (levelSettings && levelSettings.status === 'active') {
            const testNum = Math.floor((levelSettings.min + levelSettings.max) / 2);
            const numStr = testNum.toString().padStart(levelSettings.length, '0');
            const testKey = levelSettings.prefix + numStr;
            message += `${level.charAt(0).toUpperCase() + level.slice(1)}: ${testKey}\n`;
        }
    });
    
    message += '\nCopy these keys to test the video unlock feature!';
    
    // Copy to clipboard
    const keysOnly = message.split('\n').slice(2, -2).join('\n');
    navigator.clipboard.writeText(keysOnly).then(() => {
        alert(message + '\n\n✅ Keys copied to clipboard!');
    }).catch(() => {
        alert(message);
    });
}

// Update the keys list display
function updateKeysList() {
    const settings = getKeySettings();
    const keysList = document.getElementById('keysList');
    
    if (!keysList) return;
    
    let html = '';
    
    ['bronze', 'silver', 'gold', 'emerald'].forEach(level => {
        const levelSettings = settings[level];
        if (levelSettings) {
            const midValue = Math.floor((levelSettings.min + levelSettings.max) / 2);
            const numStr = midValue.toString().padStart(levelSettings.length, '0');
            const testKey = levelSettings.prefix + numStr;
            
            html += `
                <div class="key-item">
                    <h4>${level.charAt(0).toUpperCase() + level.slice(1)}</h4>
                    <div class="key-value">${testKey}</div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: ${levelSettings.status === 'active' ? '#50c878' : '#dc3545'}">
                        ${levelSettings.status.toUpperCase()}
                    </div>
                </div>
            `;
        }
    });
    
    keysList.innerHTML = html;
}

// ============ USER MEMBERSHIP MANAGEMENT ============

// Get all users from storage
function getUsers() {
    const saved = localStorage.getItem('karateUsers');
    if (saved) {
        return JSON.parse(saved);
    }
    return {};
}

// Save users to storage
function saveUsers(users) {
    localStorage.setItem('karateUsers', JSON.stringify(users));
}

// Register a new user
function registerUser(email, membership = 'free') {
    const users = getUsers();
    
    if (users[email]) {
        return false; // User already exists
    }
    
    users[email] = {
        email: email,
        membership: membership,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    saveUsers(users);
    return true;
}

// Update user membership
function updateUserMembership(email, newMembership) {
    const users = getUsers();
    
    if (!users[email]) {
        return false;
    }
    
    users[email].membership = newMembership;
    users[email].updatedAt = new Date().toISOString();
    
    saveUsers(users);
    return true;
}

// Admin upgrade/change user membership
function adminUpgradeUser() {
    const emailInput = document.getElementById('adminUserEmail');
    const membershipSelect = document.getElementById('adminUserMembership');
    
    const email = emailInput.value.trim().toLowerCase();
    const newMembership = membershipSelect.value;
    
    if (!email) {
        alert('Please enter a user email/username!');
        return;
    }
    
    const users = getUsers();
    
    if (users[email]) {
        // User exists, update membership
        const oldMembership = users[email].membership;
        updateUserMembership(email, newMembership);
        
        alert(`✅ Membership Updated!\n\nUser: ${email}\nOld Membership: ${oldMembership.charAt(0).toUpperCase() + oldMembership.slice(1)}\nNew Membership: ${newMembership.charAt(0).toUpperCase() + newMembership.slice(1)}`);
        
        // Refresh users list
        loadUsersList();
        
        // Clear input
        emailInput.value = '';
    } else {
        // User doesn't exist, create new user with specified membership
        const users = getUsers();
        users[email] = {
            email: email,
            membership: newMembership,
            createdAt: new Date().toISOString(),
            status: 'active',
            createdBy: 'admin'
        };
        saveUsers(users);
        
        alert(`✅ User Created!\n\nNew user has been registered with ${newMembership.charAt(0).toUpperCase() + newMembership.slice(1)} membership.\n\nUser: ${email}\nMembership: ${newMembership.charAt(0).toUpperCase() + newMembership.slice(1)}`);
        
        // Refresh users list
        loadUsersList();
        
        // Clear input
        emailInput.value = '';
    }
}

// Load users list in admin panel
function loadUsersList() {
    const users = getUsers();
    const usersListBody = document.getElementById('usersListBody');
    
    if (!usersListBody) return;
    
    const userEmails = Object.keys(users);
    
    if (userEmails.length === 0) {
        usersListBody.innerHTML = '<div class="no-users">No users registered yet.</div>';
        return;
    }
    
    let html = '';
    
    userEmails.forEach(email => {
        const user = users[email];
        html += `
            <div class="user-row">
                <span class="user-email">${user.email}</span>
                <span class="user-membership ${user.membership}">${user.membership}</span>
                <span class="user-status ${user.status === 'inactive' ? 'inactive' : ''}">${user.status}</span>
                <button class="action-btn edit-membership-btn" onclick="quickEditMembership('${user.email}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        `;
    });
    
    usersListBody.innerHTML = html;
}

// Quick edit membership for a user
function quickEditMembership(email) {
    const users = getUsers();
    const user = users[email];
    
    if (!user) return;
    
    const newMembership = prompt(`Edit membership for ${email}:\n\nCurrent: ${user.membership}\n\nEnter new membership:\n- free\n- bronze\n- silver\n- gold\n- emerald`);
    
    if (newMembership && ['free', 'bronze', 'silver', 'gold', 'emerald'].includes(newMembership.toLowerCase())) {
        updateUserMembership(email, newMembership.toLowerCase());
        alert(`✅ ${email}'s membership updated to ${newMembership.toUpperCase()}`);
        loadUsersList();
    } else if (newMembership) {
        alert('Invalid membership level! Please enter: free, bronze, silver, gold, or emerald');
    }
}

// Initialize user on login
function initializeUserOnLogin(email) {
    const users = getUsers();
    
    // If user doesn't exist, register them with free membership
    if (!users[email.toLowerCase()]) {
        registerUser(email.toLowerCase(), 'free');
    }
    
    // Set current user's membership in session
    const user = users[email.toLowerCase()];
    if (user) {
        sessionStorage.setItem('membershipLevel', user.membership);
    }
}

// ============ MEMBERS MANAGEMENT FROM PROFILE ============

// Add Members option to admin profile menu
function addMembersToProfileMenu() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const profileMenu = document.getElementById('profileMenu');
    
    if (isAdmin && profileMenu) {
        // Check if Members option already exists
        if (!profileMenu.querySelector('.members-menu-item')) {
            const membersLi = document.createElement('li');
            membersLi.className = 'members-menu-item';
            membersLi.innerHTML = '<a href="#" onclick="openMembersModal(); return false;"><i class="fas fa-users"></i> Members</a>';
            
            // Insert before logout
            const logoutLi = profileMenu.querySelector('li:last-child');
            profileMenu.insertBefore(membersLi, logoutLi);
        }
    }
}

// Open Members Modal
function openMembersModal() {
    const modal = document.getElementById('membersModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Load members list
        loadMembersList();
        
        // Close dropdown
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
}

// Show Members from profile menu
function showMembers() {
    openMembersModal();
}

// Close Members Modal
function closeMembersModal() {
    const modal = document.getElementById('membersModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
const membersModal = document.getElementById('membersModal');
if (membersModal) {
    membersModal.addEventListener('click', function(e) {
        if (e.target === membersModal) {
            closeMembersModal();
        }
    });
}

// Add New Member
function addNewMember(e) {
    e.preventDefault();
    
    const name = document.getElementById('memberName').value.trim();
    const email = document.getElementById('memberEmail').value.trim().toLowerCase();
    const key = document.getElementById('memberKey').value.trim().toUpperCase();
    const membership = document.getElementById('memberMembership').value;
    
    // Check if key is provided
    if (!key) {
        alert('Please enter a security key for this member.');
        return;
    }
    
    // Validate the key
    const validation = validateKey(key);
    if (!validation.valid) {
        alert('❌ Invalid Key\n\n' + validation.message);
        return;
    }
    
    // Check if user already exists
    const users = getUsers();
    if (users[email]) {
        alert('A member with this email already exists!');
        return;
    }
    
    // Mark the key as used
    markKeyAsUsed(key);
    
    // Create new member
    users[email] = {
        name: name,
        email: email,
        key: key,
        membership: membership,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    saveUsers(users);
    
    alert(`✅ Member Added Successfully!\n\nName: ${name}\nEmail: ${email}\nKey: ${key}\nMembership: ${membership}\n\nShare the key with the member to unlock their membership!`);
    
    // Reset form
    document.getElementById('addMemberForm').reset();
    
    // Refresh members list
    loadMembersList();
}

// Load Members List in Modal
function loadMembersList() {
    const users = getUsers();
    const membersList = document.getElementById('membersList');
    
    if (!membersList) return;
    
    const userEmails = Object.keys(users);
    
    if (userEmails.length === 0) {
        membersList.innerHTML = '<div class="no-members">No members registered yet.</div>';
        return;
    }
    
    let html = '';
    
    userEmails.forEach(email => {
        const user = users[email];
        const isBlocked = user.status === 'inactive';
        const statusClass = isBlocked ? 'blocked' : 'active';
        const statusText = isBlocked ? 'Blocked' : 'Active';
        const blockBtnText = isBlocked ? 'Unblock' : 'Block';
        const blockBtnClass = isBlocked ? 'unblock-member-btn' : 'block-member-btn';
        
        html += `
            <div class="member-item">
                <div class="member-info">
                    <span class="member-name">${user.name || user.email}</span>
                    <span class="member-email">${user.email}</span>
                    <span class="member-status ${statusClass}">${statusText}</span>
                </div>
                <div class="member-key-box">
                    <span class="member-level ${user.membership}">${user.membership}</span>
                    <span class="member-key">${user.key || 'N/A'}</span>
                </div>
                <div class="member-actions">
                    <button class="copy-key-btn" onclick="copyMemberKey('${user.key || ''}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="upgrade-member-btn" onclick="upgradeMemberMembership('${email}')">
                        <i class="fas fa-arrow-up"></i> Upgrade
                    </button>
                    <button class="${blockBtnClass}" onclick="toggleMemberStatus('${email}')">
                        <i class="fas fa-${isBlocked ? 'check' : 'ban'}"></i> ${blockBtnText}
                    </button>
                    <button class="delete-member-btn" onclick="deleteMember('${email}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    membersList.innerHTML = html;
}

// Delete member
function deleteMember(email) {
    const users = getUsers();
    const user = users[email];
    
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete member: ${user.name || email}?\n\nThis action cannot be undone!`)) {
        delete users[email];
        saveUsers(users);
        
        alert('✅ Member deleted successfully!');
        loadMembersList();
    }
}

// Copy member key to clipboard
function copyMemberKey(key) {
    if (!key) {
        alert('No key assigned to this member.');
        return;
    }
    navigator.clipboard.writeText(key).then(() => {
        alert(`Key "${key}" copied to clipboard!`);
    }).catch(() => {
        prompt('Copy this key:', key);
    });
}

// Upgrade member membership
function upgradeMemberMembership(email) {
    const users = getUsers();
    const user = users[email];
    
    if (!user) return;
    
    // Membership upgrade order
    const levels = ['free', 'bronze', 'silver', 'gold', 'emerald'];
    const currentIndex = levels.indexOf(user.membership);
    const nextIndex = Math.min(currentIndex + 1, levels.length - 1);
    const newMembership = levels[nextIndex];
    
    if (nextIndex === currentIndex) {
        alert(`${user.name || email} already has the highest membership level (Emerald)!`);
        return;
    }
    
    if (confirm(`Upgrade ${user.name || email} from ${user.membership} to ${newMembership}?`)) {
        users[email].membership = newMembership;
        users[email].upgradedAt = new Date().toISOString();
        saveUsers(users);
        
        alert(`✅ Membership Upgraded!\n\n${user.name || email} is now a ${newMembership} member!`);
        loadMembersList();
        
        // Also update user's session if they're currently logged in
        const currentUserEmail = sessionStorage.getItem('userEmail');
        if (currentUserEmail === email) {
            sessionStorage.setItem('membershipLevel', newMembership);
            updateMembershipBadge(newMembership);
            updateVideoLocks(newMembership);
            updateMembershipCards(newMembership);
        }
    }
}

// Toggle member status (block/unblock)
function toggleMemberStatus(email) {
    const users = getUsers();
    const user = users[email];
    
    if (!user) return;
    
    const isBlocking = user.status !== 'inactive';
    const action = isBlocking ? 'Block' : 'Unblock';
    
    if (confirm(`${action} ${user.name || email}?\n\n${isBlocking ? 'This will prevent them from logging in.' : 'This will allow them to login again.'}`)) {
        users[email].status = isBlocking ? 'inactive' : 'active';
        users[email].statusChangedAt = new Date().toISOString();
        saveUsers(users);
        
        alert(`${action === 'Block' ? '🚫 Member blocked!' : '✅ Member unblocked!'}\n\n${user.name || email} has been ${isBlocking ? 'blocked' : 'unblocked'}.`);
        loadMembersList();
    }
}

// Update membership cards to show current plan
function updateMembershipCards(currentMembership) {
    const cards = document.querySelectorAll('.membership-card');
    
    cards.forEach(card => {
        const cardLevel = card.classList[1]; // Second class is the membership level
        const btn = card.querySelector('.membership-btn');
        
        if (cardLevel === currentMembership) {
            btn.textContent = 'Current Plan';
            btn.classList.add('current');
            btn.classList.remove('membership-btn'); // Remove click handler
        } else {
            const cardLevelNum = MEMBERSHIP_LEVELS[cardLevel] || 0;
            const currentLevelNum = MEMBERSHIP_LEVELS[currentMembership] || 0;
            
            if (cardLevelNum <= currentLevelNum) {
                btn.textContent = 'Downgrade';
            } else {
                btn.textContent = 'Upgrade to ' + getMembershipLabel(cardLevel);
            }
        }
    });
}

// Select/Upgrade membership - Open purchase modal
function selectMembership(level) {
    const currentMembership = sessionStorage.getItem('membershipLevel') || 'free';
    
    if (level === currentMembership) {
        alert('You are already on this plan!');
        return;
    }
    
    // Get pricing for the selected level from settings
    const pricing = getPricingSettings();
    const plan = pricing[level];
    const price = plan ? plan.price : 0;
    const discount = plan ? plan.discount : 0;
    const finalPrice = discount > 0 ? price - Math.round(price * (discount / 100)) : price;
    
    // Store for purchase
    sessionStorage.setItem('purchaseLevel', level);
    sessionStorage.setItem('purchasePrice', finalPrice);
    sessionStorage.setItem('purchaseOriginalPrice', price);
    sessionStorage.setItem('purchaseDiscount', discount);
    
    // Open purchase modal
    openPurchaseModal(level, finalPrice, price, discount);
}

// Open Purchase Modal
function openPurchaseModal(level, finalPrice, originalPrice, discount) {
    const modal = document.getElementById('purchaseModal');
    if (!modal) {
        createPurchaseModal();
    }
    
    // Store purchase details
    sessionStorage.setItem('purchaseLevel', level);
    sessionStorage.setItem('purchasePrice', finalPrice);
    
    // Update modal content
    document.getElementById('purchaseLevelName').textContent = getMembershipLabel(level);
    document.getElementById('purchasePrice').textContent = `₹${finalPrice.toLocaleString()}`;
    document.getElementById('upiAmount').textContent = `₹${finalPrice.toLocaleString()}`;
    
    if (discount > 0) {
        document.getElementById('purchaseOriginalPrice').textContent = `₹${originalPrice.toLocaleString()}`;
        document.getElementById('purchaseDiscount').textContent = `-${discount}%`;
        document.getElementById('purchaseDiscount').style.display = 'inline';
    } else {
        document.getElementById('purchaseOriginalPrice').textContent = '';
        document.getElementById('purchaseDiscount').style.display = 'none';
    }
    
    // Reset payment form
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCVV').value = '';
    document.getElementById('cardName').value = '';
    
    // Hide confirmation section
    document.getElementById('paymentSection').style.display = 'block';
    document.getElementById('confirmationSection').style.display = 'none';
    
    document.getElementById('purchaseModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Create Purchase Modal
function createPurchaseModal() {
    const modal = document.createElement('div');
    modal.id = 'purchaseModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2><i class="fas fa-shopping-cart"></i> Purchase Membership</h2>
                <span class="close-btn" onclick="closePurchaseModal()">&times;</span>
            </div>
            <div class="modal-body">
                <!-- Order Summary -->
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <div class="order-item">
                        <span>Membership Plan:</span>
                        <span id="purchaseLevelName" class="highlight"></span>
                    </div>
                    <div class="order-item">
                        <span>Price:</span>
                        <span>
                            <span id="purchaseOriginalPrice" style="text-decoration: line-through; color: #999; margin-right: 10px;"></span>
                            <span id="purchasePrice" class="highlight" style="font-size: 1.5em;"></span>
                            <span id="purchaseDiscount" style="background: #28a745; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; margin-left: 10px;"></span>
                        </span>
                    </div>
                </div>
                
                <!-- Payment Section -->
                <div id="paymentSection" class="payment-section">
                    <h3><i class="fas fa-credit-card"></i> Payment Details</h3>
                    
                    <!-- UPI Payment Option -->
                    <div class="payment-option upi-payment">
                        <h4><i class="fas fa-mobile-alt"></i> Pay via UPI</h4>
                        <p>UPI ID: <strong id="upiId">9047424116@ybl</strong></p>
                        <p>Amount: <strong id="upiAmount" style="font-size: 1.2em; color: #28a745;"></strong></p>
                        <button type="button" class="submit-btn" style="background: #5f27cd; width: 100%;" onclick="payWithUPI()">
                            <i class="fas fa-external-link-alt"></i> Open UPI App
                        </button>
                    </div>
                    
                    <div class="divider">
                        <span>OR</span>
                    </div>
                    
                    <!-- Card Payment Option -->
                    <form onsubmit="processPayment(event)">
                        <div class="form-group">
                            <label for="cardName">Cardholder Name</label>
                            <input type="text" id="cardName" required placeholder="Name on card">
                        </div>
                        <div class="form-group">
                            <label for="cardNumber">Card Number</label>
                            <input type="text" id="cardNumber" required placeholder="1234 5678 9012 3456" maxlength="19">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cardExpiry">Expiry Date</label>
                                <input type="text" id="cardExpiry" required placeholder="MM/YY" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label for="cardCVV">CVV</label>
                                <input type="text" id="cardCVV" required placeholder="123" maxlength="4">
                            </div>
                        </div>
                        <button type="submit" class="submit-btn" style="width: 100%; margin-top: 20px;">
                            <i class="fas fa-lock"></i> Pay with Card
                        </button>
                    </form>
                </div>
                
                <!-- Confirmation Section -->
                <div id="confirmationSection" class="confirmation-section" style="display: none;">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Order Confirmed!</h3>
                    <p>Your membership has been upgraded successfully.</p>
                    <div class="order-details">
                        <p><strong>Plan:</strong> <span id="confirmPlan"></span></p>
                        <p><strong>Amount Paid:</strong> <span id="confirmAmount"></span></p>
                        <p><strong>Order ID:</strong> <span id="confirmOrderId"></span></p>
                    </div>
                    <button class="submit-btn" onclick="closePurchaseModal()">Continue</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add CSS for purchase modal
    const style = document.createElement('style');
    style.textContent = `
        #purchaseModal .order-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        #purchaseModal .order-summary h3 {
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        #purchaseModal .order-item {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 1.1em;
        }
        #purchaseModal .order-item .highlight {
            color: #28a745;
            font-weight: bold;
        }
        #purchaseModal .payment-section h3,
        #purchaseModal .confirmation-section h3 {
            margin: 20px 0 15px;
        }
        #purchaseModal .form-row {
            display: flex;
            gap: 15px;
        }
        #purchaseModal .form-row .form-group {
            flex: 1;
        }
        #purchaseModal .success-icon {
            text-align: center;
            font-size: 60px;
            color: #28a745;
            margin-bottom: 20px;
        }
        #purchaseModal .confirmation-section {
            text-align: center;
        }
        #purchaseModal .order-details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
        #purchaseModal .order-details p {
            margin: 8px 0;
        }
        #purchaseModal .upi-payment {
            background: #e8f5e9;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #4caf50;
            margin-bottom: 20px;
        }
        #purchaseModal .upi-payment h4 {
            color: #2e7d32;
            margin-bottom: 15px;
        }
        #purchaseModal .upi-payment p {
            margin: 10px 0;
        }
        #purchaseModal .divider {
            display: flex;
            align-items: center;
            margin: 20px 0;
        }
        #purchaseModal .divider::before,
        #purchaseModal .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #ddd;
        }
        #purchaseModal .divider span {
            padding: 0 15px;
            color: #999;
            font-size: 0.9em;
        }
        #purchaseModal .close-btn {
            cursor: pointer;
            font-size: 28px;
            font-weight: bold;
            color: #aaa;
            float: right;
            line-height: 20px;
        }
        #purchaseModal .close-btn:hover {
            color: #000;
        }
    `;
    document.head.appendChild(style);
}

// Process Payment
function processPayment(e) {
    e.preventDefault();
    
    const cardName = document.getElementById('cardName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    
    // Basic validation
    if (!cardName || !cardNumber || !cardExpiry || !cardCVV) {
        alert('Please fill in all payment details');
        return;
    }
    
    // Simulate payment processing
    const level = sessionStorage.getItem('purchaseLevel');
    const price = sessionStorage.getItem('purchasePrice');
    const orderId = 'ORD-' + Date.now();
    
    // Show confirmation
    document.getElementById('paymentSection').style.display = 'none';
    document.getElementById('confirmationSection').style.display = 'block';
    
    document.getElementById('confirmPlan').textContent = getMembershipLabel(level);
    document.getElementById('confirmAmount').textContent = `₹${parseInt(price).toLocaleString()}`;
    document.getElementById('confirmOrderId').textContent = orderId;
    
    // Complete the upgrade
    completeMembershipUpgrade(level);
}

// Pay with UPI
function payWithUPI() {
    const price = sessionStorage.getItem('purchasePrice');
    const level = sessionStorage.getItem('purchaseLevel');
    const upiId = '9047424116@ybl';
    const note = `Karate Academy - ${getMembershipLabel(level)} Membership`;
    
    // Create UPI deep link
    const upiLink = `upi://pay?pa=${upiId}&pn=Karate%20Academy&am=${price}&tn=${encodeURIComponent(note)}`;
    
    // Open UPI app
    window.location.href = upiLink;
    
    // Show confirmation dialog after delay
    setTimeout(() => {
        const confirmPayment = confirm('Did you complete the UPI payment?\n\nClick OK to confirm your membership upgrade.\nClick Cancel if payment is pending.');
        if (confirmPayment) {
            completeUPIPayment(level, price);
        }
    }, 2000);
}

// Complete UIP Payment
function completeUPIPayment(level, price) {
    const orderId = 'ORD-' + Date.now();
    
    // Show confirmation
    document.getElementById('paymentSection').style.display = 'none';
    document.getElementById('confirmationSection').style.display = 'block';
    document.getElementById('confirmPlan').textContent = getMembershipLabel(level);
    document.getElementById('confirmAmount').textContent = `₹${parseInt(price).toLocaleString()}`;
    document.getElementById('confirmOrderId').textContent = orderId;
    
    // Complete the upgrade
    completeMembershipUpgrade(level);
}

// Complete Membership Upgrade
function completeMembershipUpgrade(level) {
    const currentMembership = sessionStorage.getItem('membershipLevel') || 'free';
    const currentLevelNum = MEMBERSHIP_LEVELS[currentMembership] || 0;
    const newLevelNum = MEMBERSHIP_LEVELS[level] || 0;
    
    // Save new membership level
    sessionStorage.setItem('membershipLevel', level);
    
    // Update user data
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail && userEmail !== 'guest') {
        const users = getUsers();
        if (users[userEmail]) {
            users[userEmail].membership = level;
            saveUsers(users);
        }
    }
    
    // Update UI
    updateMembershipBadge(level);
    updateVideoLocks(level);
    updateMembershipCards(level);
    
    // Refresh video locks
    updateVideoLocks(level);
}

// Close Purchase Modal
function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==========================================
// MOBILE MENU FUNCTIONS
// ==========================================

// Toggle mobile menu
function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNavLinks');
    const overlay = document.getElementById('mobileNavOverlay');
    
    if (hamburger && mobileNav && overlay) {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (mobileNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

// Close mobile menu
function closeMobileMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNavLinks');
    const overlay = document.getElementById('mobileNavOverlay');
    
    if (hamburger && mobileNav && overlay) {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Toggle mobile profile (for profile button in mobile menu)
function toggleMobileProfile() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        
        // Adjust dropdown position for mobile
        if (window.innerWidth <= 992 && dropdown.classList.contains('active')) {
            dropdown.style.right = '10px';
            dropdown.style.left = 'auto';
        }
    }
}

