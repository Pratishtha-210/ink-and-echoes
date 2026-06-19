import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Fallback key if environment variable is not defined (for local dev resilience)
const SECRET = process.env.JOURNAL_ENCRYPTION_KEY || 'default_secret_key_for_ink_and_echoes_journal';

// Derive a 32-byte key from the secret using SHA-256
const getEncryptionKey = () => {
  return crypto.createHash('sha256').update(SECRET).digest();
};

/**
 * Encrypts plain text using AES-256-GCM
 * @param {string} text - The raw text to encrypt
 * @returns {object} { encryptedData, iv, authTag }
 */
export const encrypt = (text) => {
  if (!text) return { encryptedData: '', iv: '', authTag: '' };
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 12-byte IV is standard and highly secure for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
};

/**
 * Decrypts hex encoded ciphertext using AES-256-GCM
 * @param {string} encryptedData - Hex encoded cipher text
 * @param {string} iv - Hex encoded IV
 * @param {string} authTag - Hex encoded Authentication Tag
 * @returns {string} - Decrypted plaintext
 */
export const decrypt = (encryptedData, iv, authTag) => {
  if (!encryptedData || !iv || !authTag) return '';
  
  try {
    const key = getEncryptionKey();
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw new Error('Failed to decrypt journal entry. Critical integrity check failed.');
  }
};
