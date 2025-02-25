// State management
let state = {
    selectedTags: [],
    selectedRemoveTags: [],
    selectedItems: [],
    selectedRemoveItems: [],
    availableTags: [], // Will be populated from the server
    availableItems: {
        tables: [], // Will be populated from the server
        buckets: [] // Will be populated from the server
    }
};

// Bulk operations state
let selectedItems = new Set();

// Tag Management Modal Functions
let selectedTagsSet = new Set();
let partialTagsSet = new Set();
let initialTagState = new Map(); // Stores the initial state of tags for selected items

// Add these state variables at the top with other state declarations
let hasTagChanges = false;
let initialTagSelections = new Set();

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all buckets as collapsed
    data.forEach(bucket => {
        collapsedBuckets.add(bucket.name);
    });

    // Initialize the table
    if (typeof renderTable === 'function') {
    renderTable();
    }
    
    // Add event listener for the select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // Add event listeners for individual checkboxes (delegated through table)
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        tableBody.addEventListener('change', handleCheckboxChange);
    }

    // Initialize bulk toolbar
    initializeBulkToolbar();
});

function initializeBulkToolbar() {
    const bulkActions = document.getElementById('bulkActions');
    if (bulkActions) {
        bulkActions.style.display = 'none';
    }
}

function updateHeaderCheckbox() {
    const headerCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#tableBody input[type="checkbox"]');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        headerCheckbox.checked = false;
        headerCheckbox.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
        headerCheckbox.checked = true;
        headerCheckbox.indeterminate = false;
    } else {
        headerCheckbox.checked = false;
        headerCheckbox.indeterminate = true;
    }
}

// Handle individual checkbox changes
function handleCheckboxChange(event) {
    if (event.target.type === 'checkbox') {
        const row = event.target.closest('tr');
        if (row) {
            const itemId = row.dataset.itemId;
            if (event.target.checked) {
                selectedItems.add(itemId);
            } else {
                selectedItems.delete(itemId);
            }
            updateHeaderCheckbox();
            updateBulkToolbar();
        }
    }
}

// Handle select all checkbox
function handleSelectAll(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('#tableBody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        const row = checkbox.closest('tr');
        if (row) {
            const itemId = row.dataset.itemId;
            if (isChecked) {
                selectedItems.add(itemId);
            } else {
                selectedItems.delete(itemId);
            }
        }
    });
    
    event.target.indeterminate = false;
    updateBulkToolbar();
}

// Update the bulk operations toolbar
function updateBulkToolbar() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (!bulkActions || !selectedCount) {
        console.error('Bulk actions elements not found');
        return;
    }
    
    if (selectedItems.size > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = `${selectedItems.size} item${selectedItems.size === 1 ? '' : 's'} selected`;
    } else {
        bulkActions.style.display = 'none';
    }
}

// Clear all selections
function clearSelection() {
    selectedItems.clear();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    updateBulkToolbar();
}

