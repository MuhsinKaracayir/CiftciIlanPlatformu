import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export class AuthService {
  constructor(userRepository, jwtConfig = {}) {
    if (!userRepository) {
      throw new Error('AuthService icin userRepository bagimliligi zorunludur.');
    }
    this.userRepository = userRepository;
    this.jwtSecret = jwtConfig.secret || 'default_jwt_secret';
    this.jwtExpiresIn = jwtConfig.expiresIn || '7d';
  }

  #formatSafeUser(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  #generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      this.jwtSecret,
      {
        expiresIn: this.jwtExpiresIn,
      }
    );
  }

  async register({ fullName, email, password, phone = null }) {
    const trimmedEmail = email.toLowerCase().trim();
    const isEmailTaken = await this.userRepository.existsByEmail(trimmedEmail);

    if (isEmailTaken) {
      throw AppError.conflict('Bu e-posta adresi ile zaten kayitli bir hesap bulunmaktadir.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const createdUser = await this.userRepository.create({
      fullName: fullName.trim(),
      email: trimmedEmail,
      passwordHash,
      phone,
      role: 'user',
    });

    const token = this.#generateToken(createdUser);

    return {
      user: this.#formatSafeUser(createdUser),
      token,
    };
  }

  async login({ email, password }) {
    const trimmedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(trimmedEmail);

    if (!user) {
      throw AppError.unauthorized('Gecersiz e-posta adresi veya sifre.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw AppError.unauthorized('Gecersiz e-posta adresi veya sifre.');
    }

    const token = this.#generateToken(user);

    return {
      user: this.#formatSafeUser(user),
      token,
    };
  }

  async getMe(userId) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw AppError.notFound('Kullanici hesabi bulunamadi.');
    }

    return this.#formatSafeUser(user);
  }
}

