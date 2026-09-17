// Servicio de Notificaciones del Navegador - LingoQuest English Pro
import { storageService } from "./storage.js";
import { CURRICULUM } from "../data/lessons.js";

class NotificationService {
  constructor() {
    this.checkInterval = null;
  }

  init() {
    if (!("Notification" in window)) return;
    this.scheduleDailyCheck();
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      return { granted: false, reason: "unsupported" };
    }
    if (Notification.permission === "granted") {
      return { granted: true };
    }
    const result = await Notification.requestPermission();
    return { granted: result === "granted" };
  }

  scheduleDailyCheck() {
    // Check immediately on load
    this.checkAndSend();
    // Then check every 5 minutes while the app is open
    this.checkInterval = setInterval(() => this.checkAndSend(), 5 * 60 * 1000);
  }

  checkAndSend() {
    if (!storageService.isNotificationsEnabled()) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (!storageService.shouldSendNotification()) return;

    const state = storageService.getState();
    const pendingExams = this.getPendingExams();
    const message = this.buildMessage(pendingExams, state.streak);

    storageService.markNotificationSent();
    new Notification("🔔 LingoQuest English Pro", {
      body: message,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🌟%3C/text%3E%3C/svg%3E",
      tag: "lingoquest-daily-reminder",
    });
  }

  getPendingExams() {
    return CURRICULUM.units.filter(u =>
      u.lessons.every(l => storageService.isLessonCompleted(l.id)) &&
      !storageService.isExamCompleted(`exam-${u.id}`)
    );
  }

  buildMessage(pendingExams, streak) {
    if (pendingExams.length > 0) {
      const names = pendingExams.slice(0, 2).map(u => u.title.split(":")[0]).join(", ");
      const extra = pendingExams.length > 2 ? ` y ${pendingExams.length - 2} más` : "";
      return `¡Tienes ${pendingExams.length} examen(es) pendiente(s): ${names}${extra}! No pierdas tu racha de ${streak} día(s). 🔥`;
    }
    return `¡No pierdas tu racha de ${streak} día(s)! Completa una lección o examen hoy. 🚀`;
  }
}

export const notificationService = new NotificationService();
