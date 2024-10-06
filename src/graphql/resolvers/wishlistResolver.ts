import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Int,
  UseMiddleware,
} from "type-graphql";
import { Furniture } from "../../generated/typegraphql";
import prisma from "../../config/prisma";
import { isAuthenticated } from "../../utils/authMiddleware";
import { GraphQLError } from "graphql";

@Resolver()
export class WishlistResolver {
  @Query(() => [Furniture], { nullable: true })
  @UseMiddleware(isAuthenticated)
  async getUserFavourites(
    @Arg("email", () => String) email: string
  ): Promise<Furniture[] | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        favourites: true,
      },
    });

    return user?.favourites || null;
  }

  @Mutation(() => Furniture)
  @UseMiddleware(isAuthenticated)
  async addToFavourites(
    @Arg("email", () => String) email: string,
    @Arg("furnitureId", () => Int) furnitureId: number
  ): Promise<Furniture> {
    const furnitureExists = await prisma.furniture.findUnique({
      where: { id: furnitureId },
    });

    if (!furnitureExists)
      throw new GraphQLError("Furniture item does not exist.", {
        extensions: { code: "FURNITURE_NOT_FOUND" },
      });

    const user = await prisma.user.update({
      where: { email },
      data: {
        favourites: {
          connect: { id: furnitureId },
        },
      },
      include: {
        favourites: true,
      },
    });

    return user.favourites.find((fav) => fav.id === furnitureId)!;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async removeFromFavourites(
    @Arg("email", () => String) email: string,
    @Arg("furnitureId", () => Int) furnitureId: number
  ): Promise<boolean> {
    await prisma.user.update({
      where: { email },
      data: {
        favourites: {
          disconnect: { id: furnitureId },
        },
      },
    });

    return true;
  }
}
