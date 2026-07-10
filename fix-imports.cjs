const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      fixImports(p);
    } else if (p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      content = content.replace(/from\s+['"](\.[^'"]+)['"]/g, (m, p1) => {
        return "from '" + (p1.endsWith('.js') ? p1 : p1 + '.js') + "'";
      });
      fs.writeFileSync(p, content);
    }
  }
}

fixImports('apps/backend/src/users');
fixImports('apps/backend/src/roles');

let app = fs.readFileSync('apps/backend/src/app.module.ts', 'utf8');
app = app.replace(/from ['"](\.[^'"]+)['"]/g, (m, p1) => {
  return "from '" + (p1.endsWith('.js') ? p1 : p1 + '.js') + "'";
});
fs.writeFileSync('apps/backend/src/app.module.ts', app);
