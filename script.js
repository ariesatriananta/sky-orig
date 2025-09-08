// Consolidated auto-login logic
function performAutoLogin() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");
    const password = urlParams.get("password");

    if (username === "admin" && password === "admin123") {
        currentUser = { username: "admin", role: "admin" };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        // Clear URL parameters to prevent loops
        const url = new URL(window.location);
        url.searchParams.delete('username');
        url.searchParams.delete('password');
        window.history.replaceState({}, '', url);

        return true;
    }
    return false;
}
// Global variables
let currentUser = null;
let items = JSON.parse(localStorage.getItem('rentalItems')) || [];
let categories = JSON.parse(localStorage.getItem('rentalCategories')) || [];
let rentals = JSON.parse(localStorage.getItem('rentalData')) || [];
let returns = JSON.parse(localStorage.getItem('returnData')) || [];

function loadAllData() {
    loadDashboard();
    loadCategories();
    loadItems();
    loadRentals();
    loadReturns();
    updateCharts();
}

document.addEventListener('DOMContentLoaded', function() {
    // Check for auto-login
    if (performAutoLogin()) {
        setTimeout(() => {
            document.getElementById("loginScreen").style.display = "none";
            document.getElementById("mainApp").style.display = "block";
            loadAllData();
            // Load last active section or default to dashboard
            const activeSection = localStorage.getItem('activeSection') || 'dashboard';
            showSection(activeSection);
        }, 100);
        return;
    }

    checkAuth();
    loadAllData();
    // Load last active section or default to dashboard
    const activeSection = localStorage.getItem('activeSection') || 'dashboard';
    showSection(activeSection);

    // Add event listeners for forms
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveCategory();
        });
    }

    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveItem();
        });
    }

    // Preview image when selecting a file on Add/Edit Item form
    const itemImageInput = document.getElementById('itemImage');
    const itemImagePreview = document.getElementById('itemImagePreview');
    if (itemImageInput && itemImagePreview) {
        itemImageInput.addEventListener('change', function() {
            const file = itemImageInput.files && itemImageInput.files[0];
            if (!file) {
                itemImagePreview.src = '';
                itemImagePreview.style.display = 'none';
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                itemImagePreview.src = e.target.result;
                itemImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });
    }

    const addRentalForm = document.getElementById('addRentalForm');
    if (addRentalForm) {
        addRentalForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveRental();
        });
    }

    const addReturnForm = document.getElementById('addReturnForm');
    if (addReturnForm) {
        addReturnForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveReturn();
        });
        // Add event listeners for discount and penalty inputs to update final cost
        const discountInput = document.getElementById('discount');
        const penaltyInput = document.getElementById('returnPenalty');
        if (discountInput) discountInput.addEventListener('input', calculateFinalCost);
        if (penaltyInput) penaltyInput.addEventListener('input', calculateFinalCost);
    }
});

// Authentication functions
function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");
    const password = urlParams.get("password");

    if (username === "admin" && password === "admin123") {
        currentUser = { username: "admin", role: "admin" };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainApp").style.display = "block";
        loadAllData();
        const activeSection = localStorage.getItem('activeSection') || 'dashboard';
        showSection(activeSection);
        return;
    }

    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        showLogin();
    } else {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainApp").style.display = "block";
        loadAllData();
        const activeSection = localStorage.getItem('activeSection') || 'dashboard';
        showSection(activeSection);
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', role: 'admin' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        loadAllData();
        const activeSection = localStorage.getItem('activeSection') || 'dashboard';
        showSection(activeSection);
    } else {
        showNotification('Username atau password salah!', 'error');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showLogin();
}

// Navigation functions
function showSection(sectionId, event) {
    // Save current section to localStorage
    localStorage.setItem('activeSection', sectionId);

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Handle different section ID formats
    let elementId = sectionId;
    if (sectionId === 'dashboard') {
        elementId = 'dashboardSection';
    } else if (sectionId === 'categories') {
        elementId = 'categoriesSection';
    } else if (sectionId === 'items') {
        elementId = 'itemsSection';
    } else if (sectionId === 'rentals') {
        elementId = 'rentalsSection';
    } else if (sectionId === 'returns') {
        elementId = 'returnsSection';
    } else if (sectionId === 'reports') {
        elementId = 'reportsSection';
    }

    const sectionElement = document.getElementById(elementId);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }

    // Add active class to the correct nav item
    const navItem = document.querySelector(`.nav-item[onclick*="${sectionId}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Load section-specific data
    if (sectionId === 'dashboard') {
        loadDashboard();
        updateCharts();
    } else if (sectionId === 'categories') {
        loadCategories();
    } else if (sectionId === 'items') {
        loadItems();
    } else if (sectionId === 'rentals') {
        loadRentals();
    } else if (sectionId === 'returns') {
        loadReturns();
    } else if (sectionId === 'reports') {
        updateCharts();
    }
}

// Dashboard functions
function loadDashboard() {
    // Hitung total pendapatan, penyewaan aktif, barang tersedia, dan total kategori
    const totalRevenue = returns.reduce((sum, ret) => sum + (ret.finalCost || 0), 0);
    const activeRentals = rentals.filter(r => r.status === 'active').length;
    const availableItems = items.filter(i => i.status === 'available').length;
    const totalCategories = categories.length;

    document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
    document.getElementById('activeRentals').textContent = activeRentals;
    document.getElementById('availableItems').textContent = availableItems;
    document.getElementById('totalCategories').textContent = totalCategories;

    // Hitung jumlah penyewaan per item
    const rentalCounts = {};
    rentals.forEach(rental => {
        if (rental.itemId) {
            rentalCounts[rental.itemId] = (rentalCounts[rental.itemId] || 0) + 1;
        }
    });

    // Buat array item dengan jumlah penyewaan dan total pendapatan
    const itemsWithCounts = items.map(item => {
        // Hitung total pendapatan untuk item ini dari data returns
        const totalRevenueForItem = returns
            .filter(ret => {
                const rental = rentals.find(r => r.id === ret.rentalId);
                return rental && rental.itemId === item.id;
            })
            .reduce((sum, ret) => sum + (ret.finalCost || 0), 0);

        return {
            id: item.id,
            name: item.name,
            rentalCount: rentalCounts[item.id] || 0,
            totalRevenue: totalRevenueForItem
        };
    });

    // Urutkan berdasarkan rentalCount menurun dan ambil 5 teratas
    const top5Items = itemsWithCounts.sort((a, b) => b.rentalCount - a.rentalCount).slice(0, 5);

    // Render daftar top 5 item dengan kolom tambahan total pendapatan
    const topRentedList = document.getElementById('topRentedList');
    if (topRentedList) {
        if (top5Items.length === 0) {
            topRentedList.innerHTML = '<p>Tidak ada data penyewaan.</p>';
        } else {
            topRentedList.innerHTML = `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Barang</th>
                                <th>Jumlah Penyewaan</th>
                                <th>Total Pendapatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${top5Items.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.name}</td>
                                    <td>${item.rentalCount} kali disewa</td>
                                    <td>Rp ${item.totalRevenue.toLocaleString('id-ID')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }
}

