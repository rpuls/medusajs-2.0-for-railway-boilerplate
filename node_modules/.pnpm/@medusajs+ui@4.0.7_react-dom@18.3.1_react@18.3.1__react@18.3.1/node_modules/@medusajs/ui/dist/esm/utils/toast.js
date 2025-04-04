import { Toast } from "../components/toast";
import * as React from "react";
import { toast as toastFn } from "sonner";
function create(variant, title, props = {}) {
    const external = {
        position: props.position,
        duration: props.duration,
        dismissible: props.dismissable,
    };
    if (props.id) {
        external.id = props.id;
    }
    return toastFn.custom((t) => {
        return (React.createElement(Toast, { id: t, title: title, description: props.description, dismissable: props.dismissable, variant: variant, action: props.action, icon: props.icon }));
    }, external);
}
function message(
/**
 * The title of the toast.
 */
title, 
/**
 * The props of the toast.
 */
props = {}) {
    return create("message", title, props);
}
function custom() {
    return create("message", "Custom");
}
function info(
/**
 * The title of the toast.
 */ title, 
/**
 * The props of the toast.
 */
props = {}) {
    return create("info", title, props);
}
function error(
/**
 * The title of the toast.
 */ title, 
/**
 * The props of the toast.
 */
props = {}) {
    return create("error", title, props);
}
function success(
/**
 * The title of the toast.
 */ title, 
/**
 * The props of the toast.
 */
props = {}) {
    return create("success", title, props);
}
function warning(
/**
 * The title of the toast.
 */ title, 
/**
 * The props of the toast.
 */
props = {}) {
    return create("warning", title, props);
}
function loading(
/**
 * The title of the toast.
 */ title, 
/**
 * The props of the toast.
 */
props = {}) {
    return create("loading", title, { ...props, dismissable: false });
}
function createUniqueID() {
    return Math.random().toString(36).slice(2, 8);
}
async function promise(
/**
 * The promise to be resolved.
 */
promise, 
/**
 * The props of the toast.
 */
props) {
    let id = props.id || createUniqueID();
    let shouldDismiss = id !== undefined;
    id = create("loading", typeof props.loading === "string" ? props.loading : props.loading.title, {
        id: id,
        position: props.position,
        description: typeof props.loading === "string"
            ? undefined
            : props.loading.description,
        duration: Infinity,
        dismissable: false,
    });
    const p = promise instanceof Promise ? promise : promise();
    p.then(() => {
        shouldDismiss = false;
        create("success", typeof props.success === "string" ? props.success : props.success.title, {
            id: id,
            position: props.position,
            description: typeof props.success === "string"
                ? undefined
                : props.success.description,
        });
    })
        .catch(() => {
        shouldDismiss = false;
        create("error", typeof props.error === "string" ? props.error : props.error.title, {
            id: id,
            position: props.position,
            description: typeof props.error === "string"
                ? undefined
                : props.error.description,
        });
    })
        .finally(() => {
        if (shouldDismiss) {
            toastFn.dismiss(id);
            id = undefined;
        }
    });
    return id;
}
export const toast = Object.assign(message, {
    info,
    error,
    warning,
    success,
    promise,
    loading,
    dismiss: toastFn.dismiss,
});
//# sourceMappingURL=toast.js.map