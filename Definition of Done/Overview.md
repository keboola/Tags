# Tags Implementation - Definition of Done

## Overview
This directory contains the Definition of Done documents for implementing tags functionality in the Keboola Connection platform. Each document focuses on specific implementation requirements for frontend developers familiar with the platform.

## Components

### Tags Management Center
Central interface for managing tags across the platform. Includes tag creation, editing, and bulk operations.

### Table
Enhanced table listing with integrated tag support, search, and filtering capabilities.

### Selectors
Component for selecting Keboola objects with integrated tag support and search functionality.

### Object Detail
Component for managing tags in object detail views across different Keboola objects.

## Implementation Scope

### Core Features
- Tag management (create, edit, delete)
- Object tagging
- Search and filtering
- Bulk operations

### Integration Points
- Storage
- Data Catalog
- Flows
- Components
- Transformations
- Data Apps

### Requirements
- Tags are streamed into telemetry
- Access to management center (to create, edit or delete tags) is granted to users with admin or share roles

### Common Requirements
- Reuse existing Keboola components
- Follow platform patterns
- Maintain consistent UX
- Performance optimization 