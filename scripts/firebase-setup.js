#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup Script');
console.log('========================\n');

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    require('child_process').execSync('firebase --version', { stdio: 'ignore' });
    console.log('✅ Firebase CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Firebase CLI is not installed');
    console.log('📦 Install it with: npm install -g firebase-tools');
    return false;
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env.local file not found');
    
    if (fs.existsSync(envExamplePath)) {
      console.log('📋 Copying .env.example to .env.local');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env.local file');
      console.log('🔧 Please update the Firebase configuration values in .env.local');
    } else {
      console.log('❌ .env.example file not found');
    }
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(`${varName}=`) || 
    envContent.includes(`${varName}=your_`) ||
    envContent.includes(`${varName}=`)
  );
  
  if (missingVars.length > 0) {
    console.log('❌ Missing or incomplete Firebase environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n🔧 Please update these values in .env.local with your Firebase project configuration');
    return false;
  }
  
  console.log('✅ All Firebase environment variables are configured');
  return true;
}

// Check Firebase configuration files
function checkFirebaseConfig() {
  const configFiles = [
    'firebase.json',
    'firestore.rules',
    'storage.rules',
    'firestore.indexes.json'
  ];
  
  let allPresent = true;
  
  configFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} is missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Main setup function
function runSetup() {
  console.log('🔍 Checking Firebase setup...\n');
  
  const cliInstalled = checkFirebaseCLI();
  const envConfigured = checkEnvironmentVariables();
  const configFilesPresent = checkFirebaseConfig();
  
  console.log('\n📋 Setup Summary:');
  console.log('==================');
  console.log(`Firebase CLI: ${cliInstalled ? '✅' : '❌'}`);
  console.log(`Environment Variables: ${envConfigured ? '✅' : '❌'}`);
  console.log(`Configuration Files: ${configFilesPresent ? '✅' : '❌'}`);
  
  if (cliInstalled && envConfigured && configFilesPresent) {
    console.log('\n🎉 Firebase setup is complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: firebase login');
    console.log('2. Run: firebase init (if not already initialized)');
    console.log('3. Deploy security rules: firebase deploy --only firestore:rules,storage');
    console.log('4. Deploy indexes: firebase deploy --only firestore:indexes');
    console.log('5. Start development: npm run dev');
  } else {
    console.log('\n⚠️  Setup incomplete. Please address the issues above.');
  }
  
  console.log('\n🔗 Useful commands:');
  console.log('- Start emulators: firebase emulators:start');
  console.log('- Deploy rules: firebase deploy --only firestore:rules,storage');
  console.log('- Deploy indexes: firebase deploy --only firestore:indexes');
  console.log('- View console: https://console.firebase.google.com/');
}

// Run the setup
runSetup();