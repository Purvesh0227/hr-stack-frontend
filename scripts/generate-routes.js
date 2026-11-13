import fs from 'fs';

const routes = ['privacy-policy', 'help', 'support', 'login', 'register'];
const dist = 'dist';

for (const route of routes) {
  const source = `${dist}/index.html`;
  const destination = `${dist}/${route}.html`;
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log(`Created ${route}.html`);
  } else {
    console.error(`Could not find ${source}`);
  }
}