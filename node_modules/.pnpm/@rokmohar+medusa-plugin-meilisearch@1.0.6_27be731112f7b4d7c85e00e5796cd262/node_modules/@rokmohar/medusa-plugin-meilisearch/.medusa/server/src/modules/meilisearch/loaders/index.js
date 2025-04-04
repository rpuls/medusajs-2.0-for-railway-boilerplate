"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const awilix_1 = require("awilix");
exports.default = async ({ container, options }) => {
    if (!options) {
        throw new Error('Missing meilisearch configuration');
    }
    const meilisearchService = new services_1.MeiliSearchService(container, options);
    const { settings } = options;
    container.register({
        meilisearchService: (0, awilix_1.asValue)(meilisearchService),
    });
    await Promise.all(Object.entries(settings || {}).map(async ([indexName, value]) => {
        return await meilisearchService.updateSettings(indexName, value);
    }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWlsaXNlYXJjaC9sb2FkZXJzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMENBQWdEO0FBRWhELG1DQUFnQztBQUVoQyxrQkFBZSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUEyQyxFQUFpQixFQUFFO0lBQ3RHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0lBRUQsTUFBTSxrQkFBa0IsR0FBdUIsSUFBSSw2QkFBa0IsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDekYsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQTtJQUU1QixTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ2pCLGtCQUFrQixFQUFFLElBQUEsZ0JBQU8sRUFBQyxrQkFBa0IsQ0FBQztLQUNoRCxDQUFDLENBQUE7SUFFRixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQzlELE9BQU8sTUFBTSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ2xFLENBQUMsQ0FBQyxDQUNILENBQUE7QUFDSCxDQUFDLENBQUEifQ==