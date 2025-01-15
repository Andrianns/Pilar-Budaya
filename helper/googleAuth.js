require('dotenv').config();
const { google } = require('googleapis');
const { Readable } = require('stream');

const SCOPE = process.env.SCOPE;
const authenticateGoogle = async () => {
  const JWTClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    SCOPE
  );

  await JWTClient.authorize();
  return JWTClient;
};

const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {}; // No-op _read
  readable.push(buffer);
  readable.push(null); // Menandakan akhir stream
  return readable;
};

const ensureParentFolderExists = async (
  drive,
  folderName = 'Bukti Pembayaran'
) => {
  const response = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: 'files(id, name)',
  });

  // Jika folder ditemukan, return ID-nya
  if (response.data.files.length > 0) {
    return response.data.files[0].id;
  }

  throw { name: 'Folder Not Found' };
};
module.exports = {
  authenticateGoogle,
  bufferToStream,
  ensureParentFolderExists,
};
// const uploadToGoogleDrive = async (req) => {
//   upload(req, res, async (err) => {
//     const drive = google.drive({
//       version: 'v3',
//       auth: await authenticateGoogle(req),
//     });

//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // const filePath = req.file.path; // Path to the uploaded file
//     // const mimeType = mime.lookup(filePath); // Get MIME type dynamically

//     const fileMetadata = {
//       name: req.file.originalname,
//       parents: ['18r2Wl8jcvPJH2mxV67N9ZgfiRSxcvF2H'],
//     };

//     const media = {
//       mimeType: req.file.mimetype,
//       body: bufferToStream(req.file.buffer),
//     };

//     const response = await drive.files.create({
//       requestBody: fileMetadata, // Changed from "resource" to "requestBody"
//       media,
//       fields: 'id', // Get only the file ID in the response
//     });
//     // Return the file ID
//     return response;
//   });
// };

// const generateTokenService = async (req, res) => {
//   try {
//     const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

//     const authUrl = oAuth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: SCOPES,
//     });

//     res.json({ url: authUrl });
//   } catch (error) {
//     console.error('Error in generateTokenService:', error.message);
//     res
//       .status(500)
//       .json({ message: 'An error occurred', error: error.message });
//   }
// };

// const setCode = async (req, res) => {
//   const code = req.query.code; // Baca authorization code dari query parameter
//   if (!code) {
//     return res.status(400).send('Authorization code not found');
//   }
//   try {
//     // Tukar authorization code dengan token
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Simpan token di file atau database
//     fs.writeFileSync('token.json', JSON.stringify(tokens));
//     console.log('Token stored to token.json');

//     res.json({
//       message: 'Token generated successfully',
//       tokens,
//     });
//   } catch (error) {
//     console.error('Error exchanging code for token:', error.message);
//     res.status(500).send('Failed to exchange code for token');
//   }
// };
// const oAuth2Client = new google.auth.OAuth2(
//   cred.web.client_id,
//   cred.web.client_secret,
//   cred.web.redirect_uris[0]
// );
// const authenticateGoogle = async (req) => {
//   const authHeader = req.headers['authorization']; // Ambil token dari header

//   if (!authHeader) {
//     throw new Error(
//       'No authorization token provided. Ensure you pass a token in the Authorization header.'
//     );
//   }
//   try {
//     const token = authHeader.startsWith('Bearer ')
//       ? authHeader.split(' ')[1]
//       : authHeader;

//     oAuth2Client.setCredentials({
//       access_token: token, // Langsung set token tanpa JSON.parse
//     });
//     return oAuth2Client;
//   } catch (error) {
//     throw new Error('Invalid token provided');
//   }
// };
