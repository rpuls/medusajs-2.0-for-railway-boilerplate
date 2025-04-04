"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearInstances = clearInstances;
/**
 * cleanup temporary created resources for the migrations
 * @internal I didnt find a god place to put that, should we eventually add a close function
 * to the planner to handle that part? so that you would do planner.close() and it will handle the cleanup
 * automatically just like we usually do for the classic migrations actions
 */
async function clearInstances() {
    const { MedusaModule } = require("@medusajs/framework/modules-sdk");
    MedusaModule.clearInstances();
}
//# sourceMappingURL=clear-instances.js.map