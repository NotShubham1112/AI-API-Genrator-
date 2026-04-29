import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = {
  'bg-slate-900': 'bg-background',
  'bg-slate-800': 'bg-card',
  'border-slate-700': 'border-border',
  'border-slate-600': 'border-input',
  'text-slate-400': 'text-muted-foreground',
  'text-slate-300': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-200': 'text-foreground',
  'text-white': 'text-foreground',
  'bg-slate-700/50': 'bg-muted/50',
  'bg-slate-700': 'bg-muted',
  'hover:bg-slate-700': 'hover:bg-accent',
  'hover:bg-slate-600': 'hover:bg-accent hover:text-accent-foreground',
  'hover:text-white': 'hover:text-accent-foreground',
  'hover:border-slate-600': 'hover:border-accent',
  'bg-blue-600/20': 'bg-primary/20',
  'bg-blue-600': 'bg-primary',
  'hover:bg-blue-700': 'hover:bg-primary/90',
  'text-blue-400': 'text-primary',
  'text-blue-500': 'text-primary',
  'border-blue-600': 'border-primary',
  'border-blue-500': 'border-primary',
  'focus:border-blue-500': 'focus:border-primary',
  'focus:ring-blue-500': 'focus:ring-primary',
  'focus:ring-offset-slate-800': 'focus:ring-offset-background'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [oldClass, newClass] of Object.entries(replacements)) {
    // Basic regex replacing word boundaries bounded by quotes, backticks or spaces
    const regex = new RegExp(`(?<=["'\\s\`])${oldClass}(?=["'\\s\`])`, 'g');
    content = content.replace(regex, newClass);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDirectory(path.join(__dirname, '../../app/dashboard'));
processDirectory(path.join(__dirname, '../../components/dashboard'));

console.log('Done!');
