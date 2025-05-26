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

  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const prompt = fields.prompt;
      const imageFile = files.image;
      const maskFile = files.mask;

      if (!imageFile || !maskFile) {
        return res.status(400).json({ error: "Image and mask files are required" });
      }

      const image = fs.createReadStream(imageFile[0]?.filepath || imageFile.filepath);
      const mask = fs.createReadStream(maskFile[0]?.filepath || maskFile.filepath);

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
