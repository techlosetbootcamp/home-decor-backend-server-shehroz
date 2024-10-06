import { InputType, Field, Int } from "type-graphql";
import { Request, Response } from "express";

@InputType()
export class OrderItemInput {
  @Field()
  furnitureId: number;

  @Field()
  price: number;

  @Field()
  quantity: number;

  constructor(furnitureId: number, price: number, quantity: number) {
    this.furnitureId = furnitureId;
    this.price = price;
    this.quantity = quantity;
  }
}

@InputType()
export class CartItemInput {
  @Field(() => Int)
  furnitureId!: number;

  @Field(() => Int, { defaultValue: 1 })
  quantity!: number;
}

@InputType()
export class RegisterUserInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;
}

export type userPayload = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  isVerified: boolean;
};

export type MyContext = {
  req: Request;
  res: Response;
  user?: userPayload;
};
