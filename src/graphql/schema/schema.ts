import { buildSchemaSync } from "type-graphql";
import { resolvers } from "../../generated/typegraphql";
import { FurnitureResolver } from "../resolvers/furnitureResolver";
import { CategoryResolver } from "../resolvers/categoryResolver";
import { OrderResolver } from "../resolvers/orderResolver";
import { CartResolver } from "../resolvers/cartResolver";
import { ReviewResolver } from "../resolvers/reviewResolver";
import { PasswordResolver } from "../resolvers/passwordResolver";
import { ProfileResolver } from "../resolvers/profileResolver";
import { UserResolver } from "../resolvers/userResolver";
import { WishlistResolver } from "../resolvers/wishlistResolver";

export const schema = buildSchemaSync({
  resolvers: [
    ...resolvers,
    ProfileResolver,
    UserResolver,
    PasswordResolver,
    FurnitureResolver,
    CategoryResolver,
    OrderResolver,
    CartResolver,
    ReviewResolver,
    WishlistResolver,
  ],
  validate: false,
});
