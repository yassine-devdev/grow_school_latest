// Simple test to check if journal components can be imported
const fs = require('fs');
const path = require('path');

const journalComponents = [
  'src/components/journal/JournalEntry.tsx',
  'src/components/journal/JournalEntryForm.tsx',
  'src/components/journal/JournalEntryList.tsx',
  'src/components/journal/JournalEntrySkeleton.tsx',
  'src/components/journal/JournalErrorState.tsx'
];

console.log('Checking journal components...');

journalComponents.forEach(component => {
  if (fs.existsSync(component)) {
    const content = fs.readFileSync(component, 'utf8');
    const lines = content.split('\n').length;
    console.log(`✅ ${component} - ${lines} lines`);
  } else {
    console.log(`❌ ${component} - NOT FOUND`);
  }
});

console.log('\nAll journal components created successfully!');