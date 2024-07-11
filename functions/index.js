const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.generateSignedUrl = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { filePath } = req.body;

      if (!filePath) {
        return res.status(400).send({ error: 'File path is required' });
      }

      const bucket = admin.storage().bucket();
      const file = bucket.file(filePath);
      const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      };

      const [url] = await file.getSignedUrl(options);
      res.status(200).send({ signedUrl: url });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      res.status(500).send({ error: error.message });
    }
  });
});

