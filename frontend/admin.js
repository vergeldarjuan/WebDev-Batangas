$(function () {
    const authApi = '/backend/api/auth.php';
    const bookingsApi = '/backend/api/bookings.php';
    const listingsApi = '/backend/api/listings.php';
    const statusOptions = ['pending', 'confirmed', 'cancelled', 'rejected'];

    const $loginView = $('#adminLoginView');
    const $dashboardView = $('#adminDashboardView');
    const $loginForm = $('#adminLoginForm');
    const $loginAlert = $('#adminLoginAlert');
    const $adminAlert = $('#adminAlert');
    const $adminUserLabel = $('#adminUserLabel');
    const $logoutBtn = $('#adminLogoutBtn');

    const $pendingCount = $('#pendingCount');
    const $bookingCount = $('#bookingCount');
    const $listingCount = $('#listingCount');
    const $bookingsTableBody = $('#bookingsTableBody');
    const $listingsTableBody = $('#listingsTableBody');
    const $bookingsEmpty = $('#bookingsEmpty');
    const $listingsEmpty = $('#listingsEmpty');
    const $refreshBookingsBtn = $('#refreshBookingsBtn');
    const $refreshListingsBtn = $('#refreshListingsBtn');

    const showAlert = ($element, message, isSuccess = false) => {
        $element
            .text(message)
            .attr('class', isSuccess ? 'auth-alert success' : 'auth-alert')
            .show();
    };

    const hideAlert = ($element) => {
        $element.text('').hide();
    };

    const requestJson = (url, options = {}) => {
        const requestBody = options.body && typeof options.body !== 'string'
            ? JSON.stringify(options.body)
            : options.body;

        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                method: options.method || 'GET',
                data: requestBody || null,
                contentType: 'application/json',
                dataType: 'json',
                headers: options.headers || {},
                xhrFields: {
                    withCredentials: true,
                },
            })
                .done((data) => {
                    if (data && data.success === false) {
                        reject(new Error(data.message || 'Request failed.'));
                        return;
                    }

                    resolve(data);
                })
                .fail((xhr) => {
                    const message = xhr.responseJSON?.message || 'Request failed.';
                    reject(new Error(message));
                });
        });
    };

    const showLogin = () => {
        $loginView.prop('hidden', false);
        $dashboardView.prop('hidden', true);
    };

    const showDashboard = (user) => {
        $loginView.prop('hidden', true);
        $dashboardView.prop('hidden', false);
        $adminUserLabel.text(user.full_name);
    };

    const formatPrice = (listing) => {
        const price = Number(listing.price || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return `PHP ${price} ${listing.price_unit}`;
    };

    const renderBookings = (bookings) => {
        $bookingsTableBody.empty();
        $bookingsEmpty.prop('hidden', bookings.length > 0);
        $bookingCount.text(bookings.length);
        $pendingCount.text(bookings.filter(booking => booking.status === 'pending').length);

        bookings.forEach((booking) => {
            const options = statusOptions.map((status) => {
                const selected = booking.status === status ? 'selected' : '';
                return `<option value="${status}" ${selected}>${status}</option>`;
            }).join('');

            const row = `
                <tr>
                    <td>
                        ${booking.user_name}
                        <small>${booking.user_email}</small>
                    </td>
                    <td>
                        ${booking.listing_title}
                        <small>${booking.category_name} - ${booking.listing_location}</small>
                    </td>
                    <td>
                        ${booking.start_date}
                        <small>to ${booking.end_date}</small>
                    </td>
                    <td>${booking.guests}</td>
                    <td>
                        <select class="admin-status-select" data-booking-id="${booking.id}">
                            ${options}
                        </select>
                    </td>
                    <td>
                        <button type="button" data-save-status="${booking.id}">Save</button>
                    </td>
                </tr>
            `;

            $bookingsTableBody.append(row);
        });
    };

    const renderListings = (listings) => {
        $listingsTableBody.empty();
        $listingsEmpty.prop('hidden', listings.length > 0);
        $listingCount.text(listings.length);

        listings.forEach((listing) => {
            const isAvailable = Number(listing.is_available) === 1;
            const row = `
                <tr>
                    <td>
                        ${listing.title}
                        <small>${listing.description}</small>
                    </td>
                    <td>${listing.category_name}</td>
                    <td>${listing.location}</td>
                    <td>${formatPrice(listing)}</td>
                    <td>${listing.capacity}</td>
                    <td>
                        <span class="admin-badge ${isAvailable ? '' : 'no'}">${isAvailable ? 'Yes' : 'No'}</span>
                    </td>
                </tr>
            `;

            $listingsTableBody.append(row);
        });
    };

    const loadBookings = async () => {
        hideAlert($adminAlert);
        const data = await requestJson(bookingsApi);
        renderBookings(data.bookings || []);
    };

    const loadListings = async () => {
        hideAlert($adminAlert);
        const data = await requestJson(listingsApi);
        renderListings(data.listings || []);
    };

    const loadDashboardData = async () => {
        try {
            await Promise.all([loadBookings(), loadListings()]);
        } catch (error) {
            showAlert($adminAlert, error.message);
        }
    };

    const checkSession = async () => {
        const data = await requestJson(authApi);
        const user = data.user;

        if (!user || user.role !== 'admin') {
            showLogin();
            return;
        }

        showDashboard(user);
        await loadDashboardData();
    };

    const runPanelRequest = async (request) => {
        try {
            await request();
        } catch (error) {
            showAlert($adminAlert, error.message);
        }
    };

    $loginForm.on('submit', async (event) => {
        event.preventDefault();
        hideAlert($loginAlert);

        const email = $('#adminEmail').val().trim();
        const password = $('#adminPassword').val();

        try {
            const data = await requestJson(`${authApi}?action=login`, {
                method: 'POST',
                body: { email, password },
            });

            if (data.user.role !== 'admin') {
                await requestJson(`${authApi}?action=logout`, { method: 'POST' });
                showAlert($loginAlert, 'This account does not have admin access.');
                return;
            }

            showDashboard(data.user);
            await loadDashboardData();
        } catch (error) {
            showAlert($loginAlert, error.message);
        }
    });

    $logoutBtn.on('click', async (event) => {
        event.preventDefault();

        await requestJson(`${authApi}?action=logout`, { method: 'POST' });
        showLogin();
    });

    $('.admin-tab').on('click', function () {
        const panelId = $(this).data('panel');

        $('.admin-tab').removeClass('active');
        $('.admin-panel').removeClass('active');
        $(this).addClass('active');
        $(`#${panelId}`).addClass('active');
    });

    $bookingsTableBody.on('click', '[data-save-status]', async function () {
        const $button = $(this);
        const bookingId = $button.data('save-status');
        const status = $bookingsTableBody
            .find(`.admin-status-select[data-booking-id="${bookingId}"]`)
            .val();

        $button.prop('disabled', true).text('Saving');

        try {
            await requestJson(bookingsApi, {
                method: 'PUT',
                body: {
                    id: bookingId,
                    status,
                },
            });
            showAlert($adminAlert, 'Booking status updated.', true);
            await loadBookings();
        } catch (error) {
            showAlert($adminAlert, error.message);
        } finally {
            $button.prop('disabled', false).text('Save');
        }
    });

    $refreshBookingsBtn.on('click', () => runPanelRequest(loadBookings));
    $refreshListingsBtn.on('click', () => runPanelRequest(loadListings));

    checkSession().catch(() => {
        showLogin();
    });
});
