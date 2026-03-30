const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const KEY_PATH = path.join(__dirname, '..', 'service-account.json');
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Upload a file to Google Drive.
 * @param {Object} file - The multer file object.
 * @returns {Promise<{url: string, fileId: string}>}
 */
async function uploadToDrive(file) {
  try {
    const fileMetadata = {
      name: file.originalname,
      parents: [FOLDER_ID],
    };
    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Make file publicly viewable via link
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      url: response.data.webViewLink,
      fileId: response.data.id,
    };
  } catch (error) {
    console.error('Drive Upload Error:', error.message);
    throw error;
  } finally {
    // Always clean up the temp file
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (_) { /* ignore cleanup errors */ }
  }
}

/**
 * Delete a file from Google Drive.
 * @param {string} fileId - The Drive file ID.
 */
async function deleteFromDrive(fileId) {
  if (!fileId) return;
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    // 404 means file was already deleted — that's fine
    if (error.code !== 404) {
      console.error('Drive Delete Error:', error.message);
      throw error;
    }
  }
}

module.exports = { uploadToDrive, deleteFromDrive };
