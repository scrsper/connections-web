import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// This project already has its production Custom Domain. Uploading and deploying
// a version preserves routes and does not require permission to rewrite the zone.
const wrangler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
const run = args => {
  const result = spawnSync(process.execPath, [wrangler, ...args], { encoding:'utf8', env:process.env, maxBuffer:20*1024*1024 });
  if(result.stdout)process.stdout.write(result.stdout);
  if(result.stderr)process.stderr.write(result.stderr);
  if(result.error)throw result.error;
  if(result.status !== 0)process.exit(result.status || 1);
  return result.stdout;
};
const message = `Bad Tengu research atlas ${process.env.GITHUB_SHA?.slice(0,12) || 'local'}`;
const output=run(['versions','upload','--keep-vars','--message',message]).replace(/\x1b\[[0-9;]*m/g,'');
const version=output.match(/Worker Version ID:\s*([a-f0-9-]{36})/i)?.[1];
if(!version)throw Error('Upload completed but returned no recognizable version ID. No deployment was attempted.');
run(['versions','deploy',`${version}@100`,'--yes','--message',message]);
