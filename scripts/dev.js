const path = require('path');
const { spawn } = require('child_process');

const children = [];
let shuttingDown = false;

const workspaceRoot = path.resolve(__dirname, '..');

const startService = (name, relativeCwd) => {
  const serviceCwd = path.resolve(workspaceRoot, relativeCwd);

  const child = spawn('npm run dev', {
    cwd: serviceCwd,
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    if (shuttingDown) return;

    if (code !== 0) {
      console.error(`${name} dev process exited with code ${code}.`);
    }

    shutdown(code || 0);
  });

  children.push(child);
};

const shutdown = (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  process.exit(exitCode);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

startService('Backend', 'backend');
startService('Frontend', 'frontend');
