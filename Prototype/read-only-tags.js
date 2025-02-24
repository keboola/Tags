// Read-only tag management functionality
class ReadOnlyTagManager {
    constructor() {
        this.tags = new Set([
            'data-lineage',
            'data-quality',
            'data-catalog',
            'metadata-management',
            'data-security',
            'compliance',
            'snowflake',
            'python',
            'transformation',
            'webinar'
        ]);
        
        // UI Elements
        this.tagsContainer = document.getElementById('tagsContainer');
        
        // Tag colors for visual display
        this.tagColors = [
            { bg: 'bg-blue-100', text: 'text-blue-800' },
            { bg: 'bg-green-100', text: 'text-green-800' },
            { bg: 'bg-purple-100', text: 'text-purple-800' },
            { bg: 'bg-pink-100', text: 'text-pink-800' },
            { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            { bg: 'bg-indigo-100', text: 'text-indigo-800' },
        ];

        this.renderTags();
    }

    renderTags() {
        Array.from(this.tags).forEach((tag, index) => {
            const colorIndex = index % this.tagColors.length;
            const colors = this.tagColors[colorIndex];
            
            const tagElement = document.createElement('div');
            tagElement.setAttribute('data-tag', tag);
            tagElement.className = `group relative ${colors.bg} ${colors.text} px-3 py-1 rounded-md text-xs ml-2 flex items-center`;
            tagElement.innerHTML = `
                <span class="max-w-[150px] truncate group/tooltip relative">
                    #${tag.toLowerCase()}
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1">
                        <div class="bg-black text-white px-2 py-1 text-xs rounded invisible group-hover/tooltip:visible whitespace-nowrap pointer-events-none">
                            #${tag.toLowerCase()}
                        </div>
                    </div>
                </span>
            `;

            // After the element is added to DOM, check if tooltip is needed
            setTimeout(() => {
                const span = tagElement.querySelector('span');
                if (span.scrollWidth <= span.clientWidth) {
                    span.removeAttribute('onmouseenter');
                }
            }, 0);

            this.tagsContainer.appendChild(tagElement);
        });
    }
}

// Initialize tag manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tagManager = new ReadOnlyTagManager();
}); 