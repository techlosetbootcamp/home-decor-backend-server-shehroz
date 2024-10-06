import {
  Resolver,
  Mutation,
  Query,
  Arg,
  Int,
  UseMiddleware,
} from "type-graphql";
import { Review } from "../../generated/typegraphql";
import prisma from "../../config/prisma";
import { isAuthenticated } from "../../utils/authMiddleware";
import { GraphQLError } from "graphql";

@Resolver(() => Review)
export class ReviewResolver {
  @Query(() => [Review], { nullable: true })
  @UseMiddleware(isAuthenticated)
  async getReviewsByFurnitureId(
    @Arg("furnitureId", () => Int) furnitureId: number
  ): Promise<Review[] | null> {
    return prisma.review.findMany({
      where: { furnitureId },
      include: {
        user: true,
      },
    });
  }

  @Mutation(() => Review)
  @UseMiddleware(isAuthenticated)
  async addReview(
    @Arg("furnitureId", () => Int) furnitureId: number,
    @Arg("userId", () => Int) userId: number,
    @Arg("rating", () => Int) rating: number,
    @Arg("content", () => String) content: string
  ): Promise<Review> {
    if (rating < 1 || rating > 5)
      throw new GraphQLError("Rating must be between 1 and 5.", {
        extensions: { code: "INVALID_INPUT" },
      });

    try {
      return await prisma.review.create({
        data: {
          furnitureId,
          userId,
          rating,
          content,
        },
        include: {
          user: true,
          furniture: true,
        },
      });
    } catch (err) {
      throw new GraphQLError("An error occurred while adding the review.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  @Mutation(() => Review, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async updateReview(
    @Arg("reviewId", () => Int) reviewId: number,
    @Arg("rating", () => Int, { nullable: true }) rating?: number,
    @Arg("content", () => String, { nullable: true }) content?: string
  ): Promise<Review | null> {
    const data: Partial<{ rating: number; content: string }> = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        throw new GraphQLError("Rating must be between 1 and 5.", {
          extensions: { code: "INVALID_INPUT" },
        });
      }
      data.rating = rating;
    }
    if (content !== undefined) data.content = content;

    try {
      return await prisma.review.update({
        where: { id: reviewId },
        data,
        include: {
          user: true,
          furniture: true,
        },
      });
    } catch (err) {
      throw new GraphQLError(`An error occurred while updating the review!`, {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  @Mutation(() => Review, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async deleteReview(
    @Arg("reviewId", () => Int) reviewId: number
  ): Promise<Review | null> {
    try {
      return await prisma.review.delete({
        where: { id: reviewId },
      });
    } catch (err) {
      throw new GraphQLError(`Could not delete review with ID ${reviewId}.`, {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }
}
