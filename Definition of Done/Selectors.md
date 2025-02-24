# Selectors - Definition of Done

## Overview
Component for selecting Keboola objects (tables, buckets, etc.) with integrated tag support and search functionality.

## Key Implementation Requirements

### Search & Tag Behavior
- [ ] Default state shows objects without tags
- [ ] Tags appear only when:
  - Tag matches search term
  - Search starts with '#' (tag-only search mode)
- [ ] Hide tags when only object name matches search
- [ ] Return to default state (no tags) when search is cleared

### Selection Behavior
- [ ] Select All functionality for visible items
- [ ] Indeterminate state when:
  - Partial selection exists after search clear
  - Some search results are selected
- [ ] Selection persistence across search changes

### UI Components
- [ ] Reuse existing Keboola select box component
- [ ] Search input with:
  - Real-time filtering
  - '#' prefix handling for tag-only search
  - Text highlighting for matches
- [ ] Object list:
  - Standard Keboola object row layout
  - Dynamic tag display based on search context
  - Checkbox for selection (support indeterminate state)

### States to Handle
- [ ] Search:
  - Empty (default, no tags)
  - Name match (show object, hide tags)
  - Tag match (show object with matching tag)
  - Tag-only search mode (#)
- [ ] Selection:
  - All/None
  - Indeterminate (third checkbox state):
    - Visual: Checkbox shows a dash/partial fill instead of checkmark
    - When: Some but not all items are selected
    - Example: If user searches "data", selects some items, then clears search - the "Select All" checkbox should show indeterminate state
  - Persist across search

### Performance
- [ ] Reuse existing virtualization for large lists
- [ ] Standard Keboola response time requirements

### Integration
- [ ] Use Keboola UI components where possible
- [ ] Follow platform tag styling
- [ ] Standard platform animations 