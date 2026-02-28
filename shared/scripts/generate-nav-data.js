import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NAV_PATH = resolve(__dirname, '../nav.yaml');
const HUGO_DATA_DIR = resolve(__dirname, '../../hugo/data');
const HUGO_DATA_PATH = resolve(HUGO_DATA_DIR, 'nav.json');

const navData = yaml.load(readFileSync(NAV_PATH, 'utf8'));

mkdirSync(HUGO_DATA_DIR, { recursive: true });
writeFileSync(HUGO_DATA_PATH, JSON.stringify(navData, null, 2));

console.log(`Generated ${HUGO_DATA_PATH}`);