// Make dashboard stats clickable
function showDashboardDetail(type) {
    let title = '';
    let content = '';
    
    switch(type) {
        case 'revenue':
            title = 'Detail Pendapatan';
            content = returns.map(ret => 
                `<div class="detail-item">
                    <strong>ID: ${ret.rentalId}</strong> - ${ret.customerName}<br>
                    Biaya: Rp ${ret.finalCost?.toLocaleString('id-ID') || 0}<br>
                    Tanggal: ${ret.returnDate}
                </div>`
            ).join('');
            break;
        case 'active':
            title = 'Penyewaan Aktif';
            content = rentals.filter(r => r.status === 'active').map(rental => 
                `<div class="detail-item">
                    <strong>ID: ${rental.id}</strong> - ${rental.customerName}<br>
                    Barang: ${rental.itemName}<br>
                    Mulai: ${rental.startDate}
                </div>`
            ).join('');
            break;
        case 'available':
            title = 'Barang Tersedia';
            content = items.filter(i => i.status === 'available').map(item => 
                `<div class="detail-item">
                    <strong>${item.name}</strong> (${item.code})<br>
                    Kategori: ${item.category}<br>
                    Lokasi: ${item.location}
                </div>`
            ).join('');
            break;
        case 'categories':
            title = 'Semua Kategori';
            content = categories.map(cat => 
                `<div class="detail-item">
                    <strong>${cat.icon} ${cat.name}</strong><br>
                    ${cat.description}
                </div>`
            ).join('');
            break;
    }
    
    if (!content) content = '<p>Tidak ada data untuk ditampilkan.</p>';
    
    showModal('dashboardDetailModal', title, content);
}

// Category functions
function loadCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '';
    
    categories.forEach(category => {
        // Hitung jumlah barang dalam kategori ini
        const itemCount = items.filter(item => item.categoryId === category.id).length;
        category.itemCount = itemCount;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.icon}</td>
            <td class="editable-name" data-id="${category.id}">${category.name}</td>
            <td class="editable-desc" data-id="${category.id}">${category.description}</td>
            <td>${category.itemCount}</td>
            <td>
                <button class="btn-edit" onclick="editCategory(${category.id})">Edit</button>
                <button class="btn-delete" onclick="deleteCategory(${category.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    
    // Add inline editing
    document.querySelectorAll('.editable-name, .editable-desc').forEach(cell => {
        cell.addEventListener('dblclick', function() {
            makeEditable(this);
        });
    });
}

function makeEditable(cell) {
    const originalText = cell.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.className = 'inline-edit';
    
    input.addEventListener('blur', function() {
        saveInlineEdit(cell, input.value);
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveInlineEdit(cell, input.value);
        }
    });
    
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
}

function saveInlineEdit(cell, newValue) {
    const categoryId = parseInt(cell.dataset.id);
    const category = categories.find(c => c.id === categoryId);
    
    if (cell.classList.contains('editable-name')) {
        category.name = newValue;
    } else if (cell.classList.contains('editable-desc')) {
        category.description = newValue;
    }
    
    cell.textContent = newValue;
    localStorage.setItem('rentalCategories', JSON.stringify(categories));
    showNotification('Kategori berhasil diperbarui!', 'success');
}

function showAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Tambah Kategori Baru';
    document.getElementById('addCategoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('addCategoryModal').style.display = 'block';
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        document.getElementById('categoryModalTitle').textContent = 'Edit Kategori';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('addCategoryModal').style.display = 'block';
    }
}

function saveCategory() {
    const categoryId = document.getElementById('categoryId').value;
    const categoryName = document.getElementById('categoryName').value.trim();
    const categoryIcon = document.getElementById('categoryIcon').value;
    const categoryDescription = document.getElementById('categoryDescription').value.trim();
    
    if (!categoryName || !categoryIcon) {
        showNotification('Nama kategori dan icon harus diisi!', 'error');
        return;
    }
    
    if (categoryId) {
        // Edit existing category
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (category) {
            category.name = categoryName;
            category.icon = categoryIcon;
            category.description = categoryDescription;
            showNotification('Kategori berhasil diperbarui!', 'success');
        } else {
            showNotification('Kategori tidak ditemukan!', 'error');
            return;
        }
    } else {
        // Add new category
        const newCategory = {
            id: Date.now(),
            name: categoryName,
            icon: categoryIcon,
            description: categoryDescription
        };
        categories.push(newCategory);
        showNotification('Kategori berhasil ditambahkan!', 'success');
    }
    
    localStorage.setItem('rentalCategories', JSON.stringify(categories));
    loadCategories();
    loadItems(); // Refresh items to update category dropdown
    closeModal('addCategoryModal');
}

function deleteCategory(id) {
    // Check if category is used by any items
    const isUsed = items.some(item => item.categoryId === id);
    if (isUsed) {
        showNotification('Kategori tidak dapat dihapus karena masih digunakan oleh barang!', 'error');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem('rentalCategories', JSON.stringify(categories));
        loadCategories();
        showNotification('Kategori berhasil dihapus!', 'success');
    }
}

