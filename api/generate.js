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
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Form parsing error" });
    }

    // Defensive checks for missing fields/files
    const prompt = fields?.prompt;
    const imageFile = files?.image?.[0] || files?.image;
    const maskFile = files?.mask?.[0] || files?.mask;

    if (!prompt || !imageFile || !maskFile) {
      return res.status(400).json({
        error: "Missing prompt, image, or mask",
      });
    }

    try {
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
      res.status(500).json({ error: error.message || "Something went wrong" });
    }
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};
