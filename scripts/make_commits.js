/*
  Commit generator: creates N commits with timestamps strictly before 4:00 PM.
  Usage:
    node scripts/make_commits.js 10

  Requirements:
    npm i jsonfile moment simple-git random
*/

const path = require('path');
const jsonfile = require('jsonfile');
const moment = require('moment');
const simpleGit = require('simple-git');
// Simple RNG helper
function getRandomInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo; // inclusive
}

const N = Number(process.argv[2] || 10);
const FILE_PATH = path.join(process.cwd(), 'data.json');

// Fixed window: 2025-09-08 between 14:00:00 and 15:59:59 local time
const FIXED_DAY = '2025-09-08T14:00:00';

function buildRandomDateInWindow() {
  const base = moment(FIXED_DAY);
  const minutesOffset = getRandomInt(0, 119); // 2 hours window → 0..119 minutes
  const seconds = getRandomInt(0, 59);
  const dt = base.clone().add(minutesOffset, 'minutes').set({ second: seconds, millisecond: 0 });
  return dt.toISOString();
}

function makeCommit(n) {
  if (n === 0) {
    return simpleGit().push().catch(err => {
      console.error('Push failed:', err.message);
      process.exitCode = 1;
    });
  }

  const DATE = buildRandomDateInWindow();
  const data = { date: DATE };
  console.log('Committing with date:', DATE);

  jsonfile.writeFile(FILE_PATH, data, { spaces: 2 }, err => {
    if (err) {
      console.error('Error writing file:', err);
      process.exit(1);
    }
    simpleGit()
      .add([FILE_PATH])
      .commit(DATE, { '--date': DATE })
      .then(() => makeCommit(n - 1))
      .catch(e => {
        console.error('Commit failed:', e.message);
        process.exit(1);
      });
  });
}

async function commitAddedFilesIndividually() {
  const git = simpleGit();
  const status = await git.status();
  const added = [...status.not_added, ...status.created];
  if (added.length === 0) return false;

  for (const file of added) {
    const DATE = buildRandomDateInWindow();
    console.log('Committing added file:', file, 'at', DATE);
    await git.add([file]);
    await git.commit(`add ${path.basename(file)}`, { '--date': DATE });
  }
  await git.push();
  return true;
}

(async () => {
  try {
    // Prefer committing actually added files one-by-one within the window
    const didAdded = await commitAddedFilesIndividually();
    if (!didAdded) {
      // Fallback: create N synthetic commits (touching data.json)
      makeCommit(N);
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();


