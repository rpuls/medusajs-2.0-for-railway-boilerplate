import { ExecArgs } from "@medusajs/framework/types"
import syncFashionBizInventory from "../jobs/sync-fashionbiz-inventory"

export default async function runFashionBizInventorySync({ container }: ExecArgs) {
  await syncFashionBizInventory(container)
}
