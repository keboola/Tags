// Data structure for buckets and tables
const data = [
    {
        name: 'Bucket_Own_Col_Test_Green_Jozef',
        type: 'bucket',
        stage: 'IN',
        shared: true,
        linked: true,
        lastChange: 'Feb 7 20:26',
        tags: ['data-lineage', 'data-security'],
        tables: [
            {
                name: '24hr',
                type: 'NON-TYPED',
                tags: ['data-lineage', 'data-quality'],
                lastChange: 'Feb 7 20:43'
            },
            {
                name: 'Cars',
                type: 'NON-TYPED',
                tags: ['metadata-management'],
                lastChange: 'Feb 7 20:15'
            }
        ]
    },
    {
        name: 'LNK_BUCKET_2',
        type: 'bucket',
        stage: 'OUT',
        shared: true,
        linked: true,
        lastChange: 'Feb 7 21:34',
        tags: ['metadata-management', 'compliance'],
        tables: [
            {
                name: '24hr',
                type: 'NON-TYPED',
                tags: ['data-security'],
                lastChange: 'Jan 22 13:30'
            },
            {
                name: 'Cars',
                type: 'NON-TYPED',
                tags: ['compliance'],
                lastChange: 'Jan 6 16:59'
            }
        ]
    },
    {
        name: 'ANALYTICS_BUCKET',
        type: 'bucket',
        stage: 'OUT',
        lastChange: 'Feb 7 19:45',
        tags: ['data-quality', 'data-lineage'],
        tables: [
            {
                name: 'Daily_Metrics',
                type: 'NON-TYPED',
                tags: ['data-lineage', 'metadata-management'],
                lastChange: 'Feb 7 19:30'
            },
            {
                name: 'User_Behavior',
                type: 'NON-TYPED',
                tags: ['data-security', 'compliance'],
                lastChange: 'Feb 7 18:55'
            },
            {
                name: 'Performance_KPIs',
                type: 'NON-TYPED',
                tags: ['data-quality'],
                lastChange: 'Feb 7 18:20'
            }
        ]
    },
    {
        name: 'DATA_WAREHOUSE',
        type: 'bucket',
        stage: 'IN',
        lastChange: 'Feb 7 17:30',
        tags: ['data-quality', 'data-security', 'metadata-management'],
        tables: [
            {
                name: 'Customer_360',
                type: 'NON-TYPED',
                tags: ['data-security', 'compliance', 'data-lineage'],
                lastChange: 'Feb 7 17:15'
            },
            {
                name: 'Sales_History',
                type: 'NON-TYPED',
                tags: ['data-quality', 'metadata-management'],
                lastChange: 'Feb 7 16:45'
            }
        ]
    },
    {
        name: 'MARKETING_DATA',
        type: 'bucket',
        stage: 'IN',
        lastChange: 'Feb 7 15:20',
        tags: ['data-lineage', 'data-security', 'compliance'],
        tables: [
            {
                name: 'Campaign_Metrics',
                type: 'NON-TYPED',
                tags: ['data-lineage', 'metadata-management'],
                lastChange: 'Feb 7 15:10'
            },
            {
                name: 'Customer_Segments',
                type: 'NON-TYPED',
                tags: ['data-security', 'compliance'],
                lastChange: 'Feb 7 14:55'
            }
        ]
    },
    {
        name: 'SALES_REPORTS',
        type: 'bucket',
        stage: 'IN',
        lastChange: 'Feb 7 13:45',
        tags: ['data-quality', 'metadata-management', 'compliance'],
        tables: [
            {
                name: 'Monthly_Revenue',
                type: 'NON-TYPED',
                tags: ['data-quality'],
                lastChange: 'Feb 7 13:30'
            },
            {
                name: 'Product_Performance',
                type: 'NON-TYPED',
                tags: ['data-lineage'],
                lastChange: 'Feb 7 13:15'
            }
        ]
    },
    {
        name: 'HR_DATA',
        type: 'bucket',
        stage: 'IN',
        lastChange: 'Feb 7 12:20',
        tags: ['data-security', 'compliance', 'metadata-management'],
        tables: [
            {
                name: 'Employee_Records',
                type: 'NON-TYPED',
                tags: ['data-security', 'compliance'],
                lastChange: 'Feb 7 12:10'
            },
            {
                name: 'Payroll_Summary',
                type: 'NON-TYPED',
                tags: ['data-quality'],
                lastChange: 'Feb 7 11:45'
            }
        ]
    },
    {
        name: 'INVENTORY_MANAGEMENT',
        type: 'bucket',
        stage: 'IN',
        lastChange: 'Feb 7 10:30',
        tags: ['data-lineage', 'data-quality', 'metadata-management'],
        tables: [
            {
                name: 'Stock_Levels',
                type: 'NON-TYPED',
                tags: ['data-lineage', 'data-quality'],
                lastChange: 'Feb 7 10:15'
            },
            {
                name: 'Supplier_Data',
                type: 'NON-TYPED',
                tags: ['metadata-management'],
                lastChange: 'Feb 7 09:45'
            }
        ]
    }
];

// Tag colors mapping
const tagColors = {
    'data-lineage': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'data-quality': { bg: 'bg-green-100', text: 'text-green-800' },
    'metadata-management': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'data-security': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'compliance': { bg: 'bg-red-100', text: 'text-red-800' }
};

let searchInNamesOnly = false;
let collapsedBuckets = new Set();
let showTags = false; // Changed to false as default
let showBranchFolders = false; // Added for branch folders visibility
let systemTagStyle = 'outline';
let systemTagRadius = 'normal';
let selectedTags = new Set(); // Store selected tags

function handleSearchToggle(checkbox) {
    searchInNamesOnly = checkbox.checked;
    filterTables();
}

function toggleBucket(bucketName) {
    const searchValue = document.getElementById('searchInput').value.trim();
    
    // Don't toggle if there's a search active
    if (searchValue.length > 0) {
        return;
    }
    
    if (collapsedBuckets.has(bucketName)) {
        collapsedBuckets.delete(bucketName);
    } else {
        collapsedBuckets.add(bucketName);
    }
    
    // Rerender with current state
    if (selectedTags.size > 0) {
        filterTables();
    } else {
        renderTable();
    }
}

function renderTags(tags) {
    if (!showTags) return '';
    return tags.map(tag => {
        const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return `<span class="${colors.bg} ${colors.text} px-2 py-1 rounded text-xs mr-1">#${tag}</span>`;
    }).join('');
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Update the table header first
    const tableHeader = document.querySelector('thead tr');
    if (tableHeader) {
        tableHeader.innerHTML = `
            <th class="px-6 py-4 w-full">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
                        <span class="font-medium text-black text-[14px]">Name</span>
                    </div>
                    <span class="font-medium text-black whitespace-nowrap text-[14px]">Last Change</span>
                </div>
            </th>
        `;
    }

    const isSearching = document.getElementById('searchInput').value.length > 0;

    data.forEach(bucket => {
        // Render bucket row
        const bucketRow = document.createElement('tr');
        bucketRow.className = 'hover:bg-[#EDF0F5]';
        const isCollapsed = !collapsedBuckets.has(bucket.name);
        bucketRow.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex flex-col gap-[8px]">
                    <div class="flex items-center justify-between gap-[8px]">
                        <div class="flex items-center gap-[8px]">
                            <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
                            <div class="w-[24px] flex justify-center cursor-pointer" onclick="toggleBucket('${bucket.name}')">
                                <span class="material-icons text-gray-400 text-lg transform transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}">chevron_right</span>
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
                    ${(showTags || isSearching) && bucket.tags && bucket.tags.length > 0 ? `
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

        // Render table rows only if bucket is not collapsed
        if (!isCollapsed) {
            bucket.tables.forEach(table => {
                const tableRow = document.createElement('tr');
                tableRow.className = 'hover:bg-[#EDF0F5]';
                tableRow.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex flex-col gap-[8px]">
                            <div class="flex items-center justify-between gap-[8px]">
                                <div class="flex items-center gap-[8px]">
                                    <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
                                    <div class="w-[24px] invisible flex justify-center">
                                        <span class="material-icons text-gray-400 text-lg">chevron_right</span>
                                    </div>
                                    <div class="invisible w-[24px]"></div>
                                    <div class="w-[24px] flex justify-center">
                                        <i class="fas fa-table text-gray-400"></i>
                                    </div>
                                    <div class="flex items-center gap-[8px]">
                                        <span class="text-sm">${bucket.name} / ${table.name}</span>
                                        <div class="flex items-center gap-[8px]">
                                            ${table.name === 'Customer_360' || table.name === 'Sales_History' ? 
                                            `<span class="${getSystemBadgeClasses('orange')}">${table.type}</span>` : ''}
                                            ${bucket.shared ? `<span class="${getSystemBadgeClasses('purple')}">SHARED</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                                <span class="text-sm text-gray-500 whitespace-nowrap">${table.lastChange}</span>
                            </div>
                            ${(showTags || isSearching) && table.tags.length > 0 ? `
                                <div class="ml-[120px] flex flex-wrap gap-[8px]">
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
}

// Helper function to highlight matching letters
function highlightMatches(text, searchTerms) {
    if (!searchTerms || (Array.isArray(searchTerms) && searchTerms.length === 0)) return text;
    
    // Convert single term to array if needed
    const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
    
    // First, temporarily replace any existing highlight spans
    let result = text.replace(/<span[^>]*>/g, '###SPAN_START###')
                    .replace(/<\/span>/g, '###SPAN_END###');
    
    // Highlight each term independently
    terms.forEach(term => {
        // Escape special characters in the search text for regex
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create regex that matches the term, but not inside HTML tags
        const regex = new RegExp(
            `(?<!<[^>]*)${escapedTerm}(?![^<]*>)`, 
            'gi'
        );
        
        result = result.replace(regex, match => 
            `<span style="background-color: #C2E0FF; color: #064A8F">${match}</span>`
        );
    });
    
    // Restore the original highlight spans
    return result.replace(/###SPAN_START###/g, '<span>')
                .replace(/###SPAN_END###/g, '</span>');
}

function filterTables() {
    const searchInput = document.getElementById('searchInput');
    const searchValue = searchInput ? searchInput.value.trim() : '';
    const searchTerms = searchValue.toLowerCase().split(' ').filter(term => term);
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    let hasMatches = false;

    // If no search terms and no selected tags, just render the default table
    if (searchTerms.length === 0 && selectedTags.size === 0) {
        renderTable();
        return;
    }

    data.forEach(bucket => {
        // Filter tables that match the search criteria
        const filteredTables = bucket.tables.filter(table => {
            const tableName = table.name.toLowerCase();
            const tableFullName = `${bucket.name} / ${table.name}`.toLowerCase();
            const tableTags = table.tags || [];
            
            // Check if table matches search terms
            const matchesSearchTerms = searchTerms.length === 0 || 
                searchTerms.every(term => 
                    tableName.includes(term) || 
                    tableFullName.includes(term) || 
                    tableTags.some(tag => tag.toLowerCase().includes(term))
                );
            
            // Check if table has any selected tags
            const hasSelectedTags = selectedTags.size === 0 || 
                Array.from(selectedTags).some(tag => tableTags.includes(tag));
            
            return matchesSearchTerms && hasSelectedTags;
        });

        // Only show bucket if it has matching tables
        if (filteredTables.length > 0) {
            hasMatches = true;
            
            // Render bucket row
            renderBucketRow(bucket, tableBody, selectedTags.size > 0);
            
            // Show matching tables if bucket is not collapsed
            if (!collapsedBuckets.has(bucket.name)) {
                filteredTables.forEach(table => {
                    // Show tags if we're searching, if tags are enabled, or if we're filtering by tags
                    const shouldShowTags = showTags || searchTerms.length > 0 || selectedTags.size > 0;
                    renderTableRow(bucket, table, tableBody, shouldShowTags);
                });
            }
        }
    });

    if (!hasMatches) {
        tableBody.innerHTML = `
            <tr>
                <td class="px-6 py-6">
                    <div class="text-gray-500 text-sm">No items found with the selected criteria</div>
                </td>
            </tr>
        `;
    }

    // Update the tag filter button text color
    const buttonText = document.getElementById('tagFilterButtonText');
    if (selectedTags.size > 0) {
        buttonText.className = 'text-blue-600 font-normal underline';
    } else {
        buttonText.className = 'text-gray-500 font-normal underline';
    }
}

// Function to close all dropdowns
function closeAllDropdowns() {
    const dropdowns = [
        'tagFilterDropdown',
        'filterDropdown',
        'tagsVisibilityDropdown'
    ];
    
    dropdowns.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    });
}

// Function to toggle specific dropdown
function toggleDropdown(dropdownId, event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dropdown = document.getElementById(dropdownId);
    const isCurrentlyHidden = dropdown.classList.contains('hidden');
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    // If the clicked dropdown was hidden, show it
    if (isCurrentlyHidden) {
        dropdown.classList.remove('hidden');
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    collapsedBuckets.clear(); // Start with all buckets collapsed
    createAdminButton(); // Only create the admin button initially
    renderTable();
    populateTagsList(); // Initialize the tags list
    
    // Add click handler for closing dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const isDropdownButton = event.target.closest('[id$="Button"]');
        const isDropdown = event.target.closest('[id$="Dropdown"]');
        
        if (!isDropdownButton && !isDropdown) {
            closeAllDropdowns();
        }
    });
});

// Update the button click handlers
document.getElementById('tagFilterButton').onclick = (e) => toggleDropdown('tagFilterDropdown', e);
document.getElementById('filterButton').onclick = (e) => toggleDropdown('filterDropdown', e);
document.getElementById('tagsButton').onclick = (e) => toggleDropdown('tagsVisibilityDropdown', e);

// Function to update dropdown selection
function updateDropdownSelection(type, value, element, event) {
    // Prevent event from bubbling up to document and prevent default link behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Update button text
    const buttonText = document.getElementById(type + 'ButtonText');
    const dropdown = document.getElementById(type + 'Dropdown');
    
    // Only handle "All" selection
    if (value === 'All') {
        buttonText.textContent = value;
        buttonText.className = 'text-gray-500 font-normal underline';
        dropdown.classList.add('hidden');
        // Uncheck all checkboxes when selecting "All"
        const allCheckboxes = dropdown.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        return;
    }
    
    // Toggle checkbox when clicking anywhere in the row
    const checkbox = element.querySelector('input[type="checkbox"]');
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
    }
    
    // Update button text based on selected items from all sections
    const checkedBoxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
    if (checkedBoxes.length === 0) {
        buttonText.textContent = 'All';
        buttonText.className = 'text-gray-500 font-normal underline';
    } else {
        const selectedValues = Array.from(checkedBoxes).map(cb => 
            cb.parentElement.textContent.trim()
        );
        buttonText.textContent = selectedValues.join(', ');
        buttonText.className = 'text-blue-600 font-normal underline';
    }
}

// Create a button to open admin panel
function createAdminButton() {
    // Don't create admin button on bulk-operations page
    if (window.location.pathname.includes('bulk-operations')) {
        return;
    }
    
    const adminButton = document.createElement('button');
    adminButton.id = 'openAdminPanel';
    adminButton.className = 'fixed bottom-4 right-4 bg-white w-10 h-10 flex items-center justify-center rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50';
    adminButton.innerHTML = '<i class="fas fa-cog text-gray-600"></i>';
    adminButton.onclick = createAdminPanel;
    document.body.appendChild(adminButton);
}

// Add admin settings panel to the page
function createAdminPanel() {
    // Don't create admin panel on bulk-operations page
    if (window.location.pathname.includes('bulk-operations')) {
        return;
    }
    
    // Remove existing admin panel if it exists
    const existingPanel = document.getElementById('adminPanel');
    if (existingPanel) existingPanel.remove();

    // Hide the admin button immediately
    const adminButton = document.getElementById('openAdminPanel');
    if (adminButton) adminButton.style.display = 'none';

    const adminPanel = document.createElement('div');
    adminPanel.id = 'adminPanel';
    adminPanel.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-[300px]';
    adminPanel.innerHTML = `
        <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between border-b pb-2">
                <span class="font-medium text-gray-700">Admin Center</span>
                <button id="toggleAdminPanel" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <span class="text-sm text-gray-600 font-medium">Style of system tags</span>
                    <div class="flex gap-2">
                        <button onclick="setSystemTagStyle('subtle')" 
                            class="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 ${systemTagStyle === 'subtle' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200'}">
                            Subtle Fill
                        </button>
                        <button onclick="setSystemTagStyle('outline')" 
                            class="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 ${systemTagStyle === 'outline' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200'}">
                            Outline
                        </button>
                        <button onclick="setSystemTagStyle('filled')" 
                            class="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 ${systemTagStyle === 'filled' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200'}">
                            Filled
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <span class="text-sm text-gray-600 font-medium">Radius of system tags</span>
                    <div class="flex gap-2">
                        <button onclick="setSystemTagRadius('normal')" 
                            class="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 ${systemTagRadius === 'normal' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200'}">
                            Normal
                        </button>
                        <button onclick="setSystemTagRadius('pill')" 
                            class="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 ${systemTagRadius === 'pill' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200'}">
                            Pill
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <span class="text-sm text-gray-600 font-medium">Showed by default</span>
                    <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span class="text-sm text-gray-600">Show tags</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="toggleTags" class="sr-only peer" ${showTags ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(adminPanel);

    // Update the close button event listener
    document.getElementById('toggleAdminPanel').addEventListener('click', () => {
        adminPanel.remove();
        if (adminButton) adminButton.style.display = 'block';
    });
    
    const adminPanelToggle = document.getElementById('toggleTags');
    adminPanelToggle.checked = showTags; // Set initial state
    adminPanelToggle.addEventListener('change', (e) => {
        showTags = e.target.checked;
        renderTable();
    });
}

function setSystemTagStyle(style) {
    systemTagStyle = style;
    
    // Update button styles
    const outlineButton = document.querySelector('button[onclick="setSystemTagStyle(\'outline\')"]');
    const filledButton = document.querySelector('button[onclick="setSystemTagStyle(\'filled\')"]');
    const subtleButton = document.querySelector('button[onclick="setSystemTagStyle(\'subtle\')"]');
    
    if (outlineButton && filledButton && subtleButton) {
        const defaultClass = 'px-3 py-1.5 text-sm border rounded hover:bg-gray-50 border-gray-200';
        const activeClass = 'px-3 py-1.5 text-sm border rounded hover:bg-gray-50 bg-blue-50 border-blue-200 text-blue-600';
        
        outlineButton.className = style === 'outline' ? activeClass : defaultClass;
        filledButton.className = style === 'filled' ? activeClass : defaultClass;
        subtleButton.className = style === 'subtle' ? activeClass : defaultClass;
    }
    
    renderTable();
}

function setSystemTagRadius(radius) {
    systemTagRadius = radius;
    
    // Update button styles
    const normalButton = document.querySelector('button[onclick="setSystemTagRadius(\'normal\')"]');
    const pillButton = document.querySelector('button[onclick="setSystemTagRadius(\'pill\')"]');
    
    if (normalButton && pillButton) {
        if (radius === 'normal') {
            normalButton.className = 'px-3 py-1.5 text-sm border rounded hover:bg-gray-50 bg-blue-50 border-blue-200 text-blue-600';
            pillButton.className = 'px-3 py-1.5 text-sm border rounded hover:bg-gray-50 border-gray-200';
        } else {
            normalButton.className = 'px-3 py-1.5 text-sm border rounded hover:bg-gray-50 border-gray-200';
            pillButton.className = 'px-3 py-1.5 text-sm border rounded hover:bg-gray-50 bg-blue-50 border-blue-200 text-blue-600';
        }
    }
    
    renderTable();
}

// Helper function to get system badge classes
function getSystemBadgeClasses(color) {
    const baseClasses = 'text-[11px] px-[6px] py-[1px]';
    const radius = systemTagRadius === 'pill' ? 'rounded-full' : 'rounded';
    
    if (systemTagStyle === 'outline') {
        return `border border-${color}-700/50 text-${color}-700 ${baseClasses} ${radius}`;
    } else if (systemTagStyle === 'filled') {
        return `bg-${color}-700 text-white ${baseClasses} ${radius}`;
    } else { // subtle style
        return `bg-${color}-100 text-${color}-800 ${baseClasses} ${radius}`;
    }
}

// Function to get all unique tags from the data
function getAllUniqueTags() {
    const tagsSet = new Set();
    data.forEach(bucket => {
        if (bucket.tags) {
            bucket.tags.forEach(tag => tagsSet.add(tag));
        }
        bucket.tables.forEach(table => {
            if (table.tags) {
                table.tags.forEach(tag => tagsSet.add(tag));
            }
        });
    });
    return Array.from(tagsSet).sort();
}

// Function to populate the tags list in the dropdown
function populateTagsList(searchTerm = '') {
    const tagsList = document.getElementById('tagsList');
    const allTags = getAllUniqueTags();
    const filteredTags = searchTerm ? 
        allTags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) : 
        allTags;

    tagsList.innerHTML = '';
    
    if (filteredTags.length === 0) {
        tagsList.innerHTML = `
            <div class="px-3 py-2 text-sm text-gray-500">
                No tags found
            </div>
        `;
        return;
    }

    // Only show "All Tags" option when not searching
    if (!searchTerm) {
        const allOption = document.createElement('a');
        allOption.href = '#';
        allOption.className = 'group flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100';
        
        const containerDiv = document.createElement('div');
        containerDiv.className = 'flex items-center w-full';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'w-4 h-4 mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-500';
        
        // Set checkbox state based on selected tags
        if (selectedTags.size === 0) {
            checkbox.checked = true;
        } else if (selectedTags.size === allTags.length) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
            // Set indeterminate state if some tags are selected
            checkbox.indeterminate = selectedTags.size > 0;
        }
        
        const label = document.createElement('span');
        label.textContent = 'All Tags';
        
        containerDiv.appendChild(checkbox);
        containerDiv.appendChild(label);
        allOption.appendChild(containerDiv);

        // Handle click on the entire option
        allOption.onclick = (e) => {
            e.preventDefault();
            if (e.target !== checkbox) { // Only if not clicking directly on checkbox
                clearTagSelection();
                // Rerender the list to update all checkboxes
                populateTagsList('');
            }
        };

        // Handle checkbox click separately
        checkbox.onclick = (e) => {
            e.stopPropagation(); // Prevent triggering the parent click
            clearTagSelection();
            // Rerender the list to update all checkboxes
            populateTagsList('');
        };

        tagsList.appendChild(allOption);

        // Add divider
        const divider = document.createElement('div');
        divider.className = 'h-px bg-gray-200 my-1';
        tagsList.appendChild(divider);
    }

    // Add individual tags
    filteredTags.forEach(tag => {
        const tagElement = document.createElement('a');
        tagElement.href = '#';
        tagElement.className = 'group flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100';
        
        const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        const highlightedTag = searchTerm ? 
            highlightMatches(tag, searchTerm) : 
            tag;

        // Create the container div for proper alignment
        const containerDiv = document.createElement('div');
        containerDiv.className = 'flex items-center w-full';
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'w-4 h-4 mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-500';
        checkbox.checked = selectedTags.has(tag);
        
        // Create tag span
        const tagSpan = document.createElement('span');
        tagSpan.className = `${colors.bg} ${colors.text} px-2 py-0.5 rounded text-xs`;
        tagSpan.innerHTML = `#${highlightedTag}`;
        
        // Assemble the elements
        containerDiv.appendChild(checkbox);
        containerDiv.appendChild(tagSpan);
        tagElement.appendChild(containerDiv);
        
        // Handle click on the entire tag element
        tagElement.onclick = (e) => {
            e.preventDefault();
            if (e.target !== checkbox) { // Only if not clicking directly on checkbox
                toggleTagSelection(tag, checkbox);
                // Don't rerender the whole list, just update this checkbox
                checkbox.checked = selectedTags.has(tag);
            }
        };

        // Handle checkbox click separately
        checkbox.onclick = (e) => {
            e.stopPropagation(); // Prevent triggering the parent click
            toggleTagSelection(tag, checkbox);
            // Don't rerender the whole list, just update this checkbox
            checkbox.checked = selectedTags.has(tag);
        };

        tagsList.appendChild(tagElement);
    });
}

// Function to filter the tags list based on search input
function filterTagsList() {
    const searchTerm = document.getElementById('tagSearchInput').value;
    populateTagsList(searchTerm);
}

// Function to toggle tag selection
function toggleTagSelection(tag, checkbox) {
    // Toggle the state
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
    } else {
        selectedTags.add(tag);
    }
    
    // Update checkbox state
    if (checkbox) {
        checkbox.checked = selectedTags.has(tag);
    }
    
    // Update the "All Tags" checkbox state
    const allTagsCheckbox = document.querySelector('#tagsList input[type="checkbox"]:first-of-type');
    if (allTagsCheckbox) {
        const allTags = getAllUniqueTags();
        if (selectedTags.size === 0) {
            allTagsCheckbox.checked = true;
            allTagsCheckbox.indeterminate = false;
        } else if (selectedTags.size === allTags.length) {
            allTagsCheckbox.checked = true;
            allTagsCheckbox.indeterminate = false;
        } else {
            allTagsCheckbox.checked = false;
            allTagsCheckbox.indeterminate = true;
        }
    }
    
    // Update the filter button text
    updateTagFilterButtonText();
    
    // Apply filters - use filterTables to ensure consistent behavior
    filterTables();
}

// Function to clear tag selection
function clearTagSelection() {
    selectedTags.clear();
    
    // Update all checkboxes
    const checkboxes = document.querySelectorAll('#tagsList input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
        // First checkbox is the "All" option
        if (index === 0) {
            checkbox.checked = true;
            checkbox.indeterminate = false;
        } else {
            checkbox.checked = false;
        }
    });
    
    // Update the filter button text
    updateTagFilterButtonText();
    
    // Check if there's an active search
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    // Reset collapsed state
    collapsedBuckets.clear();
    
    // If there's an active search, apply search filter, otherwise just render
    if (searchTerm) {
        filterTables();
    } else {
        renderTable();
    }
}

// Function to update the tag filter button text
function updateTagFilterButtonText() {
    const buttonText = document.getElementById('tagFilterButtonText');
    if (selectedTags.size === 0) {
        buttonText.textContent = 'None';
        buttonText.className = 'text-gray-500 font-normal underline';
    } else if (selectedTags.size === 1) {
        buttonText.textContent = Array.from(selectedTags)[0];
        buttonText.className = 'text-blue-600 font-normal underline';
    } else {
        buttonText.textContent = `${selectedTags.size} tags`;
        buttonText.className = 'text-blue-600 font-normal underline';
    }
}

// Function to apply tag filters
function applyTagFilters() {
    // If no tags are selected, show all items
    if (selectedTags.size === 0) {
        renderTable();
        return;
    }

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    let hasMatches = false;

    data.forEach(bucket => {
        // Check if bucket has any of the selected tags
        const bucketHasSelectedTags = bucket.tags && 
            Array.from(selectedTags).some(tag => bucket.tags.includes(tag));
        
        // Filter tables that have any of the selected tags
        const filteredTables = bucket.tables.filter(table => 
            Array.from(selectedTags).some(tag => table.tags.includes(tag))
        );

        if (filteredTables.length > 0 || bucketHasSelectedTags) {
            hasMatches = true;
            
            // Render bucket row - always show tags when filtering by tags
            renderBucketRow(bucket, tableBody, true);
            
            // Show matching tables if bucket is not collapsed
            if (!collapsedBuckets.has(bucket.name)) {
                filteredTables.forEach(table => {
                    // Always show tags when filtering by tags
                    renderTableRow(bucket, table, tableBody, true);
                });
            }
        }
    });

    if (!hasMatches) {
        tableBody.innerHTML = `
            <tr>
                <td class="px-6 py-6">
                    <div class="text-gray-500 text-sm">No items found with the selected tags</div>
                </td>
            </tr>
        `;
    }
}

// Function to render a bucket row
function renderBucketRow(bucket, tableBody, shouldShowTags = false) {
    // Skip branch folders if they should be hidden
    if (!showBranchFolders && bucket.name.toLowerCase().includes('branch')) {
        return;
    }
    
    const bucketRow = document.createElement('tr');
    bucketRow.className = 'hover:bg-[#EDF0F5]';
    const isCollapsed = collapsedBuckets.has(bucket.name);
    const searchTerms = document.getElementById('searchInput').value.toLowerCase().split(' ').filter(term => term);
    
    // When searching or not collapsed, we want the arrow to point down (rotated 90 degrees)
    // But if search is cleared and we have tags selected, respect the collapsed state
    const searchValue = document.getElementById('searchInput').value.trim();
    const shouldRotateArrow = (searchValue.length > 0) || !isCollapsed;
    
    bucketRow.innerHTML = `
        <td class="px-6 py-4">
            <div class="flex flex-col gap-[8px]">
                <div class="flex items-center justify-between gap-[8px]">
                    <div class="flex items-center gap-[8px]">
                        <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
                        <div class="w-[24px] flex justify-center cursor-pointer" onclick="toggleBucket('${bucket.name}')">
                            <span class="material-icons text-gray-400 text-lg transform transition-transform duration-200 ${shouldRotateArrow ? 'rotate-90' : ''}"">chevron_right</span>
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
                            // Only show tags that match the filter criteria or all tags if no filter is applied
                            if (selectedTags.size === 0 || selectedTags.has(tag)) {
                                const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                                return `<span class="${colors.bg} ${colors.text} px-[8px] py-[2px] rounded text-[12px]">#${searchTerms.length > 0 ? highlightMatches(tag, searchTerms) : tag}</span>`;
                            }
                            return '';
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
    // Skip tables in branch folders if they should be hidden
    if (!showBranchFolders && bucket.name.toLowerCase().includes('branch')) {
        return;
    }
    
    const tableRow = document.createElement('tr');
    tableRow.className = 'hover:bg-[#EDF0F5]';
    const searchTerms = document.getElementById('searchInput').value.toLowerCase().split(' ').filter(term => term);
    const fullName = `${bucket.name} / ${table.name}`;
    
    tableRow.innerHTML = `
        <td class="px-6 py-4">
            <div class="flex flex-col gap-[8px]">
                <div class="flex items-center justify-between gap-[8px]">
                    <div class="flex items-center gap-[8px]">
                        <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
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
                            // Only show tags that match the filter criteria or all tags if no filter is applied
                            if (selectedTags.size === 0 || selectedTags.has(tag)) {
                                const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                                return `<span class="${colors.bg} ${colors.text} px-[8px] py-[2px] rounded text-[12px]">#${searchTerms.length > 0 ? highlightMatches(tag, searchTerms) : tag}</span>`;
                            }
                            return '';
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        </td>
    `;
    tableBody.appendChild(tableRow);
}

function updateTagsVisibility(preference, element, event) {
    // Prevent event from bubbling up to document and prevent default link behavior
    event.preventDefault();
    event.stopPropagation();

    // Set radio button when clicking anywhere in the row
    const radio = element.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }

    // Update button state and visibility settings
    const button = document.getElementById('tagsButton');
    if (preference === 'show-tags') {
        showTags = true;
    } else if (preference === 'hide-tags') {
        showTags = false;
    } else if (preference === 'show-branches') {
        showBranchFolders = true;
    } else if (preference === 'hide-branches') {
        showBranchFolders = false;
    }

    // Update button appearance based on either tags or branches being shown
    if (showTags || showBranchFolders) {
        button.classList.remove('text-gray-400');
        button.classList.add('text-blue-500');
    } else {
        button.classList.remove('text-blue-500');
        button.classList.add('text-gray-400');
    }

    // Re-render the table to update visibility
    if (document.getElementById('searchInput').value) {
        filterTables();
    } else {
        renderTable();
    }
} 