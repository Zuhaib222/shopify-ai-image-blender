const { Configuration, OpenAIApi } = require("openai");
const formidable = require("formidable");
const fs = require("fs");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const prompt = fields.prompt;
      const image = fs.createReadStream(files.image.filepath);
      const mask = fs.createReadStream(files.mask.filepath);

      const response = await openai.createImageEdit(
        image,
        mask,
        prompt,
        1,
        "512x512"
      );

      const imageUrl = response.data.data[0].url;
      res.status(200).json({ result: imageUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// ✅ Use CommonJS syntax here:
module.exports.config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};
