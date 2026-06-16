const fs = require('fs');
const cloudinary = require('../config/cloudinary');

async function uploadToCloudinary(filePath, folder = 'learnloop/resources') {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto'
  });

  fs.unlink(filePath, () => {});
  return result;
}

function inferFileType(mimetype, explicitType) {
  if (explicitType === 'link') return 'link';
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'ppt';
  if (mimetype.includes('word')) return 'doc';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return explicitType || 'doc';
}

module.exports = { uploadToCloudinary, inferFileType };
