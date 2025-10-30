# BAC4 Development Guide

## Preventing Common Errors

This guide documents best practices and testing procedures to ensure code reliability.

## Debug Mode

The application includes a debug mode that logs state changes to the console. To enable:

```javascript
// In browser console:
window.__BAC4_DEBUG__ = true;

// Or programmatically in store.js:
debugMode: true
```

When debug mode is enabled, you'll see:
- `[BAC4 Debug] updateElement called:` - When elements are updated
- `[BAC4 Debug] Element updated:` - The updated element state
- `[BAC4 Debug] updateRelationship called:` - When relationships are updated
- `[BAC4 Debug] Relationship updated:` - The updated relationship state

## Common Issues and Solutions

### Issue 1: Event Objects Passed to Save Functions

**Problem**: Event handlers like `onBlur` pass event objects as the first parameter. If a save function accepts parameters, it might accidentally save the event object to the store, causing circular reference errors when localStorage tries to serialize it.

**Symptoms**:
- "Converting circular structure to JSON" errors
- References to HTMLInputElement, Window, or React fiber objects
- Input fields reverting to old values

**Solution**:
- Separate handlers for different input types
- Text inputs with onBlur: Save function takes no parameters, always uses current state
- Selects with onChange: Dedicated handler that updates state and saves with new value
- Example from PropertiesPanel.jsx:

```javascript
// CORRECT - Text input pattern
const handleEdgeSave = () => {
  if (selectedEdge) {
    updateRelationship(selectedEdge.id, edgeFormData); // Uses state
  }
};

<input onBlur={handleEdgeSave} /> // Event object ignored

// CORRECT - Select pattern
const handleEdgeSelectChange = (field, value) => {
  const newFormData = { ...edgeFormData, [field]: value };
  setEdgeFormData(newFormData);
  if (selectedEdge) {
    updateRelationship(selectedEdge.id, newFormData); // Uses fresh value
  }
};

<select onChange={(e) => handleEdgeSelectChange('field', e.target.value)} />

// WRONG - Don't mix patterns
const handleEdgeSave = (updates) => {
  updateRelationship(id, updates || edgeFormData);
};
<input onBlur={handleEdgeSave} /> // Passes event object as updates!
```

### Issue 2: useEffect Resetting Forms on Every Update

**Problem**: When useEffect watches an entire object (`[selectedEdge]`), it runs whenever ANY property of that object changes. If the effect resets form data, this creates a loop where saving triggers a reset.

**Symptoms**:
- Text fields revert to old values after blur
- Cannot edit fields - they keep resetting
- Form resets while typing

**Example of the Problem**:
```javascript
// WRONG - Resets form whenever ANY property changes
useEffect(() => {
  if (selectedEdge) {
    setEdgeFormData({
      description: selectedEdge.description || '',
      technology: selectedEdge.technology || '',
    });
  }
}, [selectedEdge]); // Runs on every property change!

// What happens:
// 1. User types "API call" → onChange updates local state
// 2. User blurs → onBlur saves to store
// 3. updateRelationship updates selectedEdge in store
// 4. useEffect sees selectedEdge changed → resets form
// 5. Form reverts to old value or gets out of sync
```

**Solution**: Only watch the ID, not the entire object
```javascript
// CORRECT - Only resets when selecting a different edge
useEffect(() => {
  if (selectedEdge) {
    setEdgeFormData({
      description: selectedEdge.description || '',
      technology: selectedEdge.technology || '',
    });
  }
}, [selectedEdge?.id]); // Only runs when ID changes

// Now:
// - Form resets when you select a DIFFERENT edge (ID changes)
// - Form stays intact when you update the SAME edge (ID unchanged)
```

This pattern applies to any form that edits objects from a store.

### Issue 3: State Updates Not Reflecting Immediately

**Problem**: React state updates are asynchronous. When you update local state and immediately try to use it, you might get stale data.

**Solution**:
- Create the new state object and use it immediately
- Don't rely on state being updated in the same function
- Example shown in Issue 1 above

### Issue 4: Missing Event Handlers

**Problem**: Adding UI features without implementing the underlying state management.

**Solution**:
1. Add the UI component (e.g., NodeResizer)
2. Implement the event handler (e.g., handleNodesChange)
3. Update the store to persist the changes
4. Apply stored state when recreating components

Example: Annotation resize implementation requires:
- NodeResizer component in C4Node.jsx
- handleNodesChange in App.jsx to capture resize events
- Storing width/height in element data
- Applying stored dimensions when creating nodes

### Issue 5: Zustand Store Updates Not Triggering Re-renders

**Problem**: When updating selectedElement or selectedEdge, the change doesn't propagate to dependent components.

**Solution**: Always update the selected element/edge when modifying it:

