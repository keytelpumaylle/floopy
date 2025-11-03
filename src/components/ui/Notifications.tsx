"use client";

import { ReactElement } from "react";
import { useNotificationStore, NotificationType } from "@/store/useNotificationStore";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const notificationStyles: Record<NotificationType, { bg: string; border: string; icon: ReactElement }> = {
  success: {
    bg: "bg-green-900/30",
    border: "border-green-500/50",
    icon: <CheckCircle className="text-green-400" size={20} />,
  },
  error: {
    bg: "bg-red-900/30",
    border: "border-red-500/50",
    icon: <XCircle className="text-red-400" size={20} />,
  },
  warning: {
    bg: "bg-yellow-900/30",
    border: "border-yellow-500/50",
    icon: <AlertTriangle className="text-yellow-400" size={20} />,
  },
  info: {
    bg: "bg-blue-900/30",
    border: "border-blue-500/50",
    icon: <Info className="text-blue-400" size={20} />,
  },
};

export default function Notifications() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {notifications.map((notification) => {
        const styles = notificationStyles[notification.type];

        return (
          <div
            key={notification.id}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg animate-slide-in-right flex items-start gap-3 backdrop-blur-sm`}
          >
            <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>

            <div className="flex-1 min-w-0">
              <div
                className="text-white text-sm leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: notification.message }}
              />
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              aria-label="Cerrar notificación"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