// Item functions
function loadItems(sortKey = null, sortOrder = 'asc') {
    const tbody = document.getElementById('itemsTableBody');
    tbody.innerHTML = '';

    let sortedItems = [...items];
    if (sortKey) {
        sortedItems.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            // For category, compare category names
            if (sortKey === 'categoryName') {
                const catA = categories.find(c => c.id === a.categoryId);
                const catB = categories.find(c => c.id === b.categoryId);
                valA = catA ? catA.name : '';
                valB = catB ? catB.name : '';
            }

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    sortedItems.forEach(item => {
        const category = categories.find(c => c.id === item.categoryId);
        const categoryName = category ? category.name : 'Tidak diketahui';

        // Display pricing options
        let pricingDisplay = '';
        if (item.pricingOptions && item.pricingOptions.length > 0) {
            pricingDisplay = item.pricingOptions.map(option => {
                let typeName = '';
                switch(option.type) {
                    case 'hourly': typeName = 'Per Jam'; break;
                    case 'daily': typeName = 'Per Hari'; break;
                    case 'weekly': typeName = 'Per Minggu'; break;
                    case 'monthly': typeName = 'Per Bulan'; break;
                    case 'custom': typeName = option.customName || 'Custom'; break;
                }
                return `${typeName}: Rp ${option.price.toLocaleString('id-ID')}`;
            }).join('<br>');
        } else {
            pricingDisplay = 'Belum ada opsi harga';
        }

        const imageHtml = item.image ? `<img src="${item.image}" alt="Gambar Barang" style="max-width: 50px; max-height: 50px; border-radius: 4px;">` : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${imageHtml}</td>
            <td>${item.name}</td>
            <td>${item.code}</td>
            <td>${categoryName}</td>
            <td>${item.condition === 'Rusak' ? '<span style="color: red; font-weight: bold;">Rusak</span>' : item.condition}</td>
            <td>${pricingDisplay}</td>
            <td>${item.location}</td>
            <td><span class="status-badge status-${item.status}">${translateStatus(item.status)}</span></td>
            <td>
                <button class="btn-edit" onclick="editItem(${item.id})">Edit</button>
                <button class="btn-delete" onclick="deleteItem(${item.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update category dropdown in item form
    updateCategoryDropdown();
}

// Sorting state for items
let currentSortKey = null;
let currentSortOrder = 'asc';

// Sorting state for rentals
let currentRentalSortKey = null;
let currentRentalSortOrder = 'asc';

function toggleSort(key) {
    if (currentSortKey === key) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortKey = key;
        currentSortOrder = 'asc';
    }
    updateSortIcons();
    loadItems(currentSortKey, currentSortOrder);
}

function toggleRentalSort(key) {
    if (currentRentalSortKey === key) {
        currentRentalSortOrder = currentRentalSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentRentalSortKey = key;
        currentRentalSortOrder = 'asc';
    }
    updateRentalSortIcons();
    loadRentals(currentRentalSortKey, currentRentalSortOrder);
}

function updateSortIcons() {
    const headerRow = document.querySelector('#itemsTableBody').closest('table').querySelector('thead tr');
    if (!headerRow) return;
    const ths = headerRow.querySelectorAll('th');

    ths.forEach(th => {
        // Remove existing sort icons
        const icon = th.querySelector('.sort-icon');
        if (icon) {
            th.removeChild(icon);
        }
    });

    ths.forEach(th => {
        const key = th.getAttribute('onclick')?.match(/toggleSort\('(.+)'\)/)?.[1];
        if (key === currentSortKey) {
            const icon = document.createElement('span');
            icon.classList.add('sort-icon');
            icon.style.marginLeft = '5px';
            icon.style.fontSize = '0.7em';
            icon.style.userSelect = 'none';
            icon.innerHTML = currentSortOrder === 'asc' ? '&#9650;' : '&#9660;'; // up or down arrow
            th.appendChild(icon);
        }
    });
}

function updateRentalSortIcons() {
    const headerRow = document.querySelector('#rentalsTableBody').closest('table').querySelector('thead tr');
    if (!headerRow) return;
    const ths = headerRow.querySelectorAll('th');

    ths.forEach(th => {
        // Remove existing sort icons
        const icon = th.querySelector('.sort-icon');
        if (icon) {
            th.removeChild(icon);
        }
    });

    ths.forEach(th => {
        const key = th.getAttribute('onclick')?.match(/toggleRentalSort\('(.+)'\)/)?.[1];
        if (key === currentRentalSortKey) {
            const icon = document.createElement('span');
            icon.classList.add('sort-icon');
            icon.style.marginLeft = '5px';
            icon.style.fontSize = '0.7em';
            icon.style.userSelect = 'none';
            icon.innerHTML = currentRentalSortOrder === 'asc' ? '&#9650;' : '&#9660;'; // up or down arrow
            th.appendChild(icon);
        }
    });
}

function updateCategoryDropdown() {
    const categorySelect = document.getElementById('itemCategory');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Pilih Kategori</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.icon} ${category.name}`;
            categorySelect.appendChild(option);
        });
    }
}

function showAddItemModal() {
    document.getElementById('itemModalTitle').textContent = 'Tambah Barang Baru';
    document.getElementById('addItemForm').reset();
    document.getElementById('itemId').value = '';
    
    // Reset pricing options
    const pricingContainer = document.getElementById('pricingOptions');
    pricingContainer.innerHTML = `
        <div class="pricing-option">
            <div class="form-row">
                <div class="form-group">
                    <label>Jenis Sewa</label>
                    <select class="pricing-type">
                        <option value="hourly">Per Jam</option>
                        <option value="daily" selected>Per Hari</option>
                        <option value="weekly">Per Minggu</option>
                        <option value="monthly">Per Bulan</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <div class="form-group custom-name-group" style="display: none;">
                    <label>Nama Custom (jika custom)</label>
                    <input type="text" class="custom-name" placeholder="Contoh: Per 3 Hari">
                </div>
                <div class="form-group">
                    <label>Harga</label>
                    <input type="number" class="pricing-price" required>
                </div>
                <div class="form-group">
                    <button type="button" class="btn-remove-pricing" onclick="removePricingOption(this)" style="display: none;">Hapus</button>
                </div>
            </div>
        </div>
    `;
    
    updateCategoryDropdown();
    // Reset image input and preview
    const imgInput = document.getElementById('itemImage');
    if (imgInput) imgInput.value = '';
    const preview = document.getElementById('itemImagePreview');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
    document.getElementById('addItemModal').style.display = 'block';
}

function editItem(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        document.getElementById('itemModalTitle').textContent = 'Edit Barang';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemCode').value = item.code;
        document.getElementById('itemCategory').value = item.categoryId;
        document.getElementById('itemCondition').value = item.condition;
        document.getElementById('itemLocation').value = item.location;

        // Load pricing options
        const pricingContainer = document.getElementById('pricingOptions');
        pricingContainer.innerHTML = '';

        if (item.pricingOptions && item.pricingOptions.length > 0) {
            item.pricingOptions.forEach((option, index) => {
                addPricingOption(option, index === 0);
            });
        } else {
            addPricingOption(null, true);
        }

        // Load image preview if available
        const preview = document.getElementById('itemImagePreview');
        if (item.image) {
            preview.src = item.image;
            preview.style.display = 'block';
        } else {
            preview.src = '';
            preview.style.display = 'none';
        }

        // Clear file input value (cannot set file input value programmatically for security)
        const itemImageInput = document.getElementById('itemImage');
        if (itemImageInput) {
            itemImageInput.value = '';
        }

        document.getElementById('addItemModal').style.display = 'block';
    }
}

function addPricingOption(existingOption = null, isFirst = false) {
    const pricingContainer = document.getElementById('pricingOptions');
    const pricingOption = document.createElement('div');
    pricingOption.className = 'pricing-option';
    
    const customDisplay = existingOption && existingOption.type === 'custom' ? 'block' : 'none';
    const removeDisplay = isFirst ? 'none' : 'inline-block';
    
    pricingOption.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Jenis Sewa</label>
                <select class="pricing-type" onchange="toggleCustomName(this)">
                    <option value="hourly" ${existingOption && existingOption.type === 'hourly' ? 'selected' : ''}>Per Jam</option>
                    <option value="daily" ${existingOption && existingOption.type === 'daily' ? 'selected' : ''}>Per Hari</option>
                    <option value="weekly" ${existingOption && existingOption.type === 'weekly' ? 'selected' : ''}>Per Minggu</option>
                    <option value="monthly" ${existingOption && existingOption.type === 'monthly' ? 'selected' : ''}>Per Bulan</option>
                    <option value="custom" ${existingOption && existingOption.type === 'custom' ? 'selected' : ''}>Custom</option>
                </select>
            </div>
            <div class="form-group custom-name-group" style="display: ${customDisplay};">
                <label>Nama Custom (jika custom)</label>
                <input type="text" class="custom-name" placeholder="Contoh: Per 3 Hari" value="${existingOption && existingOption.customName ? existingOption.customName : ''}">
            </div>
            <div class="form-group">
                <label>Harga</label>
                <input type="number" class="pricing-price" required value="${existingOption ? existingOption.price : ''}">
            </div>
            <div class="form-group">
                <button type="button" class="btn-remove-pricing" onclick="removePricingOption(this)" style="display: ${removeDisplay};">Hapus</button>
            </div>
        </div>
    `;
    
    pricingContainer.appendChild(pricingOption);
}

function removePricingOption(button) {
    button.closest('.pricing-option').remove();
}

function toggleCustomName(select) {
    const customNameGroup = select.closest('.pricing-option').querySelector('.custom-name-group');
    if (select.value === 'custom') {
        customNameGroup.style.display = 'block';
    } else {
        customNameGroup.style.display = 'none';
    }
}

async function saveItem() {
    const itemId = document.getElementById('itemId').value;
    const itemName = document.getElementById('itemName').value;
    const itemCode = document.getElementById('itemCode').value;
    const itemCategory = document.getElementById('itemCategory').value;
    let itemCondition = document.getElementById('itemCondition').value;
    const itemLocation = document.getElementById('itemLocation').value;
    const itemImageInput = document.getElementById('itemImage');

    if (!itemName || !itemCode || !itemCategory || !itemCondition || !itemLocation) {
        showNotification('Semua field harus diisi!', 'error');
        return;
    }


    // Collect pricing options
    const pricingOptions = [];
    const pricingElements = document.querySelectorAll('.pricing-option');

    pricingElements.forEach(element => {
        const type = element.querySelector('.pricing-type').value;
        const price = parseInt(element.querySelector('.pricing-price').value);
        const customName = element.querySelector('.custom-name').value;

        if (price && price > 0) {
            const option = { type, price };
            if (type === 'custom' && customName) {
                option.customName = customName;
            }
            pricingOptions.push(option);
        }
    });

    if (pricingOptions.length === 0) {
        showNotification('Minimal harus ada satu opsi harga!', 'error');
        return;
    }

    // Read image file as base64 if selected
    let imageBase64 = null;
    if (itemImageInput && itemImageInput.files && itemImageInput.files[0]) {
        imageBase64 = await readFileAsDataURL(itemImageInput.files[0]);
    }

    if (itemId) {
        // Edit existing item
        const item = items.find(i => i.id === parseInt(itemId));
        item.name = itemName;
        item.code = itemCode;
        item.categoryId = parseInt(itemCategory);
        item.condition = itemCondition;
        item.location = itemLocation;
        item.pricingOptions = pricingOptions;
        if (imageBase64 !== null) {
            item.image = imageBase64;
        }
        showNotification('Barang berhasil diperbarui!', 'success');
    } else {
        // Add new item
        const newItem = {
            id: Date.now(),
            name: itemName,
            code: itemCode,
            categoryId: parseInt(itemCategory),
            condition: itemCondition,
            location: itemLocation,
            status: 'available',
            pricingOptions: pricingOptions,
            image: imageBase64
        };
        items.push(newItem);
        showNotification('Barang berhasil ditambahkan!', 'success');
    }

    localStorage.setItem('rentalItems', JSON.stringify(items));
    loadItems();
    loadDashboard();
    closeModal('addItemModal');
}

// Helper function to read file as DataURL (base64)
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(file);
    });
}

