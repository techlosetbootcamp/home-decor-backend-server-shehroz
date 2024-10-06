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
    @Arg("userData") userData: UpdateUserInput
  ): Promise<User> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      throw new GraphQLError("User not found.", {
        extensions: { code: "USER_NOT_FOUND" },
      });

    let hashedPassword: string | undefined;

    if (userData?.password) {
      const validPassword = await bcrypt.compare(
        userData?.password,
        user?.password
      );

      if (!validPassword) {
        throw new GraphQLError("Error! Password does not match!", {
          extensions: { code: "INVALID_PASSWORD" },
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
