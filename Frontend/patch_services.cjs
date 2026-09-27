const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');

function processServiceFiles() {
  const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('Service.js'));

  for (const file of files) {
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already imported
    if (!content.includes('useMockApi')) {
      // Add import at the top
      content = content.replace(/(import .*?;[\n\r]+)/, `$1import { useMockApi } from '../utils/mockConfig';\n`);
      
      // Inject check inside catch blocks that have mock logic.
      // E.g., catch (error) { ... if (!useMockApi()) throw error; ... }
      content = content.replace(/catch\s*\(([^)]+)\)\s*\{/g, `catch ($1) {\n      if (!useMockApi()) throw $1;`);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

processServiceFiles();
