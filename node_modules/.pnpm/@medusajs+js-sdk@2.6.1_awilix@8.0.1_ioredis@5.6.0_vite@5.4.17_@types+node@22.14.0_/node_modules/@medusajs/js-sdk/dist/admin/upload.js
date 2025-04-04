"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
class Upload {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    // Note: The creation/upload flow be made more advanced, with support for streaming and progress, but for now we keep it simple
    async create(body, query, headers) {
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
            headers: {
                ...headers,
                // Let the browser determine the content type.
                "content-type": null,
            },
            body: form,
            query,
        });
    }
    async retrieve(id, query, headers) {
        return this.client.fetch(`/admin/uploads/${id}`, {
            query,
            headers,
        });
    }
    async delete(id, headers) {
        return this.client.fetch(`/admin/uploads/${id}`, {
            method: "DELETE",
            headers,
        });
    }
}
exports.Upload = Upload;
//# sourceMappingURL=upload.js.map