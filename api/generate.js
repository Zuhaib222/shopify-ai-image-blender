const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: err.message });
    }

    try {
      const prompt = fields.prompt;
      const imageFile = files.image;
      const maskFile = files.mask;

      if (!imageFile || !maskFile) {
        return res.status(400).json({ error: "Both image and mask files are required." });
      }

      // Validate file extension instead of MIME type
      const imageExt = path.extname(imageFile.originalFilename).toLowerCase();
      const maskExt = path.extname(maskFile.originalFilename).toLowerCase();

      if (imageExt !== '.png' || maskExt !== '.png') {
        return res.status(400).json({ error: "Only PNG images are supported." });
      }

      const image = fs.createReadStream(imageFile.filepath);
      const mask = fs.createReadStream(maskFile.filepath);

      const response = await openai.images.edit({
        image,
        mask,
        prompt,
        n: 1,
        size: "512x512",
      });

      const imageUrl = response.data[0].url;
      res.status(200).json({ result: imageUrl });

    } catch (error) {
      console.error("OpenAI error:", error);
      res.status(500).json({ error: error.message });
    }
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};
