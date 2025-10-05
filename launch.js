const fs = require('fs');
const { exec } = require('child_process');

console.log('🚀 Starting sARA2 Application...');

// Create .env file
const envContent = `DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=sara2-super-secret-jwt-key-2024
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file created');

// Generate Prisma client
console.log('📦 Generating Prisma client...');
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Prisma generate error:', error);
    return;
  }
  console.log('✅ Prisma client generated');

  // Push database schema
  console.log('🗄️ Pushing database schema...');
  exec('npx prisma db push', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Database push error:', error);
      return;
    }
    console.log('✅ Database schema pushed');

    // Start server
    console.log('🌐 Starting server on port 5000...');
    const serverProcess = exec('node server.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Server error:', error);
      }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log('Server:', data.toString());
    });

    // Start client after 3 seconds
    setTimeout(() => {
      console.log('⚛️ Starting React client...');
      exec('cd client && npm start', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Client error:', error);
        }
      });
    }, 3000);

    // Open browser after 8 seconds
    setTimeout(() => {
      console.log('🌍 Opening browser...');
      exec('start http://localhost:3000', (error) => {
        if (error) {
          console.log('Please open http://localhost:3000 manually');
        }
      });
    }, 8000);

    console.log('🎉 Application launched!');
    console.log('Server: http://localhost:5000');
    console.log('Client: http://localhost:3000');
  });
});

