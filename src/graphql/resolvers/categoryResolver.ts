import { Resolver, Query, Mutation, Arg, UseMiddleware } from "type-graphql";
import { Category } from "../../generated/typegraphql";
import prisma from "../../config/prisma";
import { isAuthenticated } from "../../utils/authMiddleware";
import { GraphQLError } from "graphql";

@Resolver(() => Category)
export class CategoryResolver {
  @Query(() => [Category])
  @UseMiddleware(isAuthenticated)
  async categories(): Promise<Category[]> {
    return await prisma.category.findMany();
  }

  @Mutation(() => Category)
  @UseMiddleware(isAuthenticated)
  async createCategory(@Arg("name") name: string): Promise<Category> {
    return await prisma.category.create({
      data: {
        name,
      },
    });
  }

  @Mutation(() => Category, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async deleteCategory(@Arg("name") name: string): Promise<Category | null> {
    try {
      return await prisma.category.delete({
        where: { name },
      });
    } catch (err) {
      throw new GraphQLError(`Category with name ${name} not found.`, {
        extensions: { code: "CATEGORY_NOT_FOUND" },
      });
    }
  }
}
