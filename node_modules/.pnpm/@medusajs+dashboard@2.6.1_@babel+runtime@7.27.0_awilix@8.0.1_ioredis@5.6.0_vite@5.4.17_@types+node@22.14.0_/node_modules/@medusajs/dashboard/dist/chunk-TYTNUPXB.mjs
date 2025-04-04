// src/components/common/file-upload/file-upload.tsx
import { ArrowDownTray } from "@medusajs/icons";
import { Text, clx } from "@medusajs/ui";
import { useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var FileUpload = ({
  label,
  hint,
  multiple = true,
  hasError,
  formats,
  onUploaded
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const handleOpenFileSelector = () => {
    inputRef.current?.click();
  };
  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (!files) {
      return;
    }
    setIsDragOver(true);
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!dropZoneRef.current || dropZoneRef.current.contains(event.relatedTarget)) {
      return;
    }
    setIsDragOver(false);
  };
  const handleUploaded = (files) => {
    if (!files) {
      return;
    }
    const fileList = Array.from(files);
    const fileObj = fileList.map((file) => {
      const id = Math.random().toString(36).substring(7);
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        url: previewUrl,
        file
      };
    });
    onUploaded(fileObj);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    handleUploaded(event.dataTransfer?.files);
  };
  const handleFileChange = async (event) => {
    handleUploaded(event.target.files);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: dropZoneRef,
        type: "button",
        onClick: handleOpenFileSelector,
        onDrop: handleDrop,
        onDragOver: (e) => e.preventDefault(),
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        className: clx(
          "bg-ui-bg-component border-ui-border-strong transition-fg group flex w-full flex-col items-center gap-y-2 rounded-lg border border-dashed p-8",
          "hover:border-ui-border-interactive focus:border-ui-border-interactive",
          "focus:shadow-borders-focus outline-none focus:border-solid",
          {
            "!border-ui-border-error": hasError,
            "!border-ui-border-interactive": isDragOver
          }
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle group-disabled:text-ui-fg-disabled flex items-center gap-x-2", children: [
            /* @__PURE__ */ jsx(ArrowDownTray, {}),
            /* @__PURE__ */ jsx(Text, { children: label })
          ] }),
          !!hint && /* @__PURE__ */ jsx(
            Text,
            {
              size: "small",
              leading: "compact",
              className: "text-ui-fg-muted group-disabled:text-ui-fg-disabled",
              children: hint
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        hidden: true,
        ref: inputRef,
        onChange: handleFileChange,
        type: "file",
        accept: formats.join(","),
        multiple
      }
    )
  ] });
};

export {
  FileUpload
};
