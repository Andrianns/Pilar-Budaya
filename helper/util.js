const zlib = require('zlib');
const crypto = require('crypto');

// Kompresi Buffer Sebelum Encoding
const compressAndEncodeBase64 = (buffer) => {
  const compressedBuffer = zlib.brotliCompressSync(buffer); // Kompres data
  return compressedBuffer.toString('base64'); // Encode ke Base64
};

// Dekompresi dan Decode Base64
const decodeAndDecompressBase64 = (base64String) => {
  const compressedBuffer = Buffer.from(base64String, 'base64'); // Decode Base64
  return zlib.brotliDecompressSync(compressedBuffer); // Dekompresi
};

const shareFile = async (drive, fileId) => {
  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone', // Memberikan akses publik
      },
    });

    // URL publik untuk file
    return `https://drive.google.com/file/d/${fileId}/view`;
  } catch (error) {
    console.error('Error sharing file:', error.message);
    throw error;
  }
};

// Generate Hash MD5
const generateHash = (buffer) => {
  return crypto.createHash('md5').update(buffer).digest('hex');
};
module.exports = {
  shareFile,
  compressAndEncodeBase64,
  decodeAndDecompressBase64,
  generateHash,
};
