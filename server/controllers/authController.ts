import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findByemail } from '../models/userModel.ts';
import asyncHandler from '../utils/asyncHandler.ts';

export const register = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
     const { name, email, password } = req.body;
     const normalizedEmail = email.trim().toLowerCase();

     // Check if all info is filled
     if (!name || !email || !password) {
          return res.status(400).json({ message: 'Please fill all required fields.' });
     }

     // Email validation: letters, numbers, some specials, ending with @gmail.com
     const emailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
     if (!emailRegex.test(normalizedEmail)) {
          return res.status(400).json({ message: 'Email must be a valid @gmail.com address (letters, numbers, and allowed special characters only).' });
     }

     // Password validation: at least 8 chars, 1 uppercase, 1 number, 1 special char
     const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\\-])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\\-]{8,}$/;
     if (!passwordRegex.test(password)) {
          return res.status(400).json({ 
               message: 'Password must be at least 8 characters long and include: one uppercase letter, one number, and one special character.' 
          });
     }

     // Check if email is already used
     const userExist = await findByemail(normalizedEmail);
     if (userExist) {
          return res.status(400).json({ message: 'An account with this email already exists.' });
     }

     // Hash password
     const saltRounds = 10;
     const hash = await bcrypt.hash(password, saltRounds);

     // Create user account — createUser returns a single row object
     const newUser = await createUser(name, email, hash);

     // Create JWT token
     const token = jwt.sign(
          { id: newUser.id, email: newUser.email },
          process.env.JWT_SECRET as string,
          { expiresIn: '7d' }
     );

     const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

     const cookieOptions = {
          httpOnly: true,
          secure: true, // Always true for cross-site cookies
          sameSite: 'none' as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
     };
     console.log('Setting cookie with options:', cookieOptions);
     res.cookie('token', token, cookieOptions);
     console.log('REGISTER: Cookie set for user:', newUser.email);

     return res.status(201).json({
          message: "user registration successful",
          user: { id: newUser.id, email: newUser.email, name: newUser.username },
     });
});


export const login = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
     const { email, password } = req.body;
     const normalizedEmail = email.trim().toLowerCase();

     // Check if all info is filled
     if (!email || !password) {
          return res.status(400).json({ message: 'Please fill all required fields.' });
     }

     // Check if user exists
     const userExist = await findByemail(normalizedEmail);
     if (!userExist) {
          return res.status(401).json({ message: 'Invalid email or password.' });
     }

     // Compare password hash
     const isMatch = await bcrypt.compare(password, userExist.password_hash);
     if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password.' });
     }

     // Create JWT token
     const token = jwt.sign(
          { id: userExist.id, email: userExist.email },
          process.env.JWT_SECRET as string,
          { expiresIn: '7d' }
     );

     const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

     const cookieOptions = {
          httpOnly: true,
          secure: true, // Always true for cross-site cookies
          sameSite: 'none' as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
     };
     console.log('Setting cookie with options:', cookieOptions);
     res.cookie('token', token, cookieOptions);

     return res.status(200).json({
          message: "login successful",
          user: { id: userExist.id, email: userExist.email, name: userExist.username },
     });
});

export const logout = asyncHandler(async (req: any, res: any) => {
     res.clearCookie('token', {
          httpOnly: true,
          secure: true,
          sameSite: 'none'
     });
     res.status(200).json({ message: 'Logged out successfully' });
});