```javascript
// In store.js updateElement:
const updatedElement = updatedArray.find((el) => el.id === id);
const newSelectedElement = state.selectedElement?.id === id ? updatedElement : state.selectedElement;

return {
  [propertyName]: updatedArray,
  selectedElement: newSelectedElement, // Critical!
};
```

## Testing Checklist

Before committing changes, test these scenarios:

### Element Properties
- [ ] Change element name - verify diagram updates immediately
- [ ] Change element description - verify diagram updates immediately
- [ ] Change element technology - verify diagram updates immediately
- [ ] Delete element - verify it disappears from diagram
- [ ] Add element - verify it appears at correct level

### Relationship Properties
- [ ] Change edge description - verify label updates immediately
- [ ] Change edge technology - verify it saves correctly
- [ ] Change arrow direction (right/left/both/none) - verify arrows update immediately
- [ ] Change line style (solid/dashed/dotted) - verify style updates immediately
- [ ] Delete relationship - verify it disappears from diagram

### Annotations
- [ ] Add annotation - verify it appears on canvas
- [ ] Resize annotation - verify size persists after refresh
- [ ] Resize annotation - verify size persists after level change
- [ ] Edit annotation name - verify diagram updates immediately
- [ ] Properties panel should only show Name field (no technology/description)
- [ ] Annotations should be visible at all C4 levels

### Level Changes
- [ ] Change from Context to Container - verify warning appears if elements exist
- [ ] Change levels - verify appropriate elements are shown/hidden
- [ ] Change levels - verify toolbar buttons update

### Persistence
- [ ] Make changes - refresh page - verify changes persist
- [ ] Export model - import model - verify all data preserved
- [ ] Resize annotation - export - import - verify size preserved

### Build Process
- [ ] Run `npm run build:standalone`
- [ ] Open bac4-standalone.html in browser
- [ ] Verify all functionality works in standalone file
- [ ] Check browser console for errors

## Code Review Checklist

When reviewing or writing code that updates state:

1. **Is the update synchronous?**
   - If not, pass values directly instead of relying on state

2. **Does the update affect selected elements?**
   - If yes, update selectedElement/selectedEdge in the same action

3. **Are event handlers wired up?**
   - UI components → Event handlers → Store updates → State application

4. **Is the change persisted?**
   - Store updates → Local storage (automatic)
   - Custom properties (like dimensions) → Explicitly stored

5. **Does it work in the built file?**
   - Always test the standalone HTML after significant changes

## Architecture Notes

### State Flow
```
User Action → React Component → Store Action → State Update → Re-render
                                       ↓
                                 Local Storage
```

### React Flow Integration
- React Flow manages nodes/edges internally
- We sync store → React Flow via useEffect
- We sync React Flow → store via event handlers (onNodeDragStop, handleNodesChange)
- Important: React Flow nodes are recreated on every store change, so we must reapply custom properties

### Zustand Patterns
- Use selective subscriptions to prevent unnecessary re-renders
- Subscribe to individual arrays, not wrapper objects
- Update both data array AND selected element in same action

## Debugging Tips

1. **Enable debug mode** to see state changes in console
2. **Use React DevTools** to inspect component state and props
3. **Check Zustand store** directly: `useStore.getState()` in console
4. **Verify event handlers** are firing: Add console.logs temporarily
5. **Check React Flow state**: `reactFlowInstance.toObject()` to see nodes/edges

## Making Changes Safely

1. **Read existing code** to understand current patterns
2. **Test in dev** before building standalone
3. **Use debug logging** to verify state changes
4. **Follow the checklist** above
5. **Test in standalone HTML** to ensure it works in production

## Common Patterns

### Adding a new element property

1. Add to store initial state (if needed)
2. Update PropertiesPanel to display/edit it
3. Ensure updateElement saves it correctly
4. Update C4Node to display it (if visual)
5. Test save/load cycle

### Adding a new relationship property

1. Add to relationship in store
2. Update PropertiesPanel edge form
3. Ensure updateRelationship saves it immediately
4. Update App.jsx edge rendering if visual change
5. Test all arrow/line combinations

### Adding resize/drag/custom behavior

1. Add the React Flow component/handler
2. Capture the event (onNodesChange, onNodeDragStop, etc.)
3. Extract the data you need to persist
4. Update the store
5. Reapply the data when recreating nodes

## Preventing "Silly Errors"

The user is right - these types of errors burn time. Here's how to prevent them:

1. **Always complete the loop**: UI → Handler → Store → UI
2. **Test immediately**: Don't commit without testing
3. **Use the checklist**: Above testing checklist for every change
4. **Enable debug mode**: See exactly what's happening
5. **Think through state timing**: React state is async
6. **Document as you go**: Update this file with new patterns

## When Adding New Features

1. **Design the data model** first (what needs to be stored?)
2. **Update the store** with new state and actions
3. **Create the UI** components
4. **Wire up event handlers** completely
5. **Test the full cycle** with checklist
6. **Document** any new patterns here
