import mongoose from "mongoose"

const linkSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Za-z0-9]{6,8}$/,
  },
  url: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastClicked: {
    type: Date,
    default: null,
  },
})

export default mongoose.model("Link", linkSchema)
