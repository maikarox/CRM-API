import { RequestHandler } from 'express';

import { createAccessToken } from '../services/Auth.service';
import { getUser } from '../services/User.service';

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUser(email, password);

  if (!user) {
    return res.status(401).json({ message: 'Wrong email or password' });
  }

  if (user.deletedAt) {
    return res.status(401).json({ message: 'Your account has been disabled.' });
  }

  try {
    const { accessToken, accessTokenExpiresOn: expiresIn } =
      await createAccessToken(user);
    return res.json({
      accessToken,
      expiresIn,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error getting access token.' });
  }
};