function deleteItem(id) {
    // Check if item is currently rented
    const isRented = rentals.some(rental => rental.itemId === id && rental.status === 'active');
    if (isRented) {
        showNotification('Barang tidak dapat dihapus karena sedang disewa!', 'error');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        items = items.filter(i => i.id !== id);
        localStorage.setItem('rentalItems', JSON.stringify(items));
        loadItems();
        loadDashboard();
        showNotification('Barang berhasil dihapus!', 'success');
    }
}

function translateStatus(status) {
    switch(status) {
        case 'available':
            return 'Tersedia';
        case 'rented':
            return 'Disewa';
        case 'active':
            return 'Aktif';
        case 'returned':
            return 'Dikembalikan';
        default:
            return status;
    }
}

// Rental functions
function loadRentals(sortKey = null, sortOrder = 'asc') {
    const tbody = document.getElementById('rentalsTableBody');
    tbody.innerHTML = '';

    let sortedRentals = [...rentals];
    if (sortKey) {
        sortedRentals.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            // For itemName, compare item names
            if (sortKey === 'itemName') {
                const itemA = items.find(i => i.id === a.itemId);
                const itemB = items.find(i => i.id === b.itemId);
                valA = itemA ? itemA.name : '';
                valB = itemB ? itemB.name : '';
            }

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    sortedRentals.forEach(rental => {
        const item = items.find(i => i.id === rental.itemId);
        const itemName = item ? item.name : 'Barang tidak ditemukan';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rental.id}</td>
            <td>${rental.customerName}</td>
            <td>${rental.customerPhone}</td>
            <td>${itemName}</td>
            <td>${rental.pricingType}</td>
            <td>Rp ${rental.totalCost.toLocaleString('id-ID')}</td>
            <td>${rental.startDate}</td>
            <td>${rental.duration}</td>
            <td><span class="status-badge status-${rental.status}">${translateStatus(rental.status)}</span></td>
            <td>
                <button class="btn-edit" onclick="editRental(${rental.id})">Edit</button>
                <button class="btn-delete" onclick="deleteRental(${rental.id})">Hapus</button>
                ${rental.status === 'active' ? `<button class="btn-primary" onclick="showInvoice(${rental.id})">Invoice</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update item dropdown in rental form
    updateItemDropdown();
}

function updateItemDropdown() {
    const itemSelect = document.getElementById('rentalItem');
    if (itemSelect) {
        itemSelect.innerHTML = '<option value="">Pilih Barang</option>';
        const availableItems = items.filter(item => item.status === 'available');
        availableItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${item.code})`;
            itemSelect.appendChild(option);
        });
    }
}

