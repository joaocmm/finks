import express from 'express';
import { validate } from '../middleware/validate.js';
import { RegisterSchema, LoginSchema } from '../models/schemas.js';
import { createUser, login, issueToken } from '../services/userService.js';

export const router = express.Router();

router.post('/register', validate(RegisterSchema), async (req, res) => {
  try {
    const user = await createUser(req.body);
    const token = issueToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', validate(LoginSchema), async (req, res) => {
  try {
    const user = await login(req.body);
    const token = issueToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});
