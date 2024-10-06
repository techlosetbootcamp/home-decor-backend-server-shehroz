import { Resolver, Mutation, Arg } from "type-graphql";
import bcrypt from "bcryptjs";
import { User } from "../../generated/typegraphql";
import { sendOtp, verifyOtp } from "../../utils/authUtils";
import prisma from "../../config/prisma";
import { GraphQLError } from "graphql";

@Resolver(User)
export class PasswordResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new GraphQLError("User not found.", {
        extensions: { code: "USER_NOT_FOUND" },
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

  @Mutation(() => Boolean)
  async resetPassword(
    @Arg("email") email: string,
    @Arg("otp") otp: string,
    @Arg("newPassword") newPassword: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new GraphQLError("User not found.", {
        extensions: { code: "USER_NOT_FOUND" },
      });

    await verifyOtp(otp, user?.otp, user?.otpExpiresAt);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user?.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return true;
  }
}
