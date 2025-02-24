// Tag management functionality
class TagManager {
    constructor() {
        this.tags = new Set([
            'data-lineage', 
            'data-quality', 
            'data-catalog', 
            'metadata-management',
            'data-security',
            'compliance'
        ]);
        this.selectedTags = new Set();
        this.tempSelectedTags = new Set();
        
        // UI Elements
        this.tagsContainer = document.getElementById('tagsContainer');
        this.searchResults = document.getElementById('searchResults');
        this.tagSearchDropdown = document.getElementById('tagSearchDropdown');
        this.searchInput = document.getElementById('searchInput');
        
        // Tag colors for visual display
        this.tagColors = [
            { bg: 'bg-blue-100', text: 'text-blue-800', hover: 'text-blue-600' },
            { bg: 'bg-green-100', text: 'text-green-800', hover: 'text-green-600' },
            { bg: 'bg-purple-100', text: 'text-purple-800', hover: 'text-purple-600' },
            { bg: 'bg-pink-100', text: 'text-pink-800', hover: 'text-pink-600' },
            { bg: 'bg-yellow-100', text: 'text-yellow-800', hover: 'text-yellow-600' },
            { bg: 'bg-indigo-100', text: 'text-indigo-800', hover: 'text-indigo-600' },
        ];

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            const dropdown = this.tagSearchDropdown;
            const addButton = event.target.closest('button');
            const dropdownContent = event.target.closest('#tagSearchDropdown');
            
            if (!addButton && !dropdownContent && !dropdown.classList.contains('hidden')) {
                this.closeTagSearch();
            }
        });
    }

    toggleTagSearch() {
        const isHidden = this.tagSearchDropdown.classList.contains('hidden');
        if (isHidden) {
            this.tagSearchDropdown.classList.remove('hidden');
            this.searchInput.focus();
            this.filterTags();
            // Reset selection bar state
            const bottomBar = document.querySelector('#tagSearchDropdown .border-t.bg-gray-50');
            bottomBar.style.opacity = '0';
            bottomBar.style.transform = 'translateY(-4px)';
        } else {
            this.closeTagSearch();
        }
    }

    toggleTagSelection(tag) {
        if (this.tempSelectedTags.has(tag)) {
            this.tempSelectedTags.delete(tag);
        } else {
            this.tempSelectedTags.add(tag);
        }
        this.updateSelectedCount();
        this.filterTags();
    }

    updateSelectedCount() {
        const count = this.tempSelectedTags.size;
        const countElement = document.getElementById('selectedCount');
        const bottomBar = document.querySelector('#tagSearchDropdown .border-t.bg-gray-50');
        
        if (count === 0) {
            countElement.textContent = '';
            bottomBar.style.opacity = '0';
            bottomBar.style.transform = 'translateY(-4px)';
            setTimeout(() => bottomBar.classList.add('hidden'), 100);
        } else {
            bottomBar.classList.remove('hidden');
            requestAnimationFrame(() => {
                bottomBar.style.opacity = '1';
                bottomBar.style.transform = 'translateY(0)';
            });
            countElement.textContent = `${count} selected`;
        }
    }

    addSelectedTags() {
        this.tempSelectedTags.forEach(tag => {
            if (!this.selectedTags.has(tag)) {
                this.selectedTags.add(tag);
                if (!this.tags.has(tag)) {
                    this.tags.add(tag);
                }
            }
        });
        this.renderTags();
        this.tempSelectedTags.clear();
        this.updateSelectedCount();
        this.filterTags();
        this.closeTagSearch();
    }

    closeTagSearchFast() {
        const dropdown = this.tagSearchDropdown;
        dropdown.classList.add('closing');
        setTimeout(() => {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('closing');
        }, 50);
        this.searchInput.value = '';
        this.tempSelectedTags.clear();
        this.updateSelectedCount();
    }

    closeTagSearch() {
        const dropdown = this.tagSearchDropdown;
        dropdown.classList.add('closing');
        setTimeout(() => {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('closing');
        }, 100);
        this.searchInput.value = '';
        this.tempSelectedTags.clear();
        this.updateSelectedCount();
    }

    deleteTag(tag, event) {
        if (event) {
            event.stopPropagation();
        }
        const dropdown = this.tagSearchDropdown;
        if (!dropdown.classList.contains('hidden')) {
            dropdown.classList.add('closing');
            setTimeout(() => {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('closing');
                this.selectedTags.delete(tag);
                this.renderTags();
                this.filterTags();
            }, 50);
        } else {
            this.selectedTags.delete(tag);
            this.renderTags();
            this.filterTags();
        }
    }

    renderTags() {
        const currentTags = new Set(Array.from(this.tagsContainer.children).map(el => el.getAttribute('data-tag')));
        const addTagText = document.getElementById('addTagText');
        const addTagButton = addTagText.closest('button');
        
        Array.from(this.selectedTags).forEach((tag, index) => {
            // Skip if tag already exists in DOM
            if (currentTags.has(tag)) return;

            const colorIndex = index % this.tagColors.length;
            const colors = this.tagColors[colorIndex];
            
            const tagElement = document.createElement('div');
            tagElement.setAttribute('data-tag', tag);
            tagElement.className = `group relative ${colors.bg} ${colors.text} px-3 py-1 rounded-md text-xs ml-2 new-tag flex items-center`;
            tagElement.innerHTML = `
                <span class="max-w-[150px] truncate group/tooltip relative">
                    #${tag.toLowerCase()}
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1">
                        <div class="bg-black text-white px-2 py-1 text-xs rounded invisible group-hover/tooltip:visible whitespace-nowrap pointer-events-none">
                            #${tag.toLowerCase()}
                        </div>
                    </div>
                </span>
                <button onclick="tagManager.deleteTag('${tag}', event)" class="delete-btn absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-inherit rounded-r-md p-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;

            // After the element is added to DOM, check if tooltip is needed
            setTimeout(() => {
                const span = tagElement.querySelector('span');
                if (span.scrollWidth <= span.clientWidth) {
                    span.removeAttribute('onmouseenter');
                }
            }, 0);

            // Remove the new-tag class after animation completes
            setTimeout(() => {
                tagElement.classList.remove('new-tag');
            }, 200);
            this.tagsContainer.appendChild(tagElement);
        });

        // Remove tags that are no longer selected
        Array.from(this.tagsContainer.children).forEach(child => {
            const tag = child.getAttribute('data-tag');
            if (!this.selectedTags.has(tag)) {
                child.remove();
            }
        });

        if (this.selectedTags.size > 0) {
            addTagText.textContent = '';
            addTagText.className = 'hidden';
        } else {
            addTagText.textContent = 'ADD TAG';
            addTagText.className = 'pr-2';
        }
    }

    // Helper function to highlight matching letters
    highlightMatches(text, query) {
        if (!query) return text;
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        let result = '';
        let lastIndex = 0;
        let currentIndex = 0;
        
        // Find all occurrences of the query
        while ((currentIndex = lowerText.indexOf(lowerQuery, lastIndex)) !== -1) {
            // Add the text before the match
            result += text.slice(lastIndex, currentIndex);
            // Add the highlighted match
            result += `<span style="background-color: #C2E0FF; color: #064A8F">${text.slice(currentIndex, currentIndex + query.length)}</span>`;
            lastIndex = currentIndex + query.length;
        }
        
        // Add any remaining text after the last match
        result += text.slice(lastIndex);
        return result;
    }

    filterTags() {
        const query = this.searchInput.value.toLowerCase();
        const bottomBar = document.querySelector('#tagSearchDropdown .border-t.bg-gray-50');
        const searchContainer = document.getElementById('searchInput').closest('.p-2');
        const addTagButton = document.querySelector('button[onclick="tagManager.toggleTagSearch()"]');
        
        // Get the original indices of tags for consistent coloring
        const tagArray = Array.from(this.tags);
        
        // Filter out already selected tags and match the query
        const filteredTags = tagArray.filter(tag => 
            !this.selectedTags.has(tag) && tag.toLowerCase().includes(query)
        );

        this.searchResults.innerHTML = '';
        
        // Check if all available tags are selected (not counting deleted ones)
        const availableTags = Array.from(this.tags);
        const selectedTags = Array.from(this.selectedTags);
        const allTagsSelected = availableTags.length > 0 && selectedTags.length === availableTags.length && availableTags.every(tag => this.selectedTags.has(tag));
        
        // Enable/disable add tag button
        if (allTagsSelected && !query) {
            addTagButton.disabled = true;
            addTagButton.classList.add('opacity-50', 'cursor-not-allowed');
            // Add tooltip wrapper if it doesn't exist
            if (!addTagButton.parentElement.classList.contains('group/tooltip')) {
                const wrapper = addTagButton.parentElement;
                wrapper.classList.add('group/tooltip', 'relative');
                const tooltip = document.createElement('div');
                tooltip.className = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 pointer-events-none';
                tooltip.innerHTML = `
                    <div class="bg-black text-white px-2 py-1 text-xs rounded invisible group-hover/tooltip:visible whitespace-nowrap">
                        All available tags are selected
                    </div>
                `;
                wrapper.appendChild(tooltip);
            }
        } else {
            addTagButton.disabled = false;
            addTagButton.classList.remove('opacity-50', 'cursor-not-allowed');
            // Remove tooltip if it exists
            const wrapper = addTagButton.parentElement;
            if (wrapper.classList.contains('group/tooltip')) {
                const tooltip = wrapper.querySelector('.absolute.bottom-full');
                if (tooltip) {
                    tooltip.remove();
                }
                wrapper.classList.remove('group/tooltip', 'relative');
            }
        }

        // If we have a query but no matching tags, show "No matching tags found"
        if (query && filteredTags.length === 0) {
            searchContainer.style.display = 'block';
            const noResults = document.createElement('div');
            noResults.className = 'px-3 py-4 text-center';
            noResults.innerHTML = `
                <div class="text-gray-500 text-sm">No matching tags found</div>
            `;
            this.searchResults.appendChild(noResults);
            return;
        }

        // If all tags are selected and no query, show empty state
        if (filteredTags.length === 0 && !query && allTagsSelected) {
            searchContainer.style.display = 'none';
            const emptyState = document.createElement('div');
            emptyState.className = 'px-3 py-4 text-center';
            emptyState.innerHTML = `
                <div class="text-gray-500 text-sm">All available tags are selected</div>
            `;
            this.searchResults.appendChild(emptyState);
            return;
        }

        // Show search for available tags
        searchContainer.style.display = 'block';

        // Add existing filtered tags with tag-like styling
        filteredTags.forEach((tag) => {
            const div = document.createElement('div');
            const isSelected = this.tempSelectedTags.has(tag);
            // Use the original index for color consistency
            const colorIndex = tagArray.indexOf(tag) % this.tagColors.length;
            const colors = this.tagColors[colorIndex];
            
            div.className = 'px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2';
            div.innerHTML = `
                <input type="checkbox" class="rounded border-gray-300" ${isSelected ? 'checked' : ''}>
                <div class="flex-1">
                    <span class="${colors.bg} ${colors.text} px-2 py-1 rounded-md text-xs">
                        #${this.highlightMatches(tag, query)}
                    </span>
                </div>
            `;
            
            div.onclick = (e) => {
                e.stopPropagation();
                if (e.target.type !== 'checkbox') {
                    const checkbox = div.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                this.toggleTagSelection(tag);
            };
            this.searchResults.appendChild(div);
        });
    }
}

// Initialize tag manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tagManager = new TagManager();
}); 