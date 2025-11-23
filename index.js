import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import linkRoutes from "./routes/links.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT 
// || 5001

app.use(
  cors({
    origin: process.env.CLIENT_URL 
    // || "http://localhost:5173"
    ,
    credentials: true,
  }),
)
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI 
    // || "mongodb://localhost:27017/tinyurl"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Routes
app.use("/api/links", linkRoutes)

app.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" })
})

// Redirect handler - must be last
app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params
    const Link = mongoose.model("Link")
    const link = await Link.findOne({ code })

    if (!link) {
      return res.status(404).json({ error: "Link not found" })
    }

    // Increment click count and update last clicked
    link.clicks += 1
    link.lastClicked = new Date()
    await link.save()

    res.redirect(302, link.url)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
