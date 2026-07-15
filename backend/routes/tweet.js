import express from "express";
import Tweet from "../modals/Tweet.js";

const router = express.Router();

/* 🔑 Keywords */
const KEYWORDS = ["cricket", "science"];

/* 📝 CREATE TWEET */
router.post("/post", async (req, res) => {
  try {
    const {
      author,
      content,
      image,
      audioUrl,
      audioDuration,
    } = req.body;

    if (!author || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔍 keyword detection
    const hasKeyword = KEYWORDS.some((k) =>
      content.toLowerCase().includes(k)
    );

    const tweet = await Tweet.create({
      author,
      content,
      image: image || null,

      // audio support
      audioUrl: audioUrl || null,
      audioDuration: audioDuration || null,
      isAudioTweet: !!audioUrl,

      hasKeyword,
    });

    res.status(201).json(tweet);
  } catch (error) {
    console.error("Create tweet error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* 🔊 CREATE AUDIO TWEET */
router.post("/post-audio", async (req, res) => {
  try {
    const { author, audioUrl, audioDuration } = req.body;

    if (!author || !audioUrl) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ⏰ TIME RESTRICTION (IST)
    const now = new Date();
    const hoursIST = (now.getUTCHours() + 5.5) % 24;

    if (hoursIST < 14 || hoursIST >= 19) {
      return res.status(403).json({
        error: "Audio tweets allowed only between 2PM and 7PM IST",
      });
    }

    if (audioDuration > 300) {
      return res.status(400).json({
        error: "Audio exceeds 5 minutes",
      });
    }

    const tweet = await Tweet.create({
      author,
      audioUrl,
      audioDuration,
      isAudioTweet: true,
    });

    res.json(tweet);
  } catch (error) {
    console.error("Create audio tweet error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;