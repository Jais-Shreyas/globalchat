import jwt from 'jsonwebtoken';

export const handleUserDataSend = async (res, user) => {
  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL
    }
  });
};
