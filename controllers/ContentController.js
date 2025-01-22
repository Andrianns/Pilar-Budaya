const upload = require('../helper/upload');
const { Content } = require('../models');
const { shareFile } = require('../helper/util');

const {
  authenticateGoogle,
  bufferToStream,
  ensureParentFolderExists,
} = require('../helper/googleAuth');
const { google } = require('googleapis');

const { where } = require('sequelize');

class ContentController {
  static async postContent(req, res, next) {
    upload(req, res, async (err) => {
      try {
        const { contentName, page, caption } = req.body;

        const drive = google.drive({
          version: 'v3',
          auth: await authenticateGoogle(),
        });

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // page '1' = Pelatih
        // page '2' = Galery Sanggar
        const folderName = page === '1' ? 'Pelatih' : 'Galery Sanggar';

        const folderId = await ensureParentFolderExists(drive, folderName);

        const fileMetadata = {
          name: req.file.originalname,
          parents: [folderId],
        };

        const media = {
          mimeType: req.file.mimetype,
          body: bufferToStream(req.file.buffer),
        };

        const response = await drive.files.create({
          requestBody: fileMetadata,
          media,
          fields: 'id',
        });
        const imgUrl = await shareFile(drive, response.data.id);
        const content = await Content.create({
          contentName: contentName,
          imageUrl: imgUrl,
          caption: caption,
          page: page,
        });
        res.status(201).json({
          message: 'success post content',
          data: content,
        });
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    });
  }

  static async getContentPelatih(req, res, next) {
    try {
      const content = await Content.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        where: {
          page: '1',
        },
      });
      if (!content) {
        throw { name: 'Content not found' };
      }
      res.status(200).json({ content: content });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  static async getContentGallery(req, res, next) {
    try {
      const content = await Content.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
        where: {
          page: '2',
        },
      });
      if (!content) {
        throw { name: 'Content not found' };
      }
      res.status(200).json({ content: content });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  static async getAllContent(req, res, next) {
    try {
      const content = await Content.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      });
      if (!content) {
        throw { name: 'Content not found' };
      }
      res.status(200).json({ content: content });
    } catch (error) {
      res.status(400).json({ error: error.message });
      // console.log(error);
      // next(error);
    }
  }
  static async updateContent(req, res, next) {
    try {
      const { id } = req.params;
      const { contentName, caption } = req.body;

      const content = await Content.findByPk(id);

      if (!content) {
        throw { name: 'Content not found' };
      }

      content.contentName = contentName;
      content.caption = caption;

      await content.save();

      res.status(200).json({ content: content });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
      next(error);
    }
  }
  static async deleteContent(req, res, next) {
    try {
      const { id } = req.params;

      const content = await Content.findByPk(id);
      if (!content) {
        throw { name: 'Content not found' };
      }
      await content.destroy();

      res
        .status(200)
        .json({ message: 'Content has been deleted', data: content });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
      next(error);
    }
  }
}

module.exports = ContentController;
