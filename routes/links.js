import express from "express"
import Link from "../models/Link.js"

const router = express.Router()

// Helper: Generate random code
const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let code = ""
  const length = Math.floor(Math.random() * 3) + 6 // 6-8 chars
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Helper: Validate URL
const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// GET all links
router.get("/", async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 })
    res.json(
      links.map((link) => ({
        code: link.code,
        url: link.url,
        clicks: link.clicks,
        createdAt: link.createdAt,
        lastClicked: link.lastClicked,
      })),
    )
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// GET single link stats
router.get("/:code", async (req, res) => {
  try {
    const link = await Link.findOne({ code: req.params.code })
    if (!link) {
      return res.status(404).json({ error: "Link not found" })
    }
    res.json({
      code: link.code,
      url: link.url,
      clicks: link.clicks,
      createdAt: link.createdAt,
      lastClicked: link.lastClicked,
    })
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

// POST create link
router.post("/", async (req, res) => {
  try {
    const { url, code: customCode } = req.body

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL" })
    }

    const code = customCode || generateCode()

    // Validate code format
    if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
      return res.status(400).json({ error: "Code must be 6-8 alphanumeric characters" })
    }

    // Check if code exists
    const existingLink = await Link.findOne({ code })
    if (existingLink) {
      return res.status(409).json({ error: "Code already exists" })
    }

    const newLink = new Link({ code, url })
    await newLink.save()
    res.status(201).json({
      code: newLink.code,
      url: newLink.url,
      clicks: newLink.clicks,
      createdAt: newLink.createdAt,
      lastClicked: newLink.lastClicked,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// DELETE link
router.delete("/:code", async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ code: req.params.code })
    if (!link) {
      return res.status(404).json({ error: "Link not found" })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

export default router
