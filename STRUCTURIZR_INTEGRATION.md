# Structurizr JSON Integration

BAC4 now supports importing from and exporting to Structurizr JSON format, enabling interoperability with the Structurizr ecosystem.

## Features

### Export to Structurizr JSON

Convert your BAC4 models to Structurizr workspace format for use with:
- Structurizr Cloud/On-Premises
- Structurizr DSL
- Structurizr CLI tools
- Other Structurizr-compatible tools

**How to export:**
1. Click the "Export" button in the header
2. Select "Structurizr JSON" from the dropdown
3. The workspace JSON file will be downloaded

### Import from Structurizr JSON

Import existing Structurizr workspaces into BAC4 for visual editing:
- Automatic format detection (BAC4 vs Structurizr)
- Preserves element hierarchy and relationships
- Imports positioning information from views
- Maps Structurizr tags to BAC4 tags

**How to import:**
1. Click the "Import" button in the header
2. Select a Structurizr JSON workspace file
3. The model will be loaded automatically

The import function automatically detects whether you're importing a BAC4 JSON file or a Structurizr workspace.

## Format Mapping

### BAC4 → Structurizr

| BAC4 Element | Structurizr Element | Notes |
|--------------|---------------------|-------|
| Person | Person | Direct mapping |
| System | Software System | location = Unspecified |
| External System | Software System | location = External, tags include "External" |
| Container | Container | Nested in parent system |
| Component | Component | Nested in parent container |
| Relationship | Relationship | Attached to source element |

**Additional mappings:**
- BAC4 metadata → Workspace name, version, properties
- Element positions → View element positions
- Tags → Comma-separated tag strings

### Structurizr → BAC4

| Structurizr Element | BAC4 Element | Detection Logic |
|---------------------|--------------|-----------------|
| Person | Person | Direct mapping |
| Software System (Internal) | System | location != "External" |
| Software System (External) | External System | location = "External" or has "External" tag |
| Container | Container | Preserves parent system reference |
| Component | Component | Preserves parent container reference |
| Relationship | Relationship | Converted to BAC4 format with default styles |

## Structurizr Workspace Structure

The exported Structurizr workspace includes:

```json
{
  "id": 1,
  "name": "Model Name",
  "description": "Export metadata",
  "version": "1.0",
  "model": {
    "people": [...],
    "softwareSystems": [
      {
        "containers": [
          {
            "components": [...]
          }
        ]
      }
    ]
  },
  "views": {
    "systemLandscapeViews": [...],
    "configuration": {
      "styles": {...}
    }
  },
  "properties": {
    "exportedFrom": "BAC4",
    "author": "..."
  }
}
```

## Views and Layouts

- **Export**: Creates a System Landscape view with automatic layout configuration
- **Import**: Extracts element positions from all view types (System Landscape, System Context, Container, Component)
- **Default positioning**: If no view data exists, elements are positioned at (100, 100)

## Default Styling

Exported workspaces include default C4 styling:
- Person: Blue (#08427b), Person shape
- Software System: Blue (#1168bd), Box shape
- External System: Gray (#999999), Box shape
- Container: Light blue (#438dd5), Box shape
- Component: Lighter blue (#85bbf0), Box shape

## Limitations and Considerations

### ID Mapping
- BAC4 uses timestamp-based IDs; Structurizr uses sequential integers
- ID mapping is maintained during conversion but IDs will change
- Relationships are remapped to maintain correct connections

### Hierarchy
- BAC4 allows orphaned containers/components
- Export creates default parent elements if needed
- Import preserves parent-child relationships using `parentSystem` and `parentContainer` properties

### Relationships
- BAC4 supports arrow direction, line style, and animation
- Structurizr uses simpler relationship model
- Some BAC4 relationship styling is lost during export
- Imported relationships use BAC4 defaults (right arrow, solid line, no animation)

### Tags
- BAC4 uses array of tags; Structurizr uses comma-separated strings
- System tags like "Person", "Software System", "Container", "Component" are filtered during import
- Custom tags are preserved in both directions

## Use Cases

### 1. Documenting Architecture in Structurizr
1. Create your model visually in BAC4
2. Export to Structurizr JSON
3. Import into Structurizr Cloud or On-Premises
4. Add additional documentation and custom views

### 2. Editing Existing Structurizr Models
1. Export workspace from Structurizr
2. Import JSON into BAC4
3. Use BAC4's visual editor to make changes
4. Re-export and sync back to Structurizr

### 3. Collaborative Workflows
1. Team maintains model in Structurizr (using DSL or UI)
2. Individual members can export to BAC4 for offline editing
3. Changes can be merged back through JSON comparison

### 4. Migration from Structurizr
1. Export all workspaces from Structurizr
2. Import into BAC4 for a more visual, interactive experience
3. Continue using BAC4 as primary tool
4. Periodically export for Structurizr compatibility

## Testing

A test script is provided to verify conversion integrity:

```bash
node test-structurizr-conversion.js
```

This test:
1. Converts a sample BAC4 model to Structurizr format
2. Converts it back to BAC4 format
3. Verifies element counts are preserved

## Structurizr Resources

- [Structurizr JSON Schema](https://github.com/structurizr/json)
- [Structurizr Cloud](https://structurizr.com/)
- [Structurizr DSL](https://github.com/structurizr/dsl)
- [Structurizr Documentation](https://docs.structurizr.com/)

## Implementation

The integration is implemented in `/src/utils/structurizrUtils.js`:
- `exportToStructurizr(model)` - Convert BAC4 to Structurizr
- `importFromStructurizr(workspace)` - Convert Structurizr to BAC4

The UI integration is in `/src/components/Header.jsx`:
- Export menu includes "Structurizr JSON" option
- Import automatically detects format and converts appropriately
