import { rmSync } from 'node:fs';
import { join } from 'node:path';

const generatedRouteCachePaths = [
  join(process.cwd(), '.next', 'dev'),
  join(process.cwd(), '.next', 'types'),
];

for (const target of generatedRouteCachePaths) {
  rmSync(target, { recursive: true, force: true });
}
