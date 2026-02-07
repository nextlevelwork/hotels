import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function generateVerificationToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const token = randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + VERIFICATION_TTL_MS),
    },
  });

  return token;
}

export async function generatePasswordResetToken(email: string): Promise<string> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const token = randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });

  return token;
}

/**
 * Verify and consume a token. Returns true if valid, false otherwise.
 * The token is deleted after successful verification (one-time use).
 */
export async function verifyToken(email: string, token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: { identifier: email, token },
    },
  });

  if (!record) return false;
  if (record.expires < new Date()) {
    // Expired — clean up
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
    return false;
  }

  // Consume the token
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });

  return true;
}
