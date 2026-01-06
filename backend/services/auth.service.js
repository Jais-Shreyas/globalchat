import jwt from 'jsonwebtoken';

export const handleUserDataSend = async (res, user) => {
  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL
    },
    token
  });
};
