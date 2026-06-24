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
    const $newListingBtn = $('#newListingBtn');
    const $listingForm = $('#listingForm');
    const $listingId = $('#listingId');
    const $listingTitle = $('#listingTitle');
    const $listingCategory = $('#listingCategory');
    const $listingLocation = $('#listingLocation');
    const $listingPrice = $('#listingPrice');
    const $listingPriceUnit = $('#listingPriceUnit');
    const $listingCapacity = $('#listingCapacity');
    const $listingAvailable = $('#listingAvailable');
    const $listingDescription = $('#listingDescription');
    const $saveListingBtn = $('#saveListingBtn');
    const $cancelListingBtn = $('#cancelListingBtn');

    let currentListings = [];

    const showAlert = ($element, message, isSuccess = false) => {
        $element
            .text(message)
            .attr('class', isSuccess ? 'auth-alert success' : 'auth-alert')
            .show();
    };

    const hideAlert = ($element) => {
        $element.text('').hide();
    };

    const escapeHtml = (value) => $('<div>').text(value ?? '').html();

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

    const hideListingForm = () => {
        $listingForm.prop('hidden', true);
        $listingForm[0].reset();
        $listingId.val('');
        $saveListingBtn.text('Save Listing');
    };

    const showListingForm = (listing = null) => {
        hideAlert($adminAlert);
        $listingForm.prop('hidden', false);

        if (!listing) {
            $listingForm[0].reset();
            $listingId.val('');
            $listingAvailable.val('1');
            $saveListingBtn.text('Create Listing');
            $listingTitle.trigger('focus');
            return;
        }

        $listingId.val(listing.id);
        $listingTitle.val(listing.title);
        $listingCategory.val(listing.category_id);
        $listingLocation.val(listing.location);
        $listingPrice.val(listing.price);
        $listingPriceUnit.val(listing.price_unit);
        $listingCapacity.val(listing.capacity);
        $listingAvailable.val(Number(listing.is_available));
        $listingDescription.val(listing.description);
        $saveListingBtn.text('Update Listing');
        $listingTitle.trigger('focus');
    };

    const getListingFormData = () => {
        const listing = {
            category_id: Number($listingCategory.val()),
            title: $listingTitle.val().trim(),
            description: $listingDescription.val().trim(),
            location: $listingLocation.val().trim(),
            price: Number($listingPrice.val()),
            price_unit: $listingPriceUnit.val(),
            capacity: Number($listingCapacity.val()),
            is_available: Number($listingAvailable.val()),
        };

        if ($listingId.val()) {
            listing.id = Number($listingId.val());
        }

        if (!listing.category_id || !listing.title || !listing.description || !listing.location || Number.isNaN(listing.price) || listing.price < 0 || !listing.price_unit || !listing.capacity || listing.capacity < 1) {
            throw new Error('Please complete the listing form.');
        }

        return listing;
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
        currentListings = listings;
        $listingsTableBody.empty();
        $listingsEmpty.prop('hidden', listings.length > 0);
        $listingCount.text(listings.length);

        listings.forEach((listing) => {
            const isAvailable = Number(listing.is_available) === 1;
            const row = `
                <tr>
                    <td>
                        ${escapeHtml(listing.title)}
                        <small>${escapeHtml(listing.description)}</small>
                    </td>
                    <td>${escapeHtml(listing.category_name)}</td>
                    <td>${escapeHtml(listing.location)}</td>
                    <td>${escapeHtml(formatPrice(listing))}</td>
                    <td>${escapeHtml(listing.capacity)}</td>
                    <td>
                        <span class="admin-badge ${isAvailable ? '' : 'no'}">${isAvailable ? 'Yes' : 'No'}</span>
                    </td>
                    <td>
                        <div class="admin-row-actions">
                            <button type="button" data-edit-listing="${listing.id}">Edit</button>
                            ${isAvailable ? `<button type="button" class="admin-danger-btn" data-disable-listing="${listing.id}">Disable</button>` : ''}
                        </div>
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
    $newListingBtn.on('click', () => showListingForm());
    $cancelListingBtn.on('click', hideListingForm);

    $listingForm.on('submit', async (event) => {
        event.preventDefault();

        try {
            const listing = getListingFormData();
            const isEdit = Boolean(listing.id);

            $saveListingBtn.prop('disabled', true).text(isEdit ? 'Updating' : 'Creating');

            await requestJson(listingsApi, {
                method: isEdit ? 'PUT' : 'POST',
                body: listing,
            });

            showAlert($adminAlert, isEdit ? 'Listing updated.' : 'Listing created.', true);
            hideListingForm();
            await loadListings();
        } catch (error) {
            showAlert($adminAlert, error.message);
        } finally {
            $saveListingBtn.prop('disabled', false);
            $saveListingBtn.text($listingId.val() ? 'Update Listing' : 'Create Listing');
        }
    });

    $listingsTableBody.on('click', '[data-edit-listing]', function () {
        const listingId = Number($(this).data('edit-listing'));
        const listing = currentListings.find(item => Number(item.id) === listingId);

        if (listing) {
            showListingForm(listing);
        }
    });

    $listingsTableBody.on('click', '[data-disable-listing]', async function () {
        const $button = $(this);
        const listingId = Number($button.data('disable-listing'));

        if (!window.confirm('Disable this listing? Existing booking records will remain.')) {
            return;
        }

        $button.prop('disabled', true).text('Disabling');

        try {
            await requestJson(listingsApi, {
                method: 'DELETE',
                body: { id: listingId },
            });
            showAlert($adminAlert, 'Listing disabled.', true);
            hideListingForm();
            await loadListings();
        } catch (error) {
            showAlert($adminAlert, error.message);
        } finally {
            $button.prop('disabled', false).text('Disable');
        }
    });

    checkSession().catch(() => {
        showLogin();
    });
});
