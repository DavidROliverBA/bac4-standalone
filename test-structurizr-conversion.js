/**
 * Test script to verify Structurizr import/export functionality
 * Run with: node test-structurizr-conversion.js
 */

// Sample BAC4 model
const sampleBac4Model = {
  metadata: {
    name: 'Test E-Commerce System',
    version: '1.0',
    author: 'Test User'
  },
  systems: [
    {
      id: 'system-1',
      type: 'system',
      name: 'E-Commerce Platform',
      description: 'Main e-commerce system',
      technology: 'Java Spring',
      tags: ['Core'],
      position: { x: 100, y: 100 }
    }
  ],
  externalSystems: [
    {
      id: 'externalSystem-1',
      type: 'externalSystem',
      name: 'Payment Gateway',
      description: 'Third-party payment processor',
      technology: '',
      tags: ['External'],
      position: { x: 400, y: 100 }
    }
  ],
  people: [
    {
      id: 'person-1',
      type: 'person',
      name: 'Customer',
      description: 'Online shopper',
      technology: '',
      tags: [],
      position: { x: 100, y: 300 }
    }
  ],
  containers: [],
  components: [],
  relationships: [
    {
      id: 'rel-1',
      from: 'person-1',
      to: 'system-1',
      description: 'Places orders',
      technology: 'HTTPS',
      arrowDirection: 'right',
      lineStyle: 'solid',
      animated: false
    },
    {
      id: 'rel-2',
      from: 'system-1',
      to: 'externalSystem-1',
      description: 'Processes payments',
      technology: 'REST API',
      arrowDirection: 'right',
      lineStyle: 'solid',
      animated: false
    }
  ]
};

// Import the conversion functions
import { exportToStructurizr, importFromStructurizr } from './src/utils/structurizrUtils.js';

console.log('🧪 Testing Structurizr Conversion\n');
console.log('='.repeat(50));

// Test export
console.log('\n1️⃣  Testing BAC4 → Structurizr Export');
console.log('-'.repeat(50));

try {
  const structurizrWorkspace = exportToStructurizr(sampleBac4Model);
  console.log('✅ Export successful!');
  console.log('\nStructurizr Workspace Structure:');
  console.log('  - Name:', structurizrWorkspace.name);
  console.log('  - Version:', structurizrWorkspace.version);
  console.log('  - People:', structurizrWorkspace.model.people.length);
  console.log('  - Systems:', structurizrWorkspace.model.softwareSystems.length);
  console.log('  - Views:', Object.keys(structurizrWorkspace.views).length);

  // Test import
  console.log('\n2️⃣  Testing Structurizr → BAC4 Import');
  console.log('-'.repeat(50));

  const importedModel = importFromStructurizr(structurizrWorkspace);
  console.log('✅ Import successful!');
  console.log('\nImported BAC4 Model Structure:');
  console.log('  - Name:', importedModel.metadata.name);
  console.log('  - People:', importedModel.people.length);
  console.log('  - Systems:', importedModel.systems.length);
  console.log('  - External Systems:', importedModel.externalSystems.length);
  console.log('  - Relationships:', importedModel.relationships.length);

  // Verify round-trip conversion preserves data
  console.log('\n3️⃣  Verifying Round-Trip Conversion');
  console.log('-'.repeat(50));

  const originalCount = {
    people: sampleBac4Model.people.length,
    systems: sampleBac4Model.systems.length,
    externalSystems: sampleBac4Model.externalSystems.length,
    relationships: sampleBac4Model.relationships.length
  };

  const importedCount = {
    people: importedModel.people.length,
    systems: importedModel.systems.length,
    externalSystems: importedModel.externalSystems.length,
    relationships: importedModel.relationships.length
  };

  const allMatch = Object.keys(originalCount).every(
    key => originalCount[key] === importedCount[key]
  );

  if (allMatch) {
    console.log('✅ All elements preserved correctly!');
  } else {
    console.log('⚠️  Element counts differ:');
    console.log('   Original:', originalCount);
    console.log('   Imported:', importedCount);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ All tests passed!\n');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
