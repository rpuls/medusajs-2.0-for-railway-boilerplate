"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGraphQLSchema = void 0;
exports.generateGraphQLFromEntity = generateGraphQLFromEntity;
const entity_1 = require("../entity");
const parse_entity_name_1 = require("./entity-builder/parse-entity-name");
const set_relationship_1 = require("./graphql-builder/set-relationship");
const get_attribute_1 = require("./graphql-builder/get-attribute");
const entity_builder_1 = require("./entity-builder");
function generateGraphQLFromEntity(entity) {
    const { schema } = entity.parse();
    const { modelName } = (0, parse_entity_name_1.parseEntityName)(entity);
    let extra = [];
    let gqlSchema = [];
    Object.entries(schema).forEach(([name, property]) => {
        const field = property.parse(name);
        if ("fieldName" in field) {
            const prop = (0, get_attribute_1.getGraphQLAttributeFromDMLPropety)(modelName, name, property);
            if (prop.enum) {
                extra.push(prop.enum);
            }
            gqlSchema.push(`${prop.attribute}`);
        }
        else {
            if (["belongsTo", "hasOneWithFK"].includes(field.type)) {
                const foreignKeyName = (0, entity_builder_1.getForeignKey)(field);
                const fkProp = (0, get_attribute_1.getGraphQLAttributeFromDMLPropety)(modelName, field.name, {
                    $dataType: "",
                    parse() {
                        return {
                            fieldName: foreignKeyName,
                            computed: false,
                            dataType: { name: "text" },
                            nullable: field.nullable || false,
                            indexes: [],
                            relationships: [],
                        };
                    },
                });
                gqlSchema.push(`${fkProp.attribute}`);
            }
            const prop = (0, set_relationship_1.setGraphQLRelationship)(modelName, field);
            if (prop.extra) {
                extra.push(prop.extra);
            }
            gqlSchema.push(`${prop.attribute}`);
        }
    });
    return `
      ${extra.join("\n")}
      type ${modelName} {
        ${gqlSchema.join("\n")}
      }
    `;
}
/**
 * Takes a DML entity and returns a GraphQL schema string.
 * @param entity
 */
const toGraphQLSchema = (entities) => {
    const gqlSchemas = entities.map((entity) => {
        if (entity_1.DmlEntity.isDmlEntity(entity)) {
            return generateGraphQLFromEntity(entity);
        }
        return entity;
    });
    return gqlSchemas.join("\n");
};
exports.toGraphQLSchema = toGraphQLSchema;
//# sourceMappingURL=create-graphql.js.map