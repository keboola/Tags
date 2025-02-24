// Data structure for buckets and tables
const data = [
    {
        name: 'Bucket_Own_Col_Test_Green_Jozef',
        type: 'bucket',
        stage: 'IN',
        tables: [
            {
                name: '24hr',
                type: 'NON-TYPED',
                tags: ['data-lineage', 'data-quality']
            },
            {
                name: 'Cars',
                type: 'NON-TYPED',
                tags: ['metadata-management']
            }
        ]
    },
    {
        name: 'LNK_BUCKET_2',
        type: 'bucket',
        stage: 'IN',
        tables: [
            {
                name: '24hr',
                type: 'NON-TYPED',
                tags: ['data-security']
            },
            {
                name: 'Cars',
                type: 'NON-TYPED',
                tags: ['compliance']
            }
        ]
    },
    {
        name: 'ANALYTICS_BUCKET',
        type: 'bucket',
        stage: 'IN',
        tables: [
            {
                name: 'Daily_Metrics',
                type: 'NON-TYPED',
                tags: ['data-lineage', 'metadata-management']
            },
            {
                name: 'User_Behavior',
                type: 'NON-TYPED',
                tags: ['data-security', 'compliance']
            },
            {
                name: 'Performance_KPIs',
                type: 'NON-TYPED',
                tags: ['data-quality']
            }
        ]
    },
    {
        name: 'DATA_WAREHOUSE',
        type: 'bucket',
        stage: 'IN',
        tables: [
            {
                name: 'Customer_360',
                type: 'NON-TYPED',
                tags: ['data-security', 'compliance', 'data-lineage']
            },
            {
                name: 'Sales_History',
                type: 'NON-TYPED',
                tags: ['data-quality', 'metadata-management']
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

// Helper function to count visible items
function countVisibleItems() {
    const dropdown = document.getElementById('sourceDropdown');
    // Count both visible tables and buckets
    const visibleTables = dropdown.querySelectorAll('div[style="display: ;"] .fa-table, div:not([style*="display: none"]) .fa-table');
    const visibleBuckets = dropdown.querySelectorAll('div[style="display: ;"] .fa-folder, div:not([style*="display: none"]) .fa-folder');
    return visibleTables.length + visibleBuckets.length;
}

// Add this function to check the state of all visible checkboxes
function updateSelectAllCheckboxState() {
    const dropdown = document.getElementById('sourceDropdown');
    const selectAllCheckbox = dropdown.querySelector('#selectAllSection input[type="checkbox"]');
    if (!selectAllCheckbox) return;

    // Get all checkboxes from both tables and buckets
    const allCheckboxes = Array.from(dropdown.querySelectorAll('.fa-table, .fa-folder'))
        .map(icon => icon.closest('.p-1\\.5')?.querySelector('input[type="checkbox"]'))
        .filter(checkbox => checkbox);
    
    const visibleCheckboxes = allCheckboxes.filter(checkbox => 
        checkbox.closest('.p-1\\.5').style.display !== 'none'
    );
    
    const checkedCount = allCheckboxes.filter(checkbox => checkbox.checked).length;
    const visibleCheckedCount = visibleCheckboxes.filter(checkbox => checkbox.checked).length;
    
    if (visibleCheckboxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = checkedCount > 0;
    } else if (visibleCheckedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = checkedCount > 0;
    } else if (visibleCheckedCount === visibleCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = checkedCount < allCheckboxes.length;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function filterSources(query) {
    query = query.toLowerCase();
    const searchTerms = query.split(' ').filter(term => term);
    const buckets = document.querySelectorAll('#sourceDropdown .px-2.py-1');
    let hasAnyResults = false;
    let visibleItemCount = 0;
    
    // Process all items first to determine visibility
    buckets.forEach(bucket => {
        const bucketNameElement = bucket.querySelector('.font-medium');
        if (!bucketNameElement) return;
        
        const bucketName = bucketNameElement.textContent;
        const tables = bucket.querySelectorAll('.p-1\\.5.hover\\:bg-gray-50');
        let hasVisibleTables = false;

        tables.forEach((table, index) => {
            if (index === 0) return; // Skip bucket row
            
            const tableNameElement = table.querySelector('span.text-sm');
            if (!tableNameElement) return;
            
            const tableName = tableNameElement.textContent;
            const tagContainer = table.querySelector('.mt-1');
            const tags = Array.from(table.querySelectorAll('.mt-1 span')).map(tag => tag?.textContent?.toLowerCase() || '');
            
            const shouldShow = searchTerms.length === 0 || 
                             searchTerms.every(term => 
                                 tableName.toLowerCase().includes(term) || 
                                 tags.some(tag => tag.includes(term))
                             );
            
            if (shouldShow) {
                table.style.display = '';
                hasVisibleTables = true;
                hasAnyResults = true;
                visibleItemCount++; // Increment counter for visible tables
                
                // Highlight matching text in table name
                if (searchTerms.length > 0) {
                    tableNameElement.innerHTML = highlightMatches(tableName, searchTerms);
                } else {
                    tableNameElement.textContent = tableName;
                }
                
                if (tagContainer) {
                    if (searchTerms.length > 0) {
                        tagContainer.classList.remove('hidden');
                        const tagElements = tagContainer.querySelectorAll('span');
                        tagElements.forEach(tagElement => {
                            const tagText = tagElement.textContent;
                            if (searchTerms.some(term => tagText.toLowerCase().includes(term))) {
                                tagElement.style.display = '';
                                tagElement.innerHTML = highlightMatches(tagText, searchTerms);
                            } else {
                                tagElement.style.display = 'none';
                            }
                        });
                    } else {
                        tagContainer.classList.add('hidden');
                    }
                }
            } else {
                table.style.display = 'none';
                if (tagContainer) {
                    tagContainer.classList.add('hidden');
                }
            }
        });

        const bucketRow = bucket.querySelector('.p-1\\.5.hover\\:bg-gray-50');
        const shouldShowBucket = bucketName.toLowerCase().includes(query) || hasVisibleTables;
        bucket.style.display = shouldShowBucket ? '' : 'none';
        
        if (bucketRow) {
            if (bucketName.toLowerCase().includes(query)) {
                bucketRow.style.display = '';
                visibleItemCount++; // Increment counter for visible bucket
                // Highlight matching text in bucket name
                const bucketNameSpan = bucketRow.querySelector('.font-medium');
                if (bucketNameSpan) {
                    bucketNameSpan.innerHTML = highlightMatches(bucketName, searchTerms);
                }
            } else {
                bucketRow.style.display = 'none';
            }
        }
        
        if (bucketName.toLowerCase().includes(query)) {
            hasAnyResults = true;
        }
    });

    // After processing all items and updating visibility
    updateSelectAllCheckboxState();
    
    // Now update the select all section with the correct count
    let selectAllSection = document.getElementById('selectAllSection');
    const oldCheckbox = selectAllSection?.querySelector('input[type="checkbox"]');
    const wasChecked = oldCheckbox?.checked;
    const wasIndeterminate = oldCheckbox?.indeterminate;

    if (!selectAllSection) {
        selectAllSection = document.createElement('div');
        selectAllSection.id = 'selectAllSection';
        selectAllSection.className = 'px-2 py-2 border-b border-gray-200';
        const container = document.querySelector('#sourceDropdown .max-h-\\[400px\\]');
        container.insertBefore(selectAllSection, container.firstChild);
    }
    
    // Update select all section content based on search state
    selectAllSection.innerHTML = `
        <div class="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer" onclick="toggleSourceCheckbox(event, this)">
            <input type="checkbox" 
                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                   onclick="event.stopPropagation(); updateAllCheckboxes(this.checked)">
            <span class="text-sm text-gray-600 font-medium">${searchTerms.length > 0 ? `SELECT ALL MATCHING ITEMS (${visibleItemCount})` : `SELECT ALL ITEMS (${visibleItemCount})`}</span>
        </div>
    `;

    // Restore the checkbox state
    const newCheckbox = selectAllSection.querySelector('input[type="checkbox"]');
    if (wasChecked !== undefined) {
        newCheckbox.checked = wasChecked;
        newCheckbox.indeterminate = wasIndeterminate;
    }

    selectAllSection.style.display = '';

    let noResultsEl = document.getElementById('noSourceResults');
    if (!hasAnyResults) {
        if (!noResultsEl) {
            noResultsEl = document.createElement('div');
            noResultsEl.id = 'noSourceResults';
            noResultsEl.className = 'px-4 py-3 text-sm text-gray-500';
            noResultsEl.textContent = 'No results found';
            document.querySelector('#sourceDropdown .max-h-\\[400px\\]').appendChild(noResultsEl);
        }
        noResultsEl.style.display = '';
        
        // Hide select all section when no results
        selectAllSection.style.display = 'none';
    } else if (noResultsEl) {
        noResultsEl.style.display = 'none';
    }

    // Update the select all checkbox state after all visibility changes
    updateSelectAllCheckboxState();
}

function toggleSourceCheckbox(event, element) {
    if (event.target.type === 'checkbox') return;
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    updateSelectAllCheckboxState();
}

// Initialize dropdown with data
function initializeDropdowns() {
    const dropdown = document.getElementById('sourceDropdown');
    const container = dropdown.querySelector('.max-h-\\[400px\\]');
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add select all section first
    const selectAllSection = document.createElement('div');
    selectAllSection.id = 'selectAllSection';
    selectAllSection.className = 'px-2 py-2 border-b border-gray-200';
    container.appendChild(selectAllSection);
    
    // Add buckets and tables
    let totalItems = 0;
    data.forEach(bucket => {
        totalItems += bucket.tables.length + 1; // Count tables plus the bucket itself
        const bucketSection = document.createElement('div');
        bucketSection.className = 'px-2 py-1' + (container.children.length > 0 ? ' border-t' : '');
        
        // Add bucket header
        bucketSection.innerHTML = `
            <div class="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded" onclick="toggleSourceCheckbox(event, this)">
                <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onclick="event.stopPropagation()">
                <div class="w-7 h-7 flex items-center justify-center bg-gray-50 rounded">
                    <i class="fas fa-folder text-gray-400 text-sm"></i>
                </div>
                <span class="border border-blue-700/50 text-blue-700 text-xs px-1.5 rounded">IN</span>
                <span class="font-medium text-sm cursor-pointer">${bucket.name}</span>
            </div>
            <div class="space-y-0.5">
                ${bucket.tables.map(table => `
                    <div class="p-1.5 hover:bg-gray-50 rounded" onclick="toggleSourceCheckbox(event, this)">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onclick="event.stopPropagation()">
                            <div class="w-7 h-7 flex items-center justify-center bg-gray-50 rounded cursor-pointer">
                                <i class="fas fa-table text-gray-400 text-sm"></i>
                            </div>
                            <span class="text-sm cursor-pointer">${bucket.name} / ${table.name}</span>
                            <span class="text-xs px-2 py-0.5 border border-orange-700/50 text-orange-700 rounded">${table.type}</span>
                        </div>
                        <div class="mt-1 flex flex-wrap gap-1 ml-9 hidden">
                            ${table.tags.map(tag => {
                                const colors = tagColors[tag] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                                return `<span class="text-xs px-2 py-1 rounded-md ${colors.bg} ${colors.text}">#${tag}</span>`;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(bucketSection);
    });
    
    // Update the select all section with initial count
    selectAllSection.innerHTML = `
        <div class="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer" onclick="toggleSourceCheckbox(event, this)">
            <input type="checkbox" 
                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                   onclick="event.stopPropagation(); updateAllCheckboxes(this.checked)">
            <span class="text-sm text-gray-600 font-medium">SELECT ALL ITEMS (${totalItems})</span>
        </div>
    `;
    
    updateSelectAllCheckboxState();
}

function handleSourceClick(event) {
    const dropdown = document.getElementById('sourceDropdown');
    const input = document.getElementById('sourceInput');
    
    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        input.focus();
        if (input.value) {
            filterSources(this.value);
        }
    } else {
        closeSourceDropdown();
    }
}

function closeSourceDropdown() {
    const dropdown = document.getElementById('sourceDropdown');
    dropdown.classList.add('hidden');
}

// Update updateAllCheckboxes to handle both tables and buckets
function updateAllCheckboxes(checked) {
    const dropdown = document.getElementById('sourceDropdown');
    // Select both visible tables and buckets
    const visibleItems = dropdown.querySelectorAll('div[style="display: ;"] .fa-table, div:not([style*="display: none"]) .fa-table, div[style="display: ;"] .fa-folder, div:not([style*="display: none"]) .fa-folder');
    
    visibleItems.forEach(icon => {
        const row = icon.closest('.p-1\\.5');
        if (row) {
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = checked;
            }
        }
    });

    // Update the intermediate state
    updateSelectAllCheckboxState();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDropdowns);

// Add click handler for dropdown
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('sourceDropdown');
    const sourceContainer = event.target.closest('.relative');
    const input = event.target.closest('input');
    
    if (!sourceContainer && !dropdown.classList.contains('hidden') && !input) {
        closeSourceDropdown();
    }
}); 