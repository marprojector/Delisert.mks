import {
  CFD,
  CLOSED_DAY,
  DELIVERY_METHODS,
  OPERATIONAL_ADDRESS,
  PICKUP_INSTRUCTION,
  SOCIAL_MEDIA,
  TIKTOK_LIVE,
} from "../data/business";
import { publicProcedure, router } from "../index";

export const scheduleRouter = router({
  all: publicProcedure.query(() => {
    return {
      tiktokLive: TIKTOK_LIVE,
      cfd: CFD,
      closedDay: CLOSED_DAY,
      operationalAddress: OPERATIONAL_ADDRESS,
      deliveryMethods: DELIVERY_METHODS,
      pickupInstruction: PICKUP_INSTRUCTION,
      socialMedia: SOCIAL_MEDIA,
    };
  }),
});
