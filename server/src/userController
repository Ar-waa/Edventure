import User from "../models/User.js";

export async function getProfile(req, res) {
  const user = await User.findById(req.params.userId);
  res.json(user);
}

export async function updateProfile(req, res) {
  await User.findByIdAndUpdate(req.params.userId, req.body);
  res.json({ success: true });
}
