import React from "react";
import toast, { Toaster } from "react-hot-toast";
import * as FaIcons from "react-icons/fa"; // import tất cả icon Fa

const MyToaster = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#333",
                    color: "#fff",
                },
            }}
        />
    );
};

type ToastType = "success" | "error";

export const showCustomToast = (message: string, type: ToastType = "success") => {
    const bgColor = type === "success" ? "#4caf50" : "#f44336";

    // Ép kiểu chắc chắn
    const IconComponent = (type === "success" ? FaIcons.FaCheckCircle : FaIcons.FaTimesCircle) as React.ComponentType<{ size?: number; color?: string }>;

    toast.custom(
  (t) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: bgColor,
        color: "#fff",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        opacity: t.visible ? 1 : 0,
        transition: "opacity 0.3s",
      }}
    >
      <span style={{ marginRight: "8px" }}>
        <IconComponent size={20} color="#fff" />
      </span>
      <span>{message}</span>
      <button
        onClick={() => toast.dismiss(t.id)} // đây là cách đúng
        style={{
          marginLeft: "16px",
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        X
      </button>
    </div>
  ),
  { duration: 4000 } // bắt buộc để toast biết thời gian tồn tại
);
};

export default MyToaster;