function updatePricingOptions() {
    const itemSelect = document.getElementById('rentalItem');
    const pricingSelect = document.getElementById('pricingOption');

    if (!itemSelect || !pricingSelect) return;

    if (!itemSelect.value) {
        pricingSelect.innerHTML = '<option value="">Pilih Opsi Harga</option>';
        return;
    }

    const selectedItem = items.find(i => i.id === parseInt(itemSelect.value));
    if (selectedItem && selectedItem.pricingOptions) {
        pricingSelect.innerHTML = '<option value="">Pilih Opsi Harga</option>';

        selectedItem.pricingOptions.forEach((option, index) => {
            let typeName = '';
            switch(option.type) {
                case 'hourly': typeName = 'Per Jam'; break;
                case 'daily': typeName = 'Per Hari'; break;
                case 'weekly': typeName = 'Per Minggu'; break;
                case 'monthly': typeName = 'Per Bulan'; break;
                case 'custom': typeName = option.customName || 'Custom'; break;
            }

            const optionElement = document.createElement('option');
            optionElement.value = index;
            optionElement.textContent = `${typeName} - Rp ${option.price.toLocaleString('id-ID')}`;
            pricingSelect.appendChild(optionElement);
        });
    }
}

function calculateRentalCost() {
    const itemSelect = document.getElementById('rentalItem');
    const pricingSelect = document.getElementById('pricingOption');
    const duration = parseInt(document.getElementById('duration').value) || 1;
    const manualPrice = parseInt(document.getElementById('manualPrice').value);

    if (!itemSelect || !pricingSelect) return;

    if (!itemSelect.value || !pricingSelect.value) {
        const totalCostInput = document.getElementById('totalCost');
        if (totalCostInput) totalCostInput.value = '';
        return;
    }

    if (manualPrice && manualPrice > 0) {
        const totalCostInput = document.getElementById('totalCost');
        if (totalCostInput) totalCostInput.value = manualPrice * duration;
        return;
    }

    const selectedItem = items.find(i => i.id === parseInt(itemSelect.value));
    const selectedPricing = selectedItem.pricingOptions[parseInt(pricingSelect.value)];

    if (selectedPricing) {
        const totalCost = selectedPricing.price * duration;
        const totalCostInput = document.getElementById('totalCost');
        if (totalCostInput) totalCostInput.value = totalCost;
    }
}

function showAddRentalModal() {
    // Reset form
    const form = document.getElementById('addRentalForm');
    if (form) {
        form.reset();
    }

    // Set default start date to today
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.value = today;
    }

    updateItemDropdown();
    document.getElementById('addRentalModal').style.display = 'block';
}

function editRental(id) {
    const rental = rentals.find(r => r.id === id);
    if (rental) {
        // Reset form first
        const form = document.getElementById('addRentalForm');
        if (form) {
            form.reset();
        }

        // Fill form with rental data
        document.getElementById('customerName').value = rental.customerName;
        document.getElementById('customerPhone').value = rental.customerPhone;
        document.getElementById('rentalItem').value = rental.itemId;
        document.getElementById('startDate').value = rental.startDate;
        document.getElementById('duration').value = rental.duration;
        document.getElementById('totalCost').value = rental.totalCost;

        updatePricingOptions();
        document.getElementById('addRentalModal').style.display = 'block';
    }
}

function saveRental() {
    const rentalId = ''; // For new rentals, this will be empty
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const itemId = parseInt(document.getElementById('rentalItem').value);
    const pricingIndex = document.getElementById('pricingOption').value;
    const startDate = document.getElementById('startDate').value;
    const duration = parseInt(document.getElementById('duration').value);
    const totalCost = parseInt(document.getElementById('totalCost').value);
    const manualPrice = parseInt(document.getElementById('manualPrice').value);
    
    if (!customerName || !customerPhone || !itemId || !startDate || !duration || !totalCost) {
        showNotification('Semua field harus diisi!', 'error');
        return;
    }
    
    const selectedItem = items.find(i => i.id === itemId);
    let pricingType = 'Manual';
    
    if (pricingIndex !== '' && selectedItem.pricingOptions[parseInt(pricingIndex)]) {
        const selectedPricing = selectedItem.pricingOptions[parseInt(pricingIndex)];
        switch(selectedPricing.type) {
            case 'hourly': pricingType = 'Per Jam'; break;
            case 'daily': pricingType = 'Per Hari'; break;
            case 'weekly': pricingType = 'Per Minggu'; break;
            case 'monthly': pricingType = 'Per Bulan'; break;
            case 'custom': pricingType = selectedPricing.customName || 'Custom'; break;
        }
    }
    
    if (rentalId) {
        // Edit existing rental
        const rental = rentals.find(r => r.id === parseInt(rentalId));
        rental.customerName = customerName;
        rental.customerPhone = customerPhone;
        rental.itemId = itemId;
        rental.pricingType = pricingType;
        rental.startDate = startDate;
        rental.duration = duration;
        rental.totalCost = totalCost;
        showNotification('Penyewaan berhasil diperbarui!', 'success');
    } else {
        // Add new rental
        const newRental = {
            id: Date.now(),
            customerName,
            customerPhone,
            itemId,
            itemName: selectedItem.name,
            pricingType,
            startDate,
            duration,
            totalCost,
            status: 'active'
        };
        rentals.push(newRental);
        
        // Update item status
        selectedItem.status = 'rented';
        localStorage.setItem('rentalItems', JSON.stringify(items));
        
        showNotification('Penyewaan berhasil ditambahkan!', 'success');
        
        // Show invoice automatically
        setTimeout(() => {
            showInvoice(newRental.id);
        }, 500);
    }
    
    localStorage.setItem('rentalData', JSON.stringify(rentals));
    loadRentals();
    loadItems();
    loadDashboard();
    closeModal('addRentalModal');
}

function deleteRental(id) {
    if (confirm('Apakah Anda yakin ingin menghapus penyewaan ini?')) {
        const rental = rentals.find(r => r.id === id);
        if (rental) {
            // Update item status back to available
            const item = items.find(i => i.id === rental.itemId);
            if (item) {
                item.status = 'available';
                localStorage.setItem('rentalItems', JSON.stringify(items));
            }
        }
        
        rentals = rentals.filter(r => r.id !== id);
        localStorage.setItem('rentalData', JSON.stringify(rentals));
        loadRentals();
        loadItems();
        loadDashboard();
        showNotification('Penyewaan berhasil dihapus!', 'success');
    }
}

// Return functions
function loadReturns() {
    const tbody = document.getElementById('returnsTableBody');
    tbody.innerHTML = '';
    
    returns.forEach(returnItem => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${returnItem.rentalId}</td>
            <td>${returnItem.customerName}</td>
            <td>${returnItem.itemName}</td>
            <td>${returnItem.returnDate}</td>
            <td>${returnItem.condition}</td>
            <td>${returnItem.discount}%</td>
            <td>Rp ${returnItem.finalCost.toLocaleString('id-ID')}</td>
            <td>
                <button class="btn-edit" onclick="editReturn(${returnItem.rentalId})">Edit</button>
                <button class="btn-delete" onclick="deleteReturn(${returnItem.rentalId})">Hapus</button>
                <button class="btn-primary" onclick="showReturnInvoice(${returnItem.rentalId})">Invoice</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Update active rentals dropdown
    updateActiveRentalsDropdown();
}

function updateActiveRentalsDropdown() {
    const rentalSelect = document.getElementById('returnRental');
    if (rentalSelect) {
        rentalSelect.innerHTML = '<option value="">Pilih Penyewaan</option>';
        const activeRentals = rentals.filter(rental => rental.status === 'active');
        activeRentals.forEach(rental => {
            const option = document.createElement('option');
            option.value = rental.id;
            option.textContent = `#${rental.id} - ${rental.customerName} (${rental.itemName})`;
            rentalSelect.appendChild(option);
        });
    }
}

function updateReturnDetails() {
    const rentalSelect = document.getElementById('returnRental');
    if (!rentalSelect) return;
    const selectedRental = rentals.find(r => r.id === parseInt(rentalSelect.value));
    
    const returnCustomerName = document.getElementById('returnCustomerName');
    const returnItemName = document.getElementById('returnItemName');
    const returnOriginalCost = document.getElementById('returnOriginalCost');
    const finalCostInput = document.getElementById('finalCost');

    if (selectedRental) {
        if (returnCustomerName) returnCustomerName.textContent = selectedRental.customerName;
        if (returnItemName) returnItemName.textContent = selectedRental.itemName;
        if (returnOriginalCost) returnOriginalCost.textContent = `Rp ${selectedRental.totalCost.toLocaleString('id-ID')}`;
        calculateFinalCost();
    } else {
        if (returnCustomerName) returnCustomerName.textContent = '-';
        if (returnItemName) returnItemName.textContent = '-';
        if (returnOriginalCost) returnOriginalCost.textContent = '-';
        if (finalCostInput) finalCostInput.value = '';
    }
}

function calculateFinalCost() {
    const rentalSelect = document.getElementById('returnRental');
    const discountInput = document.getElementById('discount');
    const penaltyInput = document.getElementById('returnPenalty');

    if (!rentalSelect || !discountInput || !penaltyInput) return;

    const discount = parseInt(discountInput.value) || 0;
    const penalty = parseInt(penaltyInput.value) || 0;

    const selectedRental = rentals.find(r => r.id === parseInt(rentalSelect.value));
    if (selectedRental) {
        const originalCost = selectedRental.totalCost;
        const discountAmount = (originalCost * discount) / 100;
        const finalCost = originalCost - discountAmount + penalty;
        const finalCostInput = document.getElementById('finalCost');
        if (finalCostInput) {
            finalCostInput.value = Math.max(0, finalCost);
        }
    }
}

function showAddReturnModal() {
    const modalTitle = document.getElementById('returnModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Proses Pengembalian';
    }
    const addReturnForm = document.getElementById('addReturnForm');
    if (addReturnForm) {
        addReturnForm.reset();
    }
    const returnId = document.getElementById('returnId');
    if (returnId) {
        returnId.value = '';
    }

    // Set default return date to today
    const today = new Date().toISOString().split('T')[0];
    const returnDate = document.getElementById('returnDate');
    if (returnDate) {
        returnDate.value = today;
    }

    updateActiveRentalsDropdown();
    const addReturnModal = document.getElementById('addReturnModal');
    if (addReturnModal) {
        addReturnModal.style.display = 'block';
    }
}

function editReturn(rentalId) {
    const returnItem = returns.find(r => r.rentalId === rentalId);
    if (returnItem) {
        document.getElementById('returnModalTitle').textContent = 'Edit Pengembalian';
        document.getElementById('addReturnForm').reset();
        document.getElementById('returnId').value = returnItem.rentalId;
        document.getElementById('returnRental').value = returnItem.rentalId;
        document.getElementById('returnDate').value = returnItem.returnDate;
        document.getElementById('returnCondition').value = returnItem.condition;
        document.getElementById('discount').value = returnItem.discount;
        document.getElementById('returnPenalty').value = returnItem.penalty || 0;
        document.getElementById('penaltyReason').value = returnItem.penaltyReason || '';
        document.getElementById('finalCost').value = returnItem.finalCost;

        updateReturnDetails();
        document.getElementById('addReturnModal').style.display = 'block';
    }
}

function saveReturn() {
    const returnIdElem = document.getElementById('returnId');
    const returnId = returnIdElem ? returnIdElem.value : null;
    const rentalIdElem = document.getElementById('returnRental');
    const rentalId = rentalIdElem ? parseInt(rentalIdElem.value) : null;
    const returnDateElem = document.getElementById('returnDate');
    const returnDate = returnDateElem ? returnDateElem.value : null;
    const conditionElem = document.getElementById('returnCondition');
    const condition = conditionElem ? conditionElem.value : null;
    const discountElem = document.getElementById('discount');
    const discount = discountElem ? parseInt(discountElem.value) || 0 : 0;
    const penaltyElem = document.getElementById('returnPenalty');
    const penalty = penaltyElem ? parseInt(penaltyElem.value) || 0 : 0;
    const penaltyReasonElem = document.getElementById('penaltyReason');
    const penaltyReason = penaltyReasonElem ? penaltyReasonElem.value : '';
    const finalCostElem = document.getElementById('finalCost');
    const finalCost = finalCostElem ? parseInt(finalCostElem.value) : 0;

    if (!rentalId || !returnDate || !condition) {
        showNotification('Semua field harus diisi!', 'error');
        return;
    }

    if (penalty > 0 && !penaltyReason.trim()) {
        showNotification('Alasan denda harus diisi jika ada denda!', 'error');
        return;
    }

    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) {
        showNotification('Penyewaan tidak ditemukan!', 'error');
        return;
    }

    if (returnId) {
        // Edit existing return
        const returnItem = returns.find(r => r.rentalId === parseInt(returnId));
        returnItem.returnDate = returnDate;
        returnItem.condition = condition;
        returnItem.discount = discount;
        returnItem.penalty = penalty;
        returnItem.penaltyReason = penaltyReason;
        returnItem.finalCost = finalCost;
        showNotification('Pengembalian berhasil diperbarui!', 'success');
    } else {
        // Add new return
        const newReturn = {
            rentalId: rental.id,
            customerName: rental.customerName,
            itemName: rental.itemName,
            returnDate,
            condition,
            discount,
            penalty,
            penaltyReason,
            finalCost
        };
        returns.push(newReturn);

        // Update rental status
        rental.status = 'returned';

        // Update item status and condition
        const item = items.find(i => i.id === rental.itemId);
        if (item) {
            item.status = 'available';
            item.condition = condition;
        }

        localStorage.setItem('rentalData', JSON.stringify(rentals));
        localStorage.setItem('rentalItems', JSON.stringify(items));

        showNotification('Pengembalian berhasil diproses!', 'success');

        // Show return invoice/receipt automatically
        setTimeout(() => {
            showReturnInvoice(rental.id);
        }, 500);
    }

    localStorage.setItem('returnData', JSON.stringify(returns));
    loadReturns();
    loadRentals();
    loadItems();
    loadDashboard();
    closeModal('addReturnModal');
}

