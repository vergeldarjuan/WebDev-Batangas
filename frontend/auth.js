document.addEventListener('DOMContentLoaded', () => {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^09\d{9}$/;
    const urlParams = new URLSearchParams(window.location.search);

    let openAuthModal = () => {};

    // Ensure the auth modal is present on the page
    let authModalEl = document.getElementById('authModal');
    if (!authModalEl) {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'authModal';
        modalContainer.className = 'modal-overlay';
        modalContainer.style.display = 'none';
        modalContainer.innerHTML = `
    <div class="modal-card">
        <button id="modalCloseBtn" class="modal-close-btn" aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        <div id="loginView" class="modal-view">
            <div class="modal-header">
                <h3 class="modal-title">Welcome Back</h3>
                <p class="modal-subtitle">New to Batangas City? <a href="#" id="switchToRegister">Create an account</a></p>
            </div>
            
            <div id="loginAlert" class="auth-alert"></div>

            <form id="loginForm" novalidate>
                <div class="form-group">
                    <label for="loginEmail" class="form-label">Email Address</label>
                    <input type="email" id="loginEmail" class="form-control" placeholder="juan@example.com" required>
                    <div id="loginEmailError" class="form-error">Please enter a valid email address.</div>
                </div>
                <div class="form-group">
                    <label for="loginPassword" class="form-label">Password</label>
                    <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required>
                    <div id="loginPasswordError" class="form-error">Password is required.</div>
                </div>
                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="loginRemember"> Remember me
                    </label>
                </div>
                <button type="submit" class="btn-auth">Log In</button>
            </form>
        </div>

        <div id="registerView" class="modal-view" style="display: none;">
            <div class="modal-header">
                <h3 class="modal-title">Create Account</h3>
                <p class="modal-subtitle">Already have an account? <a href="#" id="switchToLogin">Log in here</a></p>
            </div>

            <div id="registerAlert" class="auth-alert"></div>

            <form id="registerForm" novalidate>
                <div class="form-group">
                    <label for="regName" class="form-label">Full Name</label>
                    <input type="text" id="regName" class="form-control" placeholder="Juan Dela Cruz" required>
                    <div id="regNameError" class="form-error">Full name is required.</div>
                </div>
                <div class="form-group">
                    <label for="regEmail" class="form-label">Email Address</label>
                    <input type="email" id="regEmail" class="form-control" placeholder="juan@example.com" required>
                    <div id="regEmailError" class="form-error">Please enter a valid email address.</div>
                </div>
                <div class="form-group">
                    <label for="regPhone" class="form-label">Phone Number</label>
                    <input type="tel" id="regPhone" class="form-control" placeholder="09XXXXXXXXX" maxlength="11" required>
                    <div id="regPhoneError" class="form-error">Must be 11 digits starting with 09.</div>
                </div>
                <div class="form-group">
                    <label for="regPassword" class="form-label">Password</label>
                    <input type="password" id="regPassword" class="form-control" placeholder="••••••••" required>
                    <div id="regPasswordError" class="form-error">Must be at least 6 characters.</div>
                </div>
                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="regTerms" required> I agree to the terms
                    </label>
                </div>
                <div id="regTermsError" class="form-error" style="margin-top: -1rem; margin-bottom: 1rem;">You must accept the terms.</div>
                <button type="submit" class="btn-auth">Register</button>
            </form>
        </div>
    </div>
        `;
        document.body.appendChild(modalContainer);
    }

    // ── AUTH MODAL DOM ──
    const authModal = document.getElementById('authModal');
    const signInBtn = document.getElementById('signInBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    if (authModal) {
        authModal.style.display = 'flex';
        
        openAuthModal = () => {
            authModal.classList.add('active');
            showLoginView();
        };

        const closeAuthModal = () => {
            authModal.classList.remove('active');
            resetAuthForms();
        };

        if (signInBtn) {
            signInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openAuthModal();
            });
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeAuthModal);
        }

        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeAuthModal();
        });

        const showLoginView = () => {
            loginView.style.display = 'block';
            registerView.style.display = 'none';
            resetAuthForms();
        };

        const showRegisterView = () => {
            loginView.style.display = 'none';
            registerView.style.display = 'block';
            resetAuthForms();
        };

        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                showRegisterView();
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginView();
            });
        }

        const resetAuthForms = () => {
            document.getElementById('loginForm').reset();
            document.getElementById('registerForm').reset();
            authModal.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
            authModal.querySelectorAll('.auth-alert').forEach(el => {
                el.style.display = 'none';
                el.className = 'auth-alert';
                el.textContent = '';
            });
            authModal.querySelectorAll('.btn-auth').forEach(btn => {
                btn.disabled = false;
                if (btn.closest('#loginForm')) btn.textContent = 'Log In';
                if (btn.closest('#registerForm')) btn.textContent = 'Register';
            });
        };

        // Login Handler
        const loginForm = document.getElementById('loginForm');
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        const loginAlert = document.getElementById('loginAlert');
        const loginEmailError = document.getElementById('loginEmailError');
        const loginPasswordError = document.getElementById('loginPasswordError');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginEmailError.style.display = 'none';
            loginPasswordError.style.display = 'none';
            loginAlert.style.display = 'none';

            let isValid = true;
            if (!loginEmail.value.trim()) {
                loginEmailError.textContent = 'Email address is required.';
                loginEmailError.style.display = 'block';
                isValid = false;
            } else if (!emailPattern.test(loginEmail.value.trim())) {
                loginEmailError.textContent = 'Please enter a valid email address.';
                loginEmailError.style.display = 'block';
                isValid = false;
            }

            if (!loginPassword.value) {
                loginPasswordError.textContent = 'Password is required.';
                loginPasswordError.style.display = 'block';
                isValid = false;
            }

            if (isValid) {
                loginAlert.textContent = 'Verifying credentials...';
                loginAlert.className = 'auth-alert success';
                loginAlert.style.display = 'block';
                const submitBtn = loginForm.querySelector('.btn-auth');
                submitBtn.textContent = 'Connecting...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    const email = loginEmail.value.trim();
                    let fullName = 'Sample User';
                    let role = 'user';
                    let phone = '09123456789';

                    if (email === 'admin@example.com') {
                        fullName = 'Admin User';
                        role = 'admin';
                    } else if (email === 'user@example.com') {
                        fullName = 'Sample User';
                        role = 'user';
                    } else {
                        const parts = email.split('@')[0];
                        fullName = parts.charAt(0).toUpperCase() + parts.slice(1);
                    }

                    localStorage.setItem('currentUser', JSON.stringify({
                        full_name: fullName,
                        email: email,
                        phone: phone,
                        role: role,
                        loggedInAt: new Date().toISOString()
                    }));

                    loginAlert.textContent = 'Login successful!';
                    setTimeout(() => {
                        closeAuthModal();
                        
                        const pendingBookingId = localStorage.getItem('pendingBookingId');
                        if (pendingBookingId) {
                            localStorage.removeItem('pendingBookingId');
                            window.location.href = `listings.html?bookingId=${pendingBookingId}`;
                        } else {
                            window.location.reload();
                        }
                    }, 1000);
                }, 1200);
            }
        });

        // Register Handler
        const registerForm = document.getElementById('registerForm');
        const regName = document.getElementById('regName');
        const regEmail = document.getElementById('regEmail');
        const regPhone = document.getElementById('regPhone');
        const regPassword = document.getElementById('regPassword');
        const regTerms = document.getElementById('regTerms');
        const registerAlert = document.getElementById('registerAlert');
        const regNameError = document.getElementById('regNameError');
        const regEmailError = document.getElementById('regEmailError');
        const regPhoneError = document.getElementById('regPhoneError');
        const regPasswordError = document.getElementById('regPasswordError');
        const regTermsError = document.getElementById('regTermsError');

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            regNameError.style.display = 'none';
            regEmailError.style.display = 'none';
            regPhoneError.style.display = 'none';
            regPasswordError.style.display = 'none';
            regTermsError.style.display = 'none';
            registerAlert.style.display = 'none';

            let isValid = true;

            if (!regName.value.trim()) {
                regNameError.textContent = 'Full name is required.';
                regNameError.style.display = 'block';
                isValid = false;
            } else if (regName.value.trim().length > 100) {
                regNameError.textContent = 'Name must not exceed 100 characters.';
                regNameError.style.display = 'block';
                isValid = false;
            }

            if (!regEmail.value.trim()) {
                regEmailError.textContent = 'Email address is required.';
                regEmailError.style.display = 'block';
                isValid = false;
            } else if (!emailPattern.test(regEmail.value.trim())) {
                regEmailError.textContent = 'Please enter a valid email address.';
                regEmailError.style.display = 'block';
                isValid = false;
            }

            if (!regPhone.value.trim()) {
                regPhoneError.textContent = 'Phone number is required.';
                regPhoneError.style.display = 'block';
                isValid = false;
            } else if (!phonePattern.test(regPhone.value.trim())) {
                regPhoneError.textContent = 'Phone number must be exactly 11 digits and start with 09.';
                regPhoneError.style.display = 'block';
                isValid = false;
            }

            if (!regPassword.value) {
                regPasswordError.textContent = 'Password is required.';
                regPasswordError.style.display = 'block';
                isValid = false;
            } else if (regPassword.value.length < 6) {
                regPasswordError.textContent = 'Password must be at least 6 characters.';
                regPasswordError.style.display = 'block';
                isValid = false;
            }

            if (!regTerms.checked) {
                regTermsError.style.display = 'block';
                isValid = false;
            }

            if (isValid) {
                registerAlert.textContent = 'Creating account...';
                registerAlert.className = 'auth-alert success';
                registerAlert.style.display = 'block';
                const submitBtn = registerForm.querySelector('.btn-auth');
                submitBtn.textContent = 'Creating...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    const email = regEmail.value.trim();
                    const name = regName.value.trim();
                    const phone = regPhone.value.trim();

                    localStorage.setItem('currentUser', JSON.stringify({
                        full_name: name,
                        email: email,
                        phone: phone,
                        role: 'user',
                        loggedInAt: new Date().toISOString()
                    }));

                    registerAlert.textContent = 'Account created successfully!';
                    setTimeout(() => {
                        closeAuthModal();
                        
                        const pendingBookingId = localStorage.getItem('pendingBookingId');
                        if (pendingBookingId) {
                            localStorage.removeItem('pendingBookingId');
                            window.location.href = `listings.html?bookingId=${pendingBookingId}`;
                        } else {
                            window.location.reload();
                        }
                    }, 1000);
                }, 1200);
            }
        });

        regPhone.addEventListener('input', (e) => {
            regPhone.value = regPhone.value.replace(/\D/g, '');
        });

        // Trigger auth modal open if url param states it
        if (urlParams.has('triggerAuth')) {
            const pendingBookingId = urlParams.get('pendingBookingId');
            if (pendingBookingId) {
                localStorage.setItem('pendingBookingId', pendingBookingId);
            }
            openAuthModal();
        }
    }

    // Escape modal closure events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });

    // ── LISTINGS CATEGORY FILTER ──
    const tabButtons = document.querySelectorAll('.rental-tabs .tab-btn');
    const rentalGrid = document.getElementById('rentalGrid');

    if (tabButtons && rentalGrid) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.getAttribute('data-category');
                const cards = rentalGrid.querySelectorAll('.rental-card');
                
                cards.forEach(card => {
                    const cardCat = card.getAttribute('data-category');
                    if (category === 'all' || cardCat === category) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        // Pre-select category based on URL parameter (?category=apartment or ?category=car)
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            const targetBtn = document.querySelector(`.rental-tabs .tab-btn[data-category="${categoryParam}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        }
    }

    // ── BOOKING REQUEST MODULE DOM ──
    const bookingModal = document.getElementById('bookingModal');
    const bookingCloseBtn = document.getElementById('bookingCloseBtn');
    const bookingForm = document.getElementById('bookingForm');
    const bookingListingId = document.getElementById('bookingListingId');
    const bookingModalTitle = document.getElementById('bookingModalTitle');
    const bookingModalSubtitle = document.getElementById('bookingModalSubtitle');
    const bookingStart = document.getElementById('bookingStart');
    const bookingEnd = document.getElementById('bookingEnd');
    const bookingGuests = document.getElementById('bookingGuests');
    const bookingNotes = document.getElementById('bookingNotes');
    
    const bookingAlert = document.getElementById('bookingAlert');
    const bookingStartError = document.getElementById('bookingStartError');
    const bookingEndError = document.getElementById('bookingEndError');
    const bookingGuestsError = document.getElementById('bookingGuestsError');

    let selectedListingMaxCapacity = 1;
    let selectedListingTitle = '';
    let selectedListingCategory = '';
    let selectedListingPriceStr = '';

    if (bookingModal) {
        bookingModal.style.display = 'flex';

        const openBookingModal = (card) => {
            const id = card.getAttribute('data-id');
            const capacity = parseInt(card.getAttribute('data-capacity'));
            const category = card.getAttribute('data-category');
            const title = card.querySelector('.rental-title').textContent;
            const priceText = card.querySelector('.rental-price').textContent;

            selectedListingMaxCapacity = capacity;
            selectedListingTitle = title;
            selectedListingCategory = category;
            selectedListingPriceStr = priceText;

            bookingListingId.value = id;
            bookingModalTitle.textContent = `Book ${title}`;
            bookingModalSubtitle.textContent = `${category === 'apartment' ? 'Accommodation' : 'Vehicle'} · ${priceText}`;
            
            const todayStr = new Date().toISOString().split('T')[0];
            bookingStart.min = todayStr;
            bookingEnd.min = todayStr;
            
            bookingGuests.max = capacity;
            bookingGuests.placeholder = `1 to ${capacity} ${category === 'apartment' ? 'guests' : 'seats'}`;

            bookingForm.removeAttribute('data-mode');
            bookingForm.removeAttribute('data-edit-id');
            bookingForm.querySelector('.btn-auth').textContent = 'Confirm Booking';

            bookingModal.classList.add('active');
        };

        const closeBookingModal = () => {
            bookingModal.classList.remove('active');
            bookingForm.reset();
            bookingStartError.style.display = 'none';
            bookingEndError.style.display = 'none';
            bookingGuestsError.style.display = 'none';
            bookingAlert.style.display = 'none';
            bookingAlert.className = 'auth-alert';
            bookingForm.querySelector('.btn-auth').disabled = false;
        };

        if (bookingCloseBtn) {
            bookingCloseBtn.addEventListener('click', closeBookingModal);
        }

        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) closeBookingModal();
        });

        document.querySelectorAll('.rental-card .btn-book').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.rental-card');
                const id = card.getAttribute('data-id');
                
                if (!currentUser) {
                    localStorage.setItem('pendingBookingId', id);
                    openAuthModal();
                } else {
                    openBookingModal(card);
                }
            });
        });

        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            bookingStartError.style.display = 'none';
            bookingEndError.style.display = 'none';
            bookingGuestsError.style.display = 'none';
            bookingAlert.style.display = 'none';

            let isValid = true;
            const startVal = bookingStart.value;
            const endVal = bookingEnd.value;
            const guestVal = parseInt(bookingGuests.value);

            if (!startVal) {
                bookingStartError.textContent = 'Please select a valid start date.';
                bookingStartError.style.display = 'block';
                isValid = false;
            }

            if (!endVal) {
                bookingEndError.textContent = 'Please select a valid end date.';
                bookingEndError.style.display = 'block';
                isValid = false;
            } else if (startVal && endVal < startVal) {
                bookingEndError.textContent = 'End date cannot be earlier than the start date.';
                bookingEndError.style.display = 'block';
                isValid = false;
            }

            if (isNaN(guestVal) || guestVal < 1) {
                bookingGuestsError.textContent = 'Please enter a valid guest/seat count.';
                bookingGuestsError.style.display = 'block';
                isValid = false;
            } else if (guestVal > selectedListingMaxCapacity) {
                bookingGuestsError.textContent = `Maximum capacity for this selection is ${selectedListingMaxCapacity}.`;
                bookingGuestsError.style.display = 'block';
                isValid = false;
            }

            if (isValid) {
                const isEdit = bookingForm.getAttribute('data-mode') === 'edit';
                const editId = bookingForm.getAttribute('data-edit-id');

                bookingAlert.textContent = isEdit ? 'Updating booking...' : 'Submitting booking request...';
                bookingAlert.className = 'auth-alert success';
                bookingAlert.style.display = 'block';
                
                const submitBtn = bookingForm.querySelector('.btn-auth');
                submitBtn.disabled = true;

                setTimeout(() => {
                    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

                    if (isEdit) {
                        bookings = bookings.map(b => {
                            if (b.id === editId) {
                                return {
                                    ...b,
                                    start_date: startVal,
                                    end_date: endVal,
                                    guests: guestVal,
                                    notes: bookingNotes.value.trim(),
                                    updated_at: new Date().toISOString()
                                };
                            }
                            return b;
                        });
                    } else {
                        const newBooking = {
                            id: 'B' + Date.now(),
                            user_email: currentUser.email,
                            listing_id: bookingListingId.value,
                            listing_title: selectedListingTitle,
                            listing_category: selectedListingCategory,
                            listing_price_str: selectedListingPriceStr,
                            start_date: startVal,
                            end_date: endVal,
                            guests: guestVal,
                            status: 'pending',
                            notes: bookingNotes.value.trim(),
                            created_at: new Date().toISOString()
                        };
                        bookings.push(newBooking);
                    }

                    localStorage.setItem('bookings', JSON.stringify(bookings));

                    bookingAlert.textContent = isEdit ? 'Booking updated successfully!' : 'Booking requested successfully!';
                    
                    setTimeout(() => {
                        closeBookingModal();
                        if (window.location.pathname.includes('user.html')) {
                            renderBookingsList();
                        } else {
                            window.location.href = "user.html";
                        }
                    }, 1200);
                }, 1000);
            }
        });

        // Trigger open if redirecting with query param
        if (urlParams.has('bookingId') && currentUser) {
            const targetBookingId = urlParams.get('bookingId');
            const listingCard = document.querySelector(`.rental-card[data-id="${targetBookingId}"]`);
            if (listingCard) {
                setTimeout(() => {
                    openBookingModal(listingCard);
                }, 300);
            }
        }
    }

    // ── PROFILE DASHBOARD MODULE DOM ──
    const profileModal = document.getElementById('profileModal');
    const profileCloseBtn = document.getElementById('profileCloseBtn');
    
    const tabBtnProfile = document.getElementById('tabBtnProfile');
    const tabBtnBookings = document.getElementById('tabBtnBookings');
    const profileViewTab = document.getElementById('profileViewTab');
    const bookingsViewTab = document.getElementById('bookingsViewTab');
    
    const profileForm = document.getElementById('profileForm');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const regPhoneProfile = document.getElementById('regPhoneProfile');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    
    const profileAlert = document.getElementById('profileAlert');
    const profileNameError = document.getElementById('profileNameError');
    const profilePhoneError = document.getElementById('profilePhoneError');
    const bookingListContainer = document.getElementById('bookingListContainer');

    if (profileModal) {
        const populateProfileDetails = () => {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                profileName.value = currentUser.full_name;
                profileEmail.value = currentUser.email;
                regPhoneProfile.value = currentUser.phone || '';
            }
        };

        const resetProfileFormState = () => {
            profileName.disabled = true;
            regPhoneProfile.disabled = true;
            editProfileBtn.style.display = 'block';
            saveProfileBtn.style.display = 'none';
            profileNameError.style.display = 'none';
            profilePhoneError.style.display = 'none';
            profileAlert.style.display = 'none';
            profileAlert.className = 'auth-alert';
        };

        const switchDashboardTab = (tab) => {
            if (tab === 'profile') {
                tabBtnProfile.classList.add('active');
                tabBtnBookings.classList.remove('active');
                profileViewTab.style.display = 'block';
                bookingsViewTab.style.display = 'none';
            } else {
                tabBtnProfile.classList.remove('active');
                tabBtnBookings.classList.add('active');
                profileViewTab.style.display = 'none';
                bookingsViewTab.style.display = 'block';
                renderBookingsList();
            }
        };

        if (tabBtnProfile) {
            tabBtnProfile.addEventListener('click', () => switchDashboardTab('profile'));
        }
        if (tabBtnBookings) {
            tabBtnBookings.addEventListener('click', () => switchDashboardTab('bookings'));
        }

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                profileName.disabled = false;
                regPhoneProfile.disabled = false;
                editProfileBtn.style.display = 'none';
                saveProfileBtn.style.display = 'block';
            });
        }

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                profileNameError.style.display = 'none';
                profilePhoneError.style.display = 'none';
                profileAlert.style.display = 'none';

                let isValid = true;

                if (!profileName.value.trim()) {
                    profileNameError.style.display = 'block';
                    isValid = false;
                }

                if (!regPhoneProfile.value.trim() || !phonePattern.test(regPhoneProfile.value.trim())) {
                    profilePhoneError.style.display = 'block';
                    isValid = false;
                }

                if (isValid) {
                    profileAlert.textContent = 'Saving details...';
                    profileAlert.className = 'auth-alert success';
                    profileAlert.style.display = 'block';
                    
                    setTimeout(() => {
                        currentUser.full_name = profileName.value.trim();
                        currentUser.phone = regPhoneProfile.value.trim();
                        
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        const navUserLink = document.getElementById('navUser');
                        if (navUserLink) navUserLink.textContent = currentUser.full_name;

                        profileAlert.textContent = 'Details updated successfully!';
                        setTimeout(() => {
                            resetProfileFormState();
                        }, 1000);
                    }, 800);
                }
            });
        }

        if (regPhoneProfile) {
            regPhoneProfile.addEventListener('input', (e) => {
                regPhoneProfile.value = regPhoneProfile.value.replace(/\D/g, '');
            });
        }

        const renderBookingsList = () => {
            const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            const userBookings = bookings.filter(b => b.user_email === currentUser.email);

            bookingListContainer.innerHTML = '';

            if (userBookings.length === 0) {
                bookingListContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--ink-soft); font-size: 0.9rem;">
                        You have no booking records yet.
                    </div>
                `;
                return;
            }

            userBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            userBookings.forEach(booking => {
                const card = document.createElement('div');
                card.className = 'booking-card';
                card.setAttribute('data-id', booking.id);

                const canModify = booking.status === 'pending' || booking.status === 'confirmed';

                card.innerHTML = `
                    <div class="booking-card-header">
                        <div>
                            <h4 class="booking-listing-title">${booking.listing_title}</h4>
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--ink-soft); text-transform: uppercase;">
                                ${booking.listing_category === 'apartment' ? 'Accommodation' : 'Vehicle'} Rental
                            </span>
                        </div>
                        <span class="booking-status ${booking.status}">${booking.status}</span>
                    </div>
                    <div class="booking-details">
                        <span>🗓 Dates: ${booking.start_date} to ${booking.end_date}</span>
                        <span>👥 Guests/Seats: ${booking.guests}</span>
                        ${booking.notes ? `<span>📝 Notes: ${booking.notes}</span>` : ''}
                    </div>
                    ${canModify ? `
                        <div class="booking-actions">
                            <button class="btn-action-edit" onclick="window.editUserBooking('${booking.id}')">Modify</button>
                            <button class="btn-action-cancel" onclick="window.cancelUserBooking('${booking.id}')">Cancel Booking</button>
                        </div>
                    ` : ''}
                `;

                bookingListContainer.appendChild(card);
            });
        };

        window.cancelUserBooking = (bookingId) => {
            if (confirm('Are you sure you want to cancel this booking?')) {
                let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
                bookings = bookings.map(b => {
                    if (b.id === bookingId) {
                        return { ...b, status: 'cancelled', updated_at: new Date().toISOString() };
                    }
                    return b;
                });
                localStorage.setItem('bookings', JSON.stringify(bookings));
                renderBookingsList();
            }
        };

        window.editUserBooking = (bookingId) => {
            const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            const booking = bookings.find(b => b.id === bookingId);
            
            if (booking) {
                // Since listings are on listings.html, we mock listing max capacity check locally
                // 1 -> 4, 2 -> 5, 3 -> 5, 4 -> 7
                const capacityMap = { "1": 4, "2": 5, "3": 5, "4": 7 };
                selectedListingMaxCapacity = capacityMap[booking.listing_id] || 5;
                selectedListingTitle = booking.listing_title;
                selectedListingCategory = booking.listing_category;
                selectedListingPriceStr = booking.listing_price_str;

                bookingListingId.value = booking.listing_id;
                bookingModalTitle.textContent = `Modify Booking`;
                bookingModalSubtitle.textContent = `${booking.listing_title} · ${booking.listing_price_str}`;
                
                const todayStr = new Date().toISOString().split('T')[0];
                bookingStart.min = todayStr;
                bookingEnd.min = todayStr;
                
                bookingStart.value = booking.start_date;
                bookingEnd.value = booking.end_date;
                bookingGuests.value = booking.guests;
                bookingGuests.max = selectedListingMaxCapacity;
                bookingNotes.value = booking.notes || '';

                bookingForm.setAttribute('data-mode', 'edit');
                bookingForm.setAttribute('data-edit-id', bookingId);
                bookingForm.querySelector('.btn-auth').textContent = 'Save Updates';

                bookingModal.classList.add('active');
            }
        };

        // Initialize dashboard details on direct load of user.html
        if (window.location.pathname.includes('user.html')) {
            populateProfileDetails();
            renderBookingsList();
        }
    }
});
