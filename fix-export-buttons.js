const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Pattern to find Export button. 
  // It looks for <Button ...>Export</Button> or <Button ...>Exporting...</Button>
  // We need to carefully add disabled prop.
  // Actually, some files have `disabled={isExporting === true}` or `disabled={!isAdmin}`.
  
  // Let's use a regex to match Button elements that contain "Export" as their text content
  // Note: This regex assumes the button tag doesn't contain nested tags for Export text, except maybe ternary.
  
  const regex = /<Button([^>]*)>([^<]*Export(?:ing\.\.\.)?[^<]*)<\/Button>/gi;
  
  content = content.replace(regex, (match, attrs, text) => {
    // If it already contains our exact disabled string, skip
    if (attrs.includes("localStorage.getItem('loginRole') !== 'admin'")) {
      return match;
    }
    
    // If it already has disabled={!isAdmin}, let's replace it with our safe one or just leave it?
    // Let's just remove existing disabled if it's disabled={!isAdmin} and replace it.
    if (attrs.includes("disabled={!isAdmin}")) {
        attrs = attrs.replace(/disabled=\{!isAdmin\}/g, "disabled={localStorage.getItem('loginRole') !== 'admin'}");
        return `<Button${attrs}>${text}</Button>`;
    }
    
    // If it has some other disabled logic like disabled={isExporting}, we should combine them!
    if (attrs.includes('disabled={')) {
        // e.g. disabled={isExporting === true} -> disabled={isExporting === true || localStorage.getItem('loginRole') !== 'admin'}
        attrs = attrs.replace(/disabled=\{([^}]+)\}/, (m, inner) => {
            if (inner.includes("localStorage.getItem")) return m;
            return `disabled={${inner} || localStorage.getItem('loginRole') !== 'admin'}`;
        });
        return `<Button${attrs}>${text}</Button>`;
    }
    
    // If no disabled prop, just add it.
    return `<Button${attrs} disabled={localStorage.getItem('loginRole') !== 'admin'}>${text}</Button>`;
  });
  
  if (content !== originalContent) {
    console.log(`Updated ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

const targetDir = path.join(__dirname, 'src', 'views');
processDirectory(targetDir);

// Also process the ImportExport component explicitly just in case
processFile(path.join(__dirname, 'src', 'component', 'ImportExport.jsx'));

console.log('Done.');