function deleteReturn(rentalId) {
    if (confirm('Apakah Anda yakin ingin menghapus data pengembalian ini?')) {
        returns = returns.filter(r => r.rentalId !== rentalId);
        
        // Update rental status back to active
        const rental = rentals.find(r => r.id === rentalId);
        if (rental) {
            rental.status = 'active';
            
            // Update item status back to rented
            const item = items.find(i => i.id === rental.itemId);
            if (item) {
                item.status = 'rented';
            }
            
            localStorage.setItem('rentalData', JSON.stringify(rentals));
            localStorage.setItem('rentalItems', JSON.stringify(items));
        }
        
        localStorage.setItem('returnData', JSON.stringify(returns));
        loadReturns();
        loadRentals();
        loadItems();
        loadDashboard();
        showNotification('Data pengembalian berhasil dihapus!', 'success');
    }
}

// Barcode scanner functions
function showBarcodeScanner() {
    document.getElementById('barcodeScannerModal').style.display = 'block';
    // In a real implementation, you would initialize the camera here
    showNotification('Fitur barcode scanner akan diimplementasikan dengan kamera', 'info');
}

function searchRentalByBarcode() {
    const barcode = document.getElementById('barcodeInput').value;
    if (!barcode) {
        showNotification('Masukkan kode barcode!', 'error');
        return;
    }
    
    // Find item by code
    const item = items.find(i => i.code === barcode);
    if (!item) {
        showNotification('Barang dengan kode tersebut tidak ditemukan!', 'error');
        return;
    }
    
    // Find active rental for this item
    const activeRental = rentals.find(r => r.itemId === item.id && r.status === 'active');
    if (!activeRental) {
        showNotification('Tidak ada penyewaan aktif untuk barang ini!', 'error');
        return;
    }
    
    // Close barcode scanner and open return modal with pre-filled data
    closeModal('barcodeScannerModal');
    showAddReturnModal();
    document.getElementById('returnRental').value = activeRental.id;
    updateReturnDetails();
    
    showNotification('Penyewaan ditemukan! Silakan lengkapi data pengembalian.', 'success');
}

// Invoice functions
function showInvoice(rentalId) {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return;
    
    const item = items.find(i => i.id === rental.itemId);
    const invoiceContent = `
        <div class="invoice-header">
            <h2>INVOICE PENYEWAAN</h2>
            <p>No. Invoice: INV-${rental.id}</p>
            <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        <div class="invoice-details">
            <div class="customer-info">
                <h3>Informasi Pelanggan</h3>
                <p><strong>Nama:</strong> ${rental.customerName}</p>
                <p><strong>Telepon:</strong> ${rental.customerPhone}</p>
            </div>
            
            <div class="rental-info">
                <h3>Detail Penyewaan</h3>
                <p><strong>Barang:</strong> ${rental.itemName}</p>
                <p><strong>Kode:</strong> ${item ? item.code : '-'}</p>
                <p><strong>Jenis Sewa:</strong> ${rental.pricingType}</p>
                <p><strong>Tanggal Mulai:</strong> ${rental.startDate}</p>
                <p><strong>Durasi:</strong> ${rental.duration}</p>
                <p><strong>Total Biaya:</strong> Rp ${rental.totalCost.toLocaleString('id-ID')}</p>
            </div>
        </div>
        
        <div class="invoice-footer">
            <p>Terima kasih atas kepercayaan Anda!</p>
        </div>
    `;
    
    document.getElementById('invoiceContent').innerHTML = invoiceContent;
    document.getElementById('invoiceModal').style.display = 'block';
}

