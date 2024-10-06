import { Resolver, Query, Mutation, Arg, UseMiddleware } from "type-graphql";
import { Order, OrderStatus } from "../../generated/typegraphql";
import { OrderItemInput } from "../../types/types";
import prisma from "../../config/prisma";
import { isAuthenticated } from "../../utils/authMiddleware";
import { GraphQLError } from "graphql";

@Resolver(() => Order)
export class OrderResolver {
  @Query(() => [Order])
  @UseMiddleware(isAuthenticated)
  async orders(): Promise<Order[]> {
    return await prisma.order.findMany({
      include: {
        user: true,
        items: true,
      },
    });
  }

  @Mutation(() => Order)
  @UseMiddleware(isAuthenticated)
  async createOrder(
    @Arg("userId") userId: number,
    @Arg("items", () => [OrderItemInput]) items: OrderItemInput[],
    @Arg("totalPrice") totalPrice: number
  ): Promise<Order> {
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists)
        throw new GraphQLError(`User with ID ${userId} does not exist.`, {
          extensions: { code: "USER_NOT_FOUND" },
        });

      const order = await prisma.order.create({
        data: {
          userId,
          totalPrice,
          items: {
            create: items?.map((item) => ({
              furnitureId: item?.furnitureId,
              price: item?.price,
              quantity: item?.quantity,
            })),
          },
        },
        include: {
          user: true,
          items: true,
        },
      });

      return order;
    } catch (err) {
      throw new GraphQLError("An error occurred while creating the order.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  @Mutation(() => Order, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async updateOrderStatus(
    @Arg("orderId") orderId: number,
    @Arg("status", () => OrderStatus) status: OrderStatus
  ): Promise<Order | null> {
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order)
        throw new GraphQLError(`Order with ID ${orderId} does not exist.`, {
          extensions: { code: "ORDER_NOT_FOUND" },
        });

      return await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          user: true,
          items: true,
        },
      });
    } catch (err) {
      throw new GraphQLError(
        `Could not update status for order with ID ${orderId}.`,
        {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        }
      );
    }
  }
}