// Tag operations
function openTagSelector() {
    if (selectedItems.size === 0) {
        console.warn('No items selected');
        return;
    }

    // Reset states
    selectedTagsSet.clear();
    partialTagsSet.clear();
    initialTagState.clear();
    initialTagSelections.clear();
    hasTagChanges = false; // Reset changes flag

    // Get current state of tags for selected items
    const selectedItemsArray = Array.from(selectedItems);
    const tagCounts = new Map();
    const totalItems = selectedItemsArray.length;

    // Count current tags
    selectedItemsArray.forEach(itemId => {
        let tags = [];
        data.forEach(bucket => {
            if (itemId === bucket.name && bucket.tags) {
                tags = bucket.tags;
            }
            bucket.tables.forEach(table => {
                const fullName = `${bucket.name}/${table.name}`;
                if (itemId === fullName && table.tags) {
                    tags = table.tags;
                }
            });
        });
        tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });

    // Store the current state as initial state
    tagCounts.forEach((count, tag) => {
        initialTagState.set(tag, count);
        initialTagSelections.add(tag);
        if (count === totalItems) {
            selectedTagsSet.add(tag);
        } else if (count > 0) {
            partialTagsSet.add(tag);
        }
    });
    
    // Show modal
    const modal = document.getElementById('tagManagementModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Initialize tags and update button state
    renderAvailableTags();
    updateApplyButtonState();

    // Add search functionality
    const searchInput = document.getElementById('tagSearchInput');
    searchInput.value = '';
    searchInput.addEventListener('input', filterTags);
}

function closeTagManagementModal() {
    const modal = document.getElementById('tagManagementModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function renderAvailableTags() {
    const container = document.getElementById('availableTagsContainer');
    container.innerHTML = '';

    // Get all available tags from the data
    const availableTags = new Set();
    data.forEach(bucket => {
        if (bucket.tags) {
            bucket.tags.forEach(tag => availableTags.add(tag));
        }
        bucket.tables.forEach(table => {
            if (table.tags) {
                table.tags.forEach(tag => availableTags.add(tag));
            }
        });
    });

    // Sort tags alphabetically
    const sortedTags = Array.from(availableTags).sort();

    // Render each tag
    sortedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'flex items-center gap-2 py-1';

        // Check if tag is fully or partially selected
        const isFullySelected = selectedTagsSet.has(tag);
        const isPartiallySelected = partialTagsSet.has(tag);

        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'relative flex items-center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `tag-${tag}`;
        checkbox.className = 'w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500';
        checkbox.checked = isFullySelected || isPartiallySelected;
        checkbox.indeterminate = isPartiallySelected;

        const label = document.createElement('label');
        label.htmlFor = `tag-${tag}`;
        label.className = 'text-sm text-gray-700 flex items-center gap-2';
        label.innerHTML = `
            <span class="${getTagColorClasses(tag)} px-2 py-1 rounded text-xs">#${tag}</span>
        `;

        checkbox.addEventListener('change', (e) => {
            if (!e.target.checked) {
                removeTagFromItems(tag);
            } else {
                addTagToItems(tag);
            }
        });

        checkboxContainer.appendChild(checkbox);
        tagElement.appendChild(checkboxContainer);
        tagElement.appendChild(label);
        container.appendChild(tagElement);
    });
}

function filterTags() {
    const searchTerm = document.getElementById('tagSearchInput').value.toLowerCase();
    const tagElements = document.querySelectorAll('#availableTagsContainer > div');
    
    tagElements.forEach(element => {
        const tagName = element.querySelector('label').textContent.toLowerCase();
        if (tagName.includes(searchTerm)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
}

// Function to show the info toaster
function showToaster(message, duration = 3000) {
    const toaster = document.getElementById('infoToaster');
    const messageEl = document.getElementById('toasterMessage');
    
    if (!toaster || !messageEl) return;
    
    // Set the message
    messageEl.textContent = message;
    
    // Show the toaster
    toaster.classList.add('show');
    
    // Hide after duration
    setTimeout(() => {
        toaster.classList.remove('show');
    }, duration);
}

async function applyTagChanges() {
    if (!hasTagChanges) return;
    
    try {
        const selectedItemsArray = Array.from(selectedItems);
        // Only consider tags that are fully selected for adding
        const addedTags = Array.from(selectedTagsSet).filter(tag => !initialTagSelections.has(tag));
        // Remove tags that are no longer in either selectedTagsSet or partialTagsSet
        const removedTags = Array.from(initialTagSelections)
            .filter(tag => !selectedTagsSet.has(tag) && !partialTagsSet.has(tag));
        
        // TODO: Replace with actual API calls
        console.log('Applying changes:', {
            items: selectedItemsArray,
            addedTags,
            removedTags
        });
        
        // Update the data structure
        selectedItemsArray.forEach(itemId => {
            data.forEach(bucket => {
                if (itemId === bucket.name) {
                    bucket.tags = bucket.tags || [];
                    bucket.tags = [...new Set([...bucket.tags, ...addedTags])];
                    bucket.tags = bucket.tags.filter(tag => !removedTags.includes(tag));
                }
                bucket.tables.forEach(table => {
                    const fullName = `${bucket.name}/${table.name}`;
                    if (itemId === fullName) {
                        table.tags = table.tags || [];
                        table.tags = [...new Set([...table.tags, ...addedTags])];
                        table.tags = table.tags.filter(tag => !removedTags.includes(tag));
                    }
                });
            });
        });

        showToaster('Tags updated successfully');
        
        // Close the modal
        closeTagManagementModal();
        
        // Store current showTags state
        const tagsVisibilityToggle = document.querySelector('input[name="tagsVisibility"]:checked');
        const shouldShowTags = tagsVisibilityToggle ? tagsVisibilityToggle.value === 'show-tags' : false;
        
        // Refresh the table to show updated tags
        window.showTags = shouldShowTags; // Ensure global state is updated
        renderTable();
        
        // Reset states
        hasTagChanges = false;
        updateApplyButtonState();
    } catch (error) {
        console.error('Error applying tag changes:', error);
        showToaster('Failed to update tags');
    }
}

function getTagColorClasses(tag) {
    const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return `${colors.bg} ${colors.text}`;
}

// Remove tags from selected items
async function removeBulkTags(tags) {
    if (selectedItems.size === 0 || !tags || tags.length === 0) return;
    
    try {
        // TODO: Implement API call to remove tags
        console.log('Removing tags:', tags, 'from items:', Array.from(selectedItems));
        
        // Refresh the table after removing tags
        renderTable();
        clearSelection();
    } catch (error) {
        console.error('Error removing tags:', error);
    }
}

// Override the renderTable function to preserve our header and add data attributes
window.renderTable = function() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    // Render buckets and tables
    data.forEach(bucket => {
        // Render bucket row
        const bucketRow = document.createElement('tr');
        bucketRow.className = 'hover:bg-[#EDF0F5]';
        bucketRow.dataset.itemId = bucket.name;
        bucketRow.dataset.type = 'bucket';
        
        const isCollapsed = collapsedBuckets.has(bucket.name);
        
        // Add bucket row content
        bucketRow.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex flex-col gap-[8px]">
                    <div class="flex items-center justify-between gap-[8px]">
                        <div class="flex items-center gap-[8px]">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
                            </div>
                            <div class="w-[24px] flex justify-center cursor-pointer" onclick="toggleBucket('${bucket.name}')">
                                <span class="material-icons text-gray-400 text-lg transform transition-transform duration-200 ${!isCollapsed ? 'rotate-90' : ''}">chevron_right</span>
                            </div>
                            <div class="w-[24px] flex justify-center">
                                <span class="material-icons text-gray-400 text-lg">folder</span>
                            </div>
                            <div class="flex items-center gap-[8px]">
                                <span class="${getSystemBadgeClasses(bucket.stage === 'OUT' ? 'green' : 'blue')} w-[38px] text-center">${bucket.stage}</span>
                                <span class="font-medium text-sm">${bucket.name}</span>
                                <div class="flex items-center gap-[8px]">
                                    ${bucket.shared ? `<span class="${getSystemBadgeClasses('purple')}">SHARED</span>` : ''}
                                    ${bucket.linked ? `<span class="${getSystemBadgeClasses('green')}">LINKED</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <span class="text-sm text-gray-500 whitespace-nowrap">${bucket.lastChange}</span>
                    </div>
                    ${(showTags && bucket.tags && bucket.tags.length > 0) ? `
                        <div class="flex flex-wrap gap-[8px] ml-[88px]">
                            ${bucket.tags.map(tag => {
                                const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                                return `<span class="${colors.bg} ${colors.text} px-[8px] py-[2px] rounded text-[12px]">#${tag}</span>`;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(bucketRow);

        // Render table rows for this bucket if not collapsed
        if (!isCollapsed) {
            bucket.tables.forEach(table => {
                const tableRow = document.createElement('tr');
                tableRow.className = 'hover:bg-[#EDF0F5]';
                tableRow.dataset.itemId = `${bucket.name}/${table.name}`;
                tableRow.dataset.type = 'table';
                
                // Add table row content
                tableRow.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex flex-col gap-[8px]">
                            <div class="flex items-center justify-between gap-[8px]">
                                <div class="flex items-center gap-[8px]">
                                    <div class="flex items-center gap-2">
                                        <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
                                    </div>
                                    <div class="w-[24px] invisible flex justify-center">
                                        <span class="material-icons text-gray-400 text-lg">chevron_right</span>
                                    </div>
                                    <div class="invisible w-[24px]"></div>
                                    <div class="w-[24px] flex justify-center">
                                        <i class="fas fa-table text-gray-400"></i>
                                    </div>
                                    <div class="flex items-center gap-[8px]">
                                        <span class="text-sm">${table.name}</span>
                                        <div class="flex items-center gap-[8px]">
                                            ${table.type ? `<span class="${getSystemBadgeClasses('orange')}">${table.type}</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                                <span class="text-sm text-gray-500 whitespace-nowrap">${table.lastChange}</span>
                            </div>
                            ${(showTags && table.tags && table.tags.length > 0) ? `
                                <div class="flex flex-wrap gap-[8px] ml-[120px]">
                                    ${table.tags.map(tag => {
                                        const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                                        return `<span class="${colors.bg} ${colors.text} px-[8px] py-[2px] rounded text-[12px]">#${tag}</span>`;
                                    }).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </td>
                `;
                tableBody.appendChild(tableRow);
            });
        }
    });

    // Update checkbox states based on current selection
    const checkboxes = document.querySelectorAll('#tableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row && row.dataset.itemId) {
            checkbox.checked = selectedItems.has(row.dataset.itemId);
        }
    });

    // Update bulk actions visibility
    updateBulkToolbar();
};

// Helper function for system badges
function getSystemBadgeClasses(type) {
    const baseClasses = 'px-[6px] py-[2px] rounded text-[11px] font-medium tracking-wide border border-opacity-40';
    switch (type) {
        case 'blue':
            return `${baseClasses} border-blue-700 text-blue-700`;
        case 'green':
            return `${baseClasses} border-green-700 text-green-700`;
        case 'purple':
            return `${baseClasses} border-purple-700 text-purple-700`;
        case 'orange':
            return `${baseClasses} border-orange-700 text-orange-700`;
        default:
            return `${baseClasses} border-gray-700 text-gray-700`;
    }
}

// Item Selection Functions
function updateItemsList() {
    const itemsList = document.getElementById('itemsList');
    const targetType = document.querySelector('input[name="targetType"]:checked').id;
    const items = targetType === 'tableRadio' ? state.availableItems.tables : state.availableItems.buckets;

    itemsList.innerHTML = items.map(item => `
        <div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
            <input type="checkbox" 
                   id="item-${item.id}" 
                   ${state.selectedItems.includes(item.id) ? 'checked' : ''}
                   onchange="toggleItemSelection('${item.id}')">
            <label for="item-${item.id}" class="text-sm text-gray-700">${item.name}</label>
        </div>
    `).join('');
}

function updateRemoveItemsList() {
    const removeItemsList = document.getElementById('removeItemsList');
    // Similar to updateItemsList but for items to remove tags from
    // Implementation will depend on the data structure
}

function toggleItemSelection(itemId) {
    const index = state.selectedItems.indexOf(itemId);
    if (index === -1) {
        state.selectedItems.push(itemId);
    } else {
        state.selectedItems.splice(index, 1);
    }
    updateSelectedCounts();
}

function clearSelection() {
    state.selectedItems = [];
    updateItemsList();
    updateSelectedCounts();
}

function clearRemoveSelection() {
    state.selectedRemoveItems = [];
    updateRemoveItemsList();
    updateSelectedCounts();
}

function updateSelectedCounts() {
    document.getElementById('selectedItemsCount').textContent = state.selectedItems.length;
    document.getElementById('selectedRemoveItemsCount').textContent = state.selectedRemoveItems.length;
}

// API Functions
async function fetchAvailableTags() {
    try {
        // Implement API call to fetch available tags
        // For now, using mock data
        state.availableTags = [
            { id: '1', name: 'Important' },
            { id: '2', name: 'Archive' },
            { id: '3', name: 'Review' }
        ];
    } catch (error) {
        console.error('Error fetching tags:', error);
        showError('Failed to fetch available tags.');
    }
}

async function fetchAvailableItems() {
    try {
        // Implement API call to fetch available items
        // For now, using mock data
        state.availableItems = {
            tables: [
                { id: 't1', name: 'Table 1' },
                { id: 't2', name: 'Table 2' },
                { id: 't3', name: 'Table 3' }
            ],
            buckets: [
                { id: 'b1', name: 'Bucket 1' },
                { id: 'b2', name: 'Bucket 2' },
                { id: 'b3', name: 'Bucket 3' }
            ]
        };
    } catch (error) {
        console.error('Error fetching items:', error);
        showError('Failed to fetch available items.');
    }
}

// UI Feedback Functions
function showError(message) {
    // Implement error notification
    console.error(message);
}

function showSuccess(message) {
    // Implement success notification
    console.log(message);
}

// Event Listeners
document.querySelectorAll('input[name="targetType"]').forEach(radio => {
    radio.addEventListener('change', () => {
        clearSelection();
        updateItemsList();
    });
});

// Function to render a bucket row
function renderBucketRow(bucket, tableBody, shouldShowTags = false) {
    const bucketRow = document.createElement('tr');
    bucketRow.className = 'hover:bg-[#EDF0F5]';
    const isCollapsed = collapsedBuckets.has(bucket.name);
    const searchTerms = document.getElementById('searchInput').value.toLowerCase().split(' ').filter(term => term);
    const isSelected = selectedItems.has(bucket.name);
    
    bucketRow.innerHTML = `
        <td class="px-6 py-4">
            <div class="flex flex-col gap-[8px]">
                <div class="flex items-center justify-between gap-[8px]">
                    <div class="flex items-center gap-[8px]">
                        <div class="flex items-center gap-2">
                            <div class="relative flex items-center">
                                <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" ${isSelected ? 'checked' : ''}>
                                <button class="tag-manager-icon absolute left-5 p-1 rounded-md hover:bg-gray-100 ${isSelected ? '' : 'hidden'}" onclick="openTagManager('${bucket.name}')" title="Manage Tags">
                                    <svg class="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="w-[24px] flex justify-center cursor-pointer" onclick="toggleBucket('${bucket.name}')">
                            <span class="material-icons text-gray-400 text-lg transform transition-transform duration-200 ${!isCollapsed ? 'rotate-90' : ''}">chevron_right</span>
                        </div>
                        <div class="w-[24px] flex justify-center">
                            <span class="material-icons text-gray-400 text-lg">folder</span>
                        </div>
                        <div class="flex items-center gap-[8px]">
                            <span class="${getSystemBadgeClasses(bucket.stage === 'OUT' ? 'green' : 'blue')} w-[38px] text-center">${bucket.stage}</span>
                            <span class="font-medium text-sm">${searchTerms.length > 0 ? highlightMatches(bucket.name, searchTerms) : bucket.name}</span>
                            <div class="flex items-center gap-[8px]">
                                ${bucket.shared ? `<span class="${getSystemBadgeClasses('purple')}">SHARED</span>` : ''}
                                ${bucket.linked ? `<span class="${getSystemBadgeClasses('green')}">LINKED</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <span class="text-sm text-gray-500 whitespace-nowrap">${bucket.lastChange}</span>
                </div>
                ${(shouldShowTags || showTags) && bucket.tags && bucket.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-[8px] ml-[88px]">
                        ${bucket.tags.map(tag => {
                            const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                            return `<span class="${colors.bg} ${colors.text} px-[8px] py-[2px] rounded text-[12px]">#${searchTerms.length > 0 ? highlightMatches(tag, searchTerms) : tag}</span>`;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        </td>
    `;
    tableBody.appendChild(bucketRow);
}

// Function to render a table row
function renderTableRow(bucket, table, tableBody, shouldShowTags = false) {
    const tableRow = document.createElement('tr');
    tableRow.className = 'hover:bg-[#EDF0F5]';
    const searchTerms = document.getElementById('searchInput').value.toLowerCase().split(' ').filter(term => term);
    const fullName = `${bucket.name} / ${table.name}`;
    const isSelected = selectedItems.has(fullName);
    
    tableRow.innerHTML = `
        <td class="px-6 py-4">
            <div class="flex flex-col gap-[8px]">
                <div class="flex items-center justify-between gap-[8px]">
                    <div class="flex items-center gap-[8px]">
                        <div class="flex items-center gap-2">
                            <div class="relative flex items-center">
                                <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" ${isSelected ? 'checked' : ''}>
                                <button class="tag-manager-icon absolute left-5 p-1 rounded-md hover:bg-gray-100 ${isSelected ? '' : 'hidden'}" onclick="openTagManager('${fullName}')" title="Manage Tags">
                                    <svg class="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="w-[24px] invisible flex justify-center">
                            <span class="material-icons text-gray-400 text-lg">chevron_right</span>
                        </div>
                        <div class="invisible w-[24px]"></div>
                        <div class="w-[24px] flex justify-center">
                            <i class="fas fa-table text-gray-400"></i>
                        </div>
                        <div class="flex items-center gap-[8px]">
                            <span class="text-sm">${searchTerms.length > 0 ? highlightMatches(fullName, searchTerms) : fullName}</span>
                            <div class="flex items-center gap-[8px]">
                                ${table.name === 'Customer_360' || table.name === 'Sales_History' ? 
                                `<span class="${getSystemBadgeClasses('orange')}">${table.type}</span>` : ''}
                                ${bucket.shared ? `<span class="${getSystemBadgeClasses('purple')}">SHARED</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <span class="text-sm text-gray-500 whitespace-nowrap">${table.lastChange}</span>
                </div>
                ${(shouldShowTags || showTags) && table.tags.length > 0 ? `
                    <div class="ml-[120px] flex flex-wrap gap-[8px]">
                        ${table.tags.map(tag => {
                            const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                            return `<span class="${colors.bg} ${colors.text} px-[8px] py-[2px] rounded text-[12px]">#${searchTerms.length > 0 ? highlightMatches(tag, searchTerms) : tag}</span>`;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        </td>
    `;
    tableBody.appendChild(tableRow);
}

// Function to open tag manager for an item
function openTagManager(itemName) {
    console.log('Opening tag manager for:', itemName);
    // TODO: Implement tag manager modal
}

function checkForTagChanges() {
    // Get all tags that are currently selected (either fully or partially)
    const currentTags = new Set([...selectedTagsSet, ...partialTagsSet]);
    
    // Compare with initial selections
    for (const tag of currentTags) {
        // If this tag wasn't in the initial selection at all
        if (!initialTagSelections.has(tag)) {
            return true;
        }
        
        // If this tag's state has changed
        const wasFullySelected = initialTagState.get(tag) === selectedItems.size;
        const isNowFullySelected = selectedTagsSet.has(tag);
        
        if (wasFullySelected !== isNowFullySelected) {
            return true;
        }
    }
    
    // Check if any initially selected tags were removed
    for (const tag of initialTagSelections) {
        if (!currentTags.has(tag)) {
            return true;
        }
    }
    
    return false;
}

function updateApplyButtonState() {
    const applyButton = document.querySelector('#tagManagementModal button[onclick="applyTagChanges()"]');
    if (!applyButton) return;
    
    if (hasTagChanges) {
        console.log('Enabling Apply button - changes detected');
        applyButton.classList.remove('opacity-50', 'cursor-not-allowed');
        applyButton.removeAttribute('disabled');
    } else {
        console.log('Disabling Apply button - no changes detected');
        applyButton.classList.add('opacity-50', 'cursor-not-allowed');
        applyButton.setAttribute('disabled', 'true');
    }
}

function addTagToItems(tag) {
    // When adding a tag, it should be fully selected for all items
    selectedTagsSet.add(tag);
    partialTagsSet.delete(tag);
    hasTagChanges = true;
    
    // Update UI
    renderAvailableTags();
    updateApplyButtonState();
}

function removeTagFromItems(tag) {
    // When removing a tag, it should be completely removed from both sets
    selectedTagsSet.delete(tag);
    partialTagsSet.delete(tag);
    hasTagChanges = true;
    
    // Update UI
    renderAvailableTags();
    updateApplyButtonState();
} 