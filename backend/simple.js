console.log('Starting simple test...');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Process ID:', process.pid);

setTimeout(() => {
  console.log('Timeout completed successfully');
  process.exit(0);
}, 1000);

console.log('Script will exit in 1 second...');
