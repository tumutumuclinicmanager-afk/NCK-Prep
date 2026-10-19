import fs from 'fs';
import path from 'path';

const dirsToScan = ['src', 'index.html', 'server.ts'];

function walk(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const stat = fs.statSync(dir);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
      walk(path.join(dir, file), fileList);
    }
  } else {
    fileList.push(dir);
  }
  return fileList;
}

const allFiles: string[] = [];
for (const item of dirsToScan) {
  if (fs.statSync(item).isDirectory()) {
    walk(item, allFiles);
  } else {
    allFiles.push(item);
  }
}

for (const filePath of allFiles) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.html') && !filePath.endsWith('.css')) {
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace case variations
  // NursePrep -> NCKPrep
  content = content.replace(/NursePrep/g, 'NCKPrep');
  // nurseprep -> nckprep
  content = content.replace(/nurseprep/g, 'nckprep');
  // Nurse Prep -> NCK Prep
  content = content.replace(/Nurse Prep/g, 'NCK Prep');
  // nurse prep -> nck prep
  content = content.replace(/nurse prep/g, 'nck prep');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}
console.log('Brand replacement complete!');
