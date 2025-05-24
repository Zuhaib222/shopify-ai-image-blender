const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { prompt, image1, image2 } = req.body;

  try {
    const response = await openai.images.edit({
      prompt,
      image: image1, // this needs to be a File or URL, depending on API used
      mask: image2,
      n: 1,
      size: "512x512"
    });

    const imageUrl = response.data.data[0].url;
    res.status(200).json({ result: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
