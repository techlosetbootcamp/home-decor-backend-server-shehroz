import { Resolver, Query, Mutation, Arg, UseMiddleware } from "type-graphql";
import { Furniture } from "../../generated/typegraphql";
import prisma from "../../config/prisma";
import { isAuthenticated } from "../../utils/authMiddleware";
import { GraphQLError } from "graphql";

@Resolver(() => Furniture)
export class FurnitureResolver {
  @Query(() => [Furniture])
  @UseMiddleware(isAuthenticated)
  async furnitures(): Promise<Furniture[]> {
    return await prisma.furniture.findMany();
  }

  @Query(() => Furniture, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async furniture(@Arg("id") id: number): Promise<Furniture | null> {
    return await prisma.furniture.findUnique({
      where: { id },
    });
  }

  @Mutation(() => Furniture)
  @UseMiddleware(isAuthenticated)
  async createFurniture(
    @Arg("title") title: string,
    @Arg("description") description: string,
    @Arg("price") price: number,
    @Arg("categoryId") categoryId: number
  ): Promise<Furniture | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category)
        throw new GraphQLError(
          `Category with ID ${categoryId} does not exist.`,
          {
            extensions: { code: "CATEGORY_NOT_FOUND" },
          }
        );

      return await prisma.furniture.create({
        data: {
          title,
          description,
          price,
          category: { connect: { id: categoryId } },
        },
      });
    } catch (err) {
      throw new GraphQLError(
        "An error occurred while creating the furniture.",
        {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        }
      );
    }
  }

  @Mutation(() => Furniture, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async updateFurniture(
    @Arg("id") id: number,
    @Arg("title", { nullable: true }) title?: string,
    @Arg("description", { nullable: true }) description?: string,
    @Arg("price", { nullable: true }) price?: number,
    @Arg("categoryId", { nullable: true }) categoryId?: number
  ): Promise<Furniture | null> {
    try {
      const furniture = await prisma.furniture.findUnique({
        where: { id },
      });

      if (!furniture) {
        throw new GraphQLError(`Furniture with ID ${id} does not exist.`, {
          extensions: { code: "FURNITURE_NOT_FOUND" },
        });
      }

      return await prisma.furniture.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(price && { price }),
          ...(categoryId && { category: { connect: { id: categoryId } } }),
        },
      });
    } catch (err) {
      throw new GraphQLError(
        "An error occurred while updating the furniture.",
        {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        }
      );
    }
  }

  @Mutation(() => Furniture, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async deleteFurniture(@Arg("id") id: number): Promise<Furniture | null> {
    try {
      return await prisma.furniture.delete({
        where: { id },
      });
    } catch (err) {
      throw new GraphQLError(`Furniture with ID ${id} not found.`, {
        extensions: { code: "FURNITURE_NOT_FOUND" },
      });
    }
  }
}