function showReturnInvoice(rentalId) {
    const returnItem = returns.find(r => r.rentalId === rentalId);
    const rental = rentals.find(r => r.id === rentalId);
    
    if (!returnItem || !rental) return;
    
    let invoiceContent = '';
    
    if (returnItem.penalty && returnItem.penalty > 0) {
        // Invoice with penalty
        invoiceContent = `
            <div class="invoice-header">
                <h2>INVOICE PENGEMBALIAN</h2>
                <p>No. Invoice: RET-${returnItem.rentalId}</p>
                <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
            </div>
            
            <div class="invoice-details">
                <div class="customer-info">
                    <h3>Informasi Pelanggan</h3>
                    <p><strong>Nama:</strong> ${returnItem.customerName}</p>
                </div>
                
                <div class="return-info">
                    <h3>Detail Pengembalian</h3>
                    <p><strong>Barang:</strong> ${returnItem.itemName}</p>
                    <p><strong>Tanggal Kembali:</strong> ${returnItem.returnDate}</p>
                    <p><strong>Kondisi:</strong> ${returnItem.condition}</p>
                    <p><strong>Biaya Sewa:</strong> Rp ${rental.totalCost.toLocaleString('id-ID')}</p>
                    <p><strong>Diskon:</strong> ${returnItem.discount}%</p>
                    <p><strong>Denda:</strong> Rp ${returnItem.penalty.toLocaleString('id-ID')}</p>
                    <p><strong>Alasan Denda:</strong> ${returnItem.penaltyReason}</p>
                    <hr>
                    <p><strong>Total Biaya:</strong> Rp ${returnItem.finalCost.toLocaleString('id-ID')}</p>
                </div>
            </div>
            
            <div class="invoice-footer">
                <p>Terima kasih atas kepercayaan Anda!</p>
            </div>
        `;
    } else {
        // Receipt without penalty
        invoiceContent = `
            <div class="invoice-header">
                <h2>BUKTI TERIMA BARANG</h2>
                <p>No. Bukti: REC-${returnItem.rentalId}</p>
                <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
            </div>
            
            <div class="invoice-details">
                <div class="customer-info">
                    <h3>Informasi Pelanggan</h3>
                    <p><strong>Nama:</strong> ${returnItem.customerName}</p>
                </div>
                
                <div class="return-info">
                    <h3>Detail Pengembalian</h3>
                    <p><strong>Barang:</strong> ${returnItem.itemName}</p>
                    <p><strong>Tanggal Kembali:</strong> ${returnItem.returnDate}</p>
                    <p><strong>Kondisi:</strong> ${returnItem.condition}</p>
                    <p><strong>Status:</strong> Barang telah diterima dengan baik</p>
                </div>
            </div>
            
            <div class="invoice-footer">
                <p>Barang telah dikembalikan dan diterima dalam kondisi baik.</p>
                <p>Terima kasih atas kepercayaan Anda!</p>
            </div>
        `;
    }
    
    document.getElementById('invoiceContent').innerHTML = invoiceContent;
    document.getElementById('invoiceModal').style.display = 'block';
}

function printInvoice() {
    const invoiceContent = document.getElementById('invoiceContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .invoice-header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 30px; }
                    .customer-info, .rental-info, .return-info { margin-bottom: 20px; }
                    .invoice-footer { text-align: center; margin-top: 30px; }
                    hr { margin: 10px 0; }
                </style>
            </head>
            <body>
                ${invoiceContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function downloadInvoicePDF() {
    showNotification('Fitur download PDF akan diimplementasikan', 'info');
}

// Chart functions
function updateCharts() {
    updateRevenueChart();
    updateRentalChart();
    updateCategoryChart();
}

function updateRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Group returns by month
    const monthlyRevenue = {};
    returns.forEach(returnItem => {
        const month = new Date(returnItem.returnDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + returnItem.finalCost;
    });
    
    const labels = Object.keys(monthlyRevenue);
    const data = Object.values(monthlyRevenue);
    
    // Simple chart implementation (you can replace with Chart.js)
    const chartContainer = ctx.parentElement;
    chartContainer.innerHTML = `
        <h3>Pendapatan Bulanan</h3>
        <div class="simple-chart">
            ${labels.map((label, index) => `
                <div class="chart-bar">
                    <div class="bar" style="height: ${(data[index] / Math.max(...data)) * 100}px; background: #4f46e5;"></div>
                    <div class="label">${label}</div>
                    <div class="value">Rp ${data[index].toLocaleString('id-ID')}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function updateRentalChart() {
    const ctx = document.getElementById('rentalChart');
    if (!ctx) return;

    // Group rentals by month
     const monthlyRentals = {};
    rentals.forEach(rental => {
        const month = new Date(rental.startDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
        monthlyRentals[month] = (monthlyRentals[month] || 0) + 1;
    });

    const labels = Object.keys(monthlyRentals);
    const data = Object.values(monthlyRentals);

    // Simple chart implementation
    const available = items.filter(i => i.status === 'available').length;
    const rented = items.filter(i => i.status === 'rented').length;
    
    const chartContainer = ctx.parentElement;
    chartContainer.innerHTML = `
        <h3>Penyewaan Bulanan</h3>
        <div class="simple-chart">
            ${labels.length > 0 ? labels.map((label, index) => `
                <div class="chart-bar">
                    <div class="bar" style="height: ${data[index] > 0 ? (data[index] / Math.max(...data)) * 100 : 0}px; background: #f59e0b;"></div>
                    <div class="label">${label}</div>
                    <div class="value">${data[index]} penyewaan</div>
                </div>
            `).join('') : '<p>Tidak ada data penyewaan</p>'}
         </div>
    `;
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const categoryCount = {};
    items.forEach(item => {
        const category = categories.find(c => c.id === item.categoryId);
        const categoryName = category ? category.name : 'Tidak diketahui';
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });
    
    const labels = Object.keys(categoryCount);
    const data = Object.values(categoryCount);
    
    const chartContainer = ctx.parentElement;
    chartContainer.innerHTML = `
        <h3>Barang per Kategori</h3>
        <div class="simple-chart">
            ${labels.map((label, index) => `
                <div class="chart-bar">
                    <div class="bar" style="height: ${(data[index] / Math.max(...data)) * 100}px; background: #10b981;"></div>
                    <div class="label">${label}</div>
                    <div class="value">${data[index]} item</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Utility functions
function showModal(modalId, title, content) {
    const modal = document.getElementById(modalId) || createModal(modalId);
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = content;
    modal.style.display = 'block';
}

function createModal(modalId) {
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title"></h3>
                <span class="close" onclick="closeModal('${modalId}')">&times;</span>
            </div>
            <div class="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Initialize pricing options event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for rental form
    const rentalItem = document.getElementById('rentalItem');
    const pricingOption = document.getElementById('pricingOption');
    const duration = document.getElementById('duration');
    const manualPrice = document.getElementById('manualPrice');

    if (rentalItem) rentalItem.addEventListener('change', updatePricingOptions);
    if (pricingOption) pricingOption.addEventListener('change', calculateRentalCost);
    if (duration) duration.addEventListener('input', calculateRentalCost);
    if (manualPrice) manualPrice.addEventListener('input', calculateRentalCost);
    
    // Add event listeners for return form
    const returnRental = document.getElementById('returnRental');
    const returnDiscount = document.getElementById('returnDiscount');
    const returnPenalty = document.getElementById('returnPenalty');
    
    if (returnRental) returnRental.addEventListener('change', updateReturnDetails);
    if (returnDiscount) returnDiscount.addEventListener('input', calculateFinalCost);
    if (returnPenalty) returnPenalty.addEventListener('input', calculateFinalCost);
});
