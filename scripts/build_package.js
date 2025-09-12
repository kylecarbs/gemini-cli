/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

if (!process.cwd().includes('packages')) {
  console.error('must be invoked from a package directory');
  process.exit(1);
}

// build typescript files
execSync('tsc --build', { stdio: 'inherit' });

// copy .{md,json} files
execSync('node ../../scripts/copy_files.js', { stdio: 'inherit' });

// touch dist/.last_build
writeFileSync(join(process.cwd(), 'dist', '.last_build'), '');

// because of the @hugodutka aliases we manually fix up the dependency path
// for the gemini-cli-core package that gemini-cli depends on
if (process.cwd().endsWith('cli')) {
  const currentCoreVersion = JSON.parse(
    readFileSync('../../packages/core/package.json', 'utf8'),
  ).version;
  const packageJsonContent = readFileSync(
    join(process.cwd(), 'dist/package.json'),
    'utf8',
  );
  const parsedContent = JSON.parse(packageJsonContent);
  parsedContent.dependencies['@google/gemini-cli-core'] =
    `npm:@hugodutka/gemini-cli-core@${currentCoreVersion}`;
  writeFileSync(
    join(process.cwd(), 'dist/package.json'),
    JSON.stringify(parsedContent, null, 2),
  );
}

process.exit(0);
