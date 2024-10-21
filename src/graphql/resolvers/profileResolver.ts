import { Resolver, Mutation, Arg, UseMiddleware } from "type-graphql";
import bcrypt from "bcryptjs";
import { User } from "../../generated/typegraphql";
import { UpdateUserInput } from "../../types/types";
import prisma from "../../config/prisma";
import { isAuthenticated } from "../../utils/authMiddleware";
import { GraphQLError } from "graphql";

@Resolver(User)
export class ProfileResolver {
  @Mutation(() => User)
  @UseMiddleware(isAuthenticated)
  async updateProfile(
    @Arg("email") email: string,
    @Arg("userData") userData: UpdateUserInput,
    @Arg("oldPassword", { nullable: true }) oldPassword?: string
  ): Promise<User> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      throw new GraphQLError("User not found.", {
        extensions: { code: "USER_NOT_FOUND" },
      });

    let hashedPassword: string | undefined;

    if (userData?.password) {
      if (!oldPassword) {
        throw new GraphQLError(
          "Old password is required to change the password.",
          {
            extensions: { code: "OLD_PASSWORD_REQUIRED" },
          }
        );
      }

      const validOldPassword = await bcrypt.compare(
        oldPassword,
        user?.password
      );

      if (!validOldPassword) {
        throw new GraphQLError("Old password is incorrect!", {
          extensions: { code: "INVALID_OLD_PASSWORD" },
        });
      }

      hashedPassword = await bcrypt.hash(userData?.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name: userData?.name ?? user?.name,
        phone: userData?.phone ?? user?.phone,
        address: userData?.address ?? user?.address,
        password: hashedPassword ?? user?.password,
      },
    });

    return updatedUser;
  }
}
