const Note = require("../models/Note");
const { events } = require("../events");

exports.create = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "title and content are required" });
    const note = await Note.create({ title, content, owner: req.user._id });
    events.emit("noteCreated", note);
    res.status(201).json({ message: "Note created", note });
  } catch (err) { next(err); }
};
exports.list = async (req, res, next) => {
  try { res.json(await Note.find({ owner: req.user._id }).sort({ createdAt: -1 })); }
  catch (err) { next(err); }
};
exports.get = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { title: req.body.title, content: req.body.content } },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note updated", note });
  } catch (err) { next(err); }
};
exports.remove = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted", id: note._id });
  } catch (err) { next(err); }
};
