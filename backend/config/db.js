import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DB_DIR = path.join(__dirname, '..', 'data');

export let isLocalFallback = false;

// Simple file-based database for fallback
export const localDb = {
  readCollection: (name) => {
    const filePath = path.join(LOCAL_DB_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error reading local collection ${name}:`, e);
      return [];
    }
  },
  writeCollection: (name, data) => {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
    const filePath = path.join(LOCAL_DB_DIR, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ink_and_echoes';
  
  try {
    // Set connection timeout to 3 seconds for quick fallback detection
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✨ MongoDB Connected successfully.');
    isLocalFallback = false;
  } catch (error) {
    console.warn('⚠️  MongoDB Connection Failed:', error.message);
    console.warn('📁 Falling back to local JSON file-based database in "backend/data/*.json".');
    isLocalFallback = true;
    
    // Ensure local directory exists
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
  }
};
