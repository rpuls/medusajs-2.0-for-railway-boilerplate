import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { IUserModuleService } from "@medusajs/framework/types";

export async function registerLoggedInUser(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const userModuleService: IUserModuleService = req.scope.resolve(
    Modules.USER
  );
  const userId = req.session?.auth_context?.actor_id;
  if (userId) {
    const user = await userModuleService.retrieveUser(userId);
    req.scope.register({
      loggedInUser: {
        resolve: () => user,
      },
    });
  }

  next();
};
