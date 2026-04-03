const User = require('../models/User');
const Analysis = require('../models/Analysis');

exports.getProfile = async (req, res) => {
  const user = req.user;
  const totalAnalyses = await Analysis.countDocuments({ userId: user._id });

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    age: user.age,
    skinType: user.skinType,
    quizCompleted: user.quizCompleted,
    role: user.role,
    createdAt: user.createdAt,
    totalAnalyses
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, age } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, age },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Profile updated!', user: { name: user.name, age: user.age } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};
