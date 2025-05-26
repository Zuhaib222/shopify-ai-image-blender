const OpenAI = require("openai");
const formidable = require("formidable");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    console.log("Fields:", fields);
    console.log("Files:", files);

    try {
      const prompt = fields.prompt;

      if (!files.image || !files.mask) {
        return res.status(400).json({ error: "Image and mask files are required" });
      }

      const imagePath = files.image.filepath;
      const maskPath = files.mask.filepath;

      if (!imagePath || !maskPath) {
        return res.status(400).json({ error: "File paths are missing" });
      }

      const image = fs.createReadStream(imagePath);
      const mask = fs.createReadStream(maskPath);

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
