import { rmSync } from 'node:fs';
import { join } from 'node:path';

const generatedRouteCachePaths = [
  join(process.cwd(), '.next', 'dev', 'types', 'routes.d.ts'),
  join(process.cwd(), '.next', 'dev', 'types', 'validator.ts'),
  join(process.cwd(), '.next', 'types'),
];

for (const target of generatedRouteCachePaths) {
  rmSync(target, { recursive: true, force: true });
}
