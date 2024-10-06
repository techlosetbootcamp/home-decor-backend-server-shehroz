import { sign } from "jsonwebtoken";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "./emailUtils";
import { GraphQLError } from "graphql";
import { userPayload } from "../types/types";

export const sendOtp = async (email: string): Promise<string> => {
  const otp = randomBytes(3).toString("hex");
  await sendVerificationEmail(email, otp);
  return otp;
};

export const verifyOtp = async (
  otp: string,
  userOtp: string | null,
  otpExpiresAt: Date | null
): Promise<void> => {
  if (!userOtp || !otpExpiresAt || new Date() > otpExpiresAt) {
    throw new GraphQLError("OTP expired or not found", {
      extensions: { code: "EXPIRED_OTP" },
    });
  }
  if (otp !== userOtp) {
    throw new GraphQLError("Invalid OTP", {
      extensions: { code: "INVALID_OTP" },
    });
  }
};

export const generateToken = (user: userPayload): string => {
  return sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );
};
