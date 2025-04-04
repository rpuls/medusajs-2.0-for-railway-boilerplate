var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Upload {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    // Note: The creation/upload flow be made more advanced, with support for streaming and progress, but for now we keep it simple
    create(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = new FormData();
            if (body instanceof FileList) {
                Array.from(body).forEach((file) => {
                    form.append("files", file);
                });
            }
            else {
                body.files.forEach((file) => {
                    form.append("files", "content" in file
                        ? new Blob([file.content], {
                            type: "text/plain",
                        })
                        : file, file.name);
                });
            }
            return this.client.fetch(`/admin/uploads`, {
                method: "POST",
                headers: Object.assign(Object.assign({}, headers), { 
                    // Let the browser determine the content type.
                    "content-type": null }),
                body: form,
                query,
            });
        });
    }
    retrieve(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/uploads/${id}`, {
                query,
                headers,
            });
        });
    }
    delete(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.fetch(`/admin/uploads/${id}`, {
                method: "DELETE",
                headers,
            });
        });
    }
}
//# sourceMappingURL=upload.js.map