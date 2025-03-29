import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// Generate a key for encryption (store this securely in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-byte-key-here"; // Must be 32 bytes for AES-256
const key = scryptSync(ENCRYPTION_KEY, "salt", 32); // Derive a 32-byte key
const ALGORITHM = "aes-256-cbc";

// Encrypt a token
export function encryptToken(token: string): { iv: string; encrypted: string } {
  const iv = randomBytes(16); // Generate a random initialization vector
  const cipher = createCipheriv(ALGORITHM, key, iv); // Create a cipher instance
  let encrypted = cipher.update(token, "utf8", "hex");  // Encrypt the token
  encrypted += cipher.final("hex"); 
  return {
    iv: iv.toString("hex"),
    encrypted,
  };
}

// Decrypt a token
export function decryptToken(iv: string, encrypted: string): string {
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}