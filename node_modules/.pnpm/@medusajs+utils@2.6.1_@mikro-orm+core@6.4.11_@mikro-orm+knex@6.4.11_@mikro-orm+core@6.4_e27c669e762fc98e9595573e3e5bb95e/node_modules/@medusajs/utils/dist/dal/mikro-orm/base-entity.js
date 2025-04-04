"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
const core_1 = require("@mikro-orm/core");
const common_1 = require("../../common");
let BaseEntity = class BaseEntity {
    constructor({ prefix_id } = {}) {
        this.__prefix_id__ = prefix_id;
    }
    onInitOrBeforeCreate_() {
        this.id ??= this.generateEntityId(this.__prefix_id__);
    }
    generateEntityId(prefixId) {
        if (prefixId) {
            return (0, common_1.generateEntityId)(undefined, prefixId);
        }
        let ensuredPrefixId = Object.getPrototypeOf(this).constructor.name;
        /*
         * Split the class name (camel case) into words and exclude model and entity from the words
         */
        const words = ensuredPrefixId
            .split(/(?=[A-Z])/)
            .filter((word) => !["entity", "model"].includes(word.toLowerCase()));
        const wordsLength = words.length;
        /*
         * if the class name (camel case) contains one word, the prefix id is the first three letters of the word
         * if the class name (camel case) contains two words, the prefix id is the first two letters of the first word plus the first letter of the second one
         * if the class name (camel case) contains more than two words, the prefix id is the first letter of each word
         */
        if (wordsLength === 1) {
            ensuredPrefixId = words[0].substring(0, 3);
        }
        else if (wordsLength === 2) {
            ensuredPrefixId = words
                .map((word, index) => {
                return word.substring(0, 2 - index);
            })
                .join("");
        }
        else {
            ensuredPrefixId = words
                .map((word) => {
                return word[0];
            })
                .join("");
        }
        this.__prefix_id__ = ensuredPrefixId.toLowerCase();
        return (0, common_1.generateEntityId)(undefined, this.__prefix_id__);
    }
};
exports.BaseEntity = BaseEntity;
__decorate([
    (0, core_1.PrimaryKey)({ columnType: "text" }),
    __metadata("design:type", String)
], BaseEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.OnInit)(),
    (0, core_1.BeforeCreate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BaseEntity.prototype, "onInitOrBeforeCreate_", null);
exports.BaseEntity = BaseEntity = __decorate([
    (0, core_1.Entity)({ abstract: true }),
    __metadata("design:paramtypes", [Object])
], BaseEntity);
//# sourceMappingURL=base-entity.js.map