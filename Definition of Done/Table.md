# Table - Definition of Done

## Overview
Component for displaying and managing Keboola objects (tables, buckets, flows, etc.) with integrated search, filtering, and tag functionality. It is basically update of the listing component with integrated tag support.

## Key Implementation Requirements

### Search & Filter Behavior
- [ ] Default state:
  - Show all items in default view
  - Tags hidden by default
  - Maintain parent-child relationships (e.g., buckets and their tables)
- [ ] Search functionality:
  - Real-time filtering as user types
  - Highlight matching text in results
  - Show parent items (e.g., buckets) when child matches
  - Tag-specific search with '#' prefix:
    - When search starts with '#', only search in tags
    - Automatically select matching tags in tag filter
- [ ] Filter controls:
  - "Show" dropdown for object types (All, Tables, Buckets, etc.)
  - Tag filter dropdown with search and multi-select
  - Visibility settings for tags and additional information

### UI Components
- [ ] Search bar:
  - Full-width input with placeholder showing total items
  - Left-aligned search icon
  - Right-aligned filter controls
- [ ] Filter controls:
  - Show filter (objects select)
  - Tag filter with searchable dropdown (multiselect)
  - Visibility toggle for tags
- [ ] Table layout updates:
  - Support for custom tags - under the name in a new row (system tags remain after the name)

### States & Interactions
- [ ] Item states:
  - Selected/unselected
  - Expanded/collapsed for parent items
  - Highlighted when matching search
- [ ] Tag visibility:
  - Hidden by default
  - Visible when matching search
  - Configurable via visibility toggle
- [ ] Filter states:
  - Active/inactive indicators
  - Multi-select support
  - Clear/reset options

### Integration
- [ ] Support for all main sections:
  - Storage
  - Data Catalog
  - Flows
  - Components
  - Transformations
  - Data Apps
- [ ] Consistent styling with Keboola platform
- [ ] Reuse existing components where possible

### Performance
- [ ] Real-time search response
- [ ] Smooth animations for expand/collapse
- [ ] Efficient handling of large datasets
- [ ] Optimized rendering for tag visibility changes 