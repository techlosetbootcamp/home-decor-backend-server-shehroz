import { Resolver, Mutation, Arg } from "type-graphql";
import prisma from "../../config/prisma";
import bcrypt from "bcryptjs";
import { User } from "../../generated/typegraphql";
import { generateToken, sendOtp, verifyOtp } from "../../utils/authUtils";
import { RegisterUserInput, userPayload } from "../../types/types";
import { GraphQLError } from "graphql";

@Resolver(User)
export class UserResolver {
  @Mutation(() => User)
  async register(@Arg("userData") userData: RegisterUserInput): Promise<User> {
    const userExists = await prisma.user.findUnique({
      where: { email: userData?.email },
    });
    if (userExists)
      throw new GraphQLError("Email already in use", {
        extensions: { code: "EMAIL_TAKEN" },
      });

    const hashedPassword = await bcrypt.hash(userData?.password, 10);
    const otp = await sendOtp(userData?.email);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        otp,
        otpExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
        isVerified: false,
      },
    });

    return user;
  }

  @Mutation(() => String)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("otp", { nullable: true }) otp?: string
  ): Promise<string> {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      throw new GraphQLError("User not found.", {
        extensions: { code: "USER_NOT_FOUND" },
      });

    if (!user?.isVerified && !otp) {
      await sendOtp(email);
      throw new GraphQLError("Email not verified. OTP sent to your email.", {
        extensions: { code: "EMAIL_NOT_VERIFIED" },
      });
    }

    if (otp) {
      await verifyOtp(otp, user?.otp, user?.otpExpiresAt);
      await prisma.user.update({
        where: { id: user?.id },
        data: { isVerified: true },
      });
    }

    const validPassword = await bcrypt.compare(password, user?.password);
    if (!validPassword)
      throw new GraphQLError("Invalid credentials.", {
        extensions: { code: "INVALID_CREDENTIALS" },
      });

    let loggedInUser: userPayload = {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      address: user?.address,
      isVerified: user?.isVerified,
    };

    return generateToken(loggedInUser);
  }

  @Mutation(() => User, { nullable: true })
  async deleteUserByEmail(@Arg("email") email: string): Promise<User | null> {
    try {
      const user = await prisma.user.delete({
        where: {
          email,
        },
      });
      return user;
    } catch (err) {
      throw new GraphQLError("User not found or unable to delete.", {
        extensions: { code: "USER_NOT_FOUND" },
      });
    }
  }

  @Mutation(() => Boolean)
  async resendOtp(@Arg("email") email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user?.isVerified)
      throw new GraphQLError("User not found or already verified.", {
        extensions: { code: "USER_ERROR" },
      });

    const otp = await sendOtp(email);
    await prisma.user.update({
      where: { id: user?.id },
      data: {
        otp,
        otpExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    return true;
  }
}
