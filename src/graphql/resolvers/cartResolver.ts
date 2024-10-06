import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Int,
  UseMiddleware,
} from "type-graphql";
import { Cart, CartItem } from "../../generated/typegraphql";
import prisma from "../../config/prisma";
import { isAuthenticated } from "../../utils/authMiddleware";
import { GraphQLError } from "graphql";

@Resolver(() => Cart)
export class CartResolver {
  @Query(() => Cart, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async getCartByUserId(
    @Arg("userId", () => Int) userId: number
  ): Promise<Cart | null> {
    return await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            furniture: true,
          },
        },
      },
    });
  }

  @Mutation(() => CartItem)
  @UseMiddleware(isAuthenticated)
  async addItemToCart(
    @Arg("userId", () => Int) userId: number,
    @Arg("furnitureId", () => Int) furnitureId: number,
    @Arg("quantity", () => Int, { defaultValue: 1 }) quantity: number
  ): Promise<CartItem> {
    try {
      let cart = await prisma.cart.findFirst({ where: { userId } });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId,
          },
        });
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart?.id,
          furnitureId,
        },
      });

      if (existingItem) {
        return await prisma.cartItem.update({
          where: { id: existingItem?.id },
          data: {
            quantity: existingItem?.quantity + quantity,
          },
        });
      }

      return await prisma.cartItem.create({
        data: {
          cartId: cart?.id,
          furnitureId,
          quantity,
        },
      });
    } catch (err) {
      throw new GraphQLError("An error occurred while adding item to cart.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  @Mutation(() => CartItem)
  @UseMiddleware(isAuthenticated)
  async updateCartItemQuantity(
    @Arg("cartItemId", () => Int) cartItemId: number,
    @Arg("quantity", () => Int) quantity: number
  ): Promise<CartItem> {
    if (quantity < 1) {
      throw new GraphQLError("Quantity must be at least 1.", {
        extensions: { code: "INVALID_INPUT" },
      });
    }

    try {
      return await prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity,
        },
      });
    } catch (err) {
      throw new GraphQLError(
        `Could not update quantity for cart item with ID ${cartItemId}.`,
        {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        }
      );
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async removeItemFromCart(
    @Arg("cartItemId", () => Int) cartItemId: number
  ): Promise<boolean> {
    try {
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
      return true;
    } catch (err) {
      throw new GraphQLError(
        `Could not remove cart item with ID ${cartItemId}.`,
        {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        }
      );
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async clearCart(@Arg("userId", () => Int) userId: number): Promise<boolean> {
    try {
      const cart = await prisma.cart.findFirst({
        where: { userId },
      });

      if (!cart)
        throw new GraphQLError("Cart not found.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });

      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart?.id,
        },
      });

      return true;
    } catch (err) {
      throw new GraphQLError("An error occurred while clearing the cart.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }
}
