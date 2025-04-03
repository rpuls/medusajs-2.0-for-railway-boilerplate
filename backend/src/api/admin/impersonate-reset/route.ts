import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  delete req.session.impersonate_user_id;
  res.status(200).send();
};
