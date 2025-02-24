# Tags Management Center - Definition of Done

## Overview

The Tags Management Center is a centralized interface for managing key-value tags across Keboola. It provides comprehensive functionality for creating, organizing, and managing tags for multiple object types (Tables, Buckets, Flows, Configurations, Transformations, Data Apps).

### Key Features
1. Key-Value Tag Management
   - Create, edit, and delete key-value pairs
   - Custom key-value pair creation

2. Object Support
   - Tables
   - Buckets
   - Flows
   - Configurations
   - Transformations
   - Data Apps

3. Bulk Operations
   - Multi-select tags
   - Bulk tag delete operation

4. Search Feature
   - Basic tag search (key:value)
   - Tag-based resource filtering

5. Access Control
   - Accessible to uders with admin or share roles

## Frontend Definition of Done

### User Interface
- [ ] Tag Management Dashboard
  - Search bar (filtering by tag name, highlighting the matching string within the tag name)
  - Five columns:
   - Multiselect (possibility to multiselect objects)
   - Tag (tag name and color)
   - Objects Count (number of objects with this tag - no interaction within MVP)
   - Creator (user who created the tag)
   - Last Updated (last time tag was updated)
  - Possibility to sort by each column (alphabetically, by number of objects, by last updated)
  - Bulk operations interface (delete)
  - On hover of the row, three dots more menu appears at the end of the row with following options:
    - Edit tag
    - Delete tag
  - Button to create a new tag

- [ ] Tag Creation Modal
  - Input fields:
    - Tag name (defaultly with # at the beginning, validation if the tag name is already taken)
    - Tag color (defaultly with gray color)
  - Once created, the tag is automatically added to the tag management dashboard
  - Once created, the tag is possible to assign to objects

- [ ] Tag Edit Modal
  - Input fields:
    - Tag name (defaultly with # at the beginning, validation if the tag name is already taken)
    - Tag color
  - Once edited, the tag is automatically edited in the tag management dashboard and all appropriate places

### User Experience
  - Reuse existing components from the platform if possible
  - Initial load < 1.5s
  - Tag operations < 200ms
  - Ensure responsivity on multiple devices/resolutions
  - Ensure functionality on all browsers (IE11+)

## Backend Definition of Done

### Proposal from AI - to be updated once RFC is approved

### API Endpoints
- [ ] Tag Management
  ```
  POST /v2/storage/tags
  GET /v2/storage/tags
  GET /v2/storage/tags/{key}/{value}
  PUT /v2/storage/tags/{key}/{value}
  DELETE /v2/storage/tags/{key}/{value}
  ```

- [ ] Bulk Operations
  ```
  POST /v2/storage/tags/bulk
  PUT /v2/storage/tags/bulk
  DELETE /v2/storage/tags/bulk
  POST /v2/storage/tags/bulk/validate
  ```

- [ ] Search and Filter
  ```
  POST /v2/storage/tags/search
  GET /v2/storage/tags/saved-searches
  POST /v2/storage/tags/saved-searches
  ```

### Data Model
- [ ] Tags Table
  - Key (string, indexed)
  - Value (string, indexed)
  - Description (optional)
  - Scope (organization/project)
  - Created/Updated timestamps
  - Creator/Updater information

- [ ] Tag Assignments Table
  - Key-Value reference
  - Object type (table/bucket/flow/etc.)
  - Object identifier
  - Assignment metadata
  - Timestamp
  - Assigner information

- [ ] Saved Searches Table
  - Search query
  - User reference
  - Name and description
  - Created/Updated timestamps

### Security
- [ ] Authentication
  - Token validation
  - Session management
  - Rate limiting

- [ ] Authorization
  - Role-based access control
  - Resource-level permissions
  - Cross-organization access

- [ ] Audit System
  - Operation logging
  - Change tracking
  - Access logging

### Performance
- [ ] Response Times
  - List operations < 200ms
  - CRUD operations < 100ms
  - Bulk operations < 500ms (up to 100 objects)
  - Search operations < 300ms
  - Cross-resource queries < 500ms

- [ ] Scalability
  - Support for 1M+ key-value pairs
  - 100K+ tagged objects
  - 1000+ concurrent users
  - 10K+ operations/minute

### Data Integrity
- [ ] Validation
  - Input sanitization
  - Format validation
  - Relationship integrity
  - Duplicate prevention

- [ ] Consistency
  - Transaction management
  - Conflict resolution
  - Cache consistency
  - Event ordering

### Monitoring
- [ ] Metrics
  - Operation latency
  - Error rates
  - Usage patterns
  - Resource utilization

- [ ] Alerting
  - Error thresholds
  - Performance degradation
  - Security incidents
  - System health

### Documentation
- [ ] API Documentation
  - OpenAPI/Swagger specs
  - Example requests/responses
  - Error codes
  - Rate limits

- [ ] Integration Guide
  - Setup instructions
  - Best practices
  - Common patterns
  - Troubleshooting

### Interoperability
- [ ] External System Support
  - AWS tag format compatibility
  - Azure tag format compatibility
  - GCP label format compatibility
  - Snowflake tag compatibility
  - Export/Import functionality 