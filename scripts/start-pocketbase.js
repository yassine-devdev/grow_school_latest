const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function checkPocketBaseHealth() {
  try {
    const response = await fetch('http://127.0.0.1:8090/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function startPocketBase() {
  const isRunning = await checkPocketBaseHealth();
  
  if (isRunning) {
    console.log('✅ PocketBase is already running on http://127.0.0.1:8090');
    return;
  }

  console.log('🚀 Starting PocketBase server...');
  
  const pbPath = path.join(__dirname, '../src/backend/pocketbase/pocketbase.exe');
  const pbDir = path.join(__dirname, '../src/backend/pocketbase');
  
  if (!fs.existsSync(pbPath)) {
    console.error('❌ PocketBase executable not found at:', pbPath);
    console.log('Please ensure PocketBase is installed in src/backend/pocketbase/');
    process.exit(1);
  }

  const pbProcess = spawn(pbPath, ['serve'], {
    cwd: pbDir,
    stdio: 'inherit'
  });

  pbProcess.on('error', (error) => {
    console.error('❌ Failed to start PocketBase:', error);
    process.exit(1);
  });

  pbProcess.on('close', (code) => {
    console.log(`PocketBase process exited with code ${code}`);
  });

  // Wait for PocketBase to start
  console.log('⏳ Waiting for PocketBase to start...');
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isHealthy = await checkPocketBaseHealth();
    
    if (isHealthy) {
      console.log('✅ PocketBase is running successfully!');
      console.log('📊 Admin UI: http://127.0.0.1:8090/_/');
      console.log('🔌 API: http://127.0.0.1:8090/api/');
      return;
    }
    
    attempts++;
  }
  
  console.error('❌ PocketBase failed to start within 30 seconds');
  process.exit(1);
}

if (require.main === module) {
  startPocketBase().catch(console.error);
}

module.exports = { startPocketBase, checkPocketBaseHealth };
