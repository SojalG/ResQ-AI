import Incident from "../models/Incident.js";
import Alert from "../models/Alert.js";
import ChatSession from "../models/ChatSession.js";
import { demoIncidents, demoAlerts } from "../data/demo.js";

let memoryIncidents = structuredClone(demoIncidents);
let memoryAlerts = structuredClone(demoAlerts);
let memoryChats = [];
export const usingDatabase = () => Boolean(global.mongoConnected);
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const store = {
  async incidents(filter = {}, limit = 50) {
    if (usingDatabase())
      return Incident.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return memoryIncidents
      .filter(
        (x) =>
          (!filter.type || x.type === filter.type) &&
          (!filter["aiAnalysis.severity"] ||
            x.aiAnalysis.severity === filter["aiAnalysis.severity"]),
      )
      .slice(0, limit);
  },
  async createIncident(data) {
    if (usingDatabase()) return (await Incident.create(data)).toObject();
    const item = {
      ...data,
      _id: id(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryIncidents.unshift(item);
    return item;
  },
  async updateIncident(itemId, status) {
    if (usingDatabase())
      return Incident.findByIdAndUpdate(
        itemId,
        { status },
        { new: true },
      ).lean();
    const item = memoryIncidents.find((x) => x._id === itemId);
    if (item) item.status = status;
    return item;
  },
  async deleteIncident(itemId) {
    if (usingDatabase()) return Incident.findByIdAndDelete(itemId);
    memoryIncidents = memoryIncidents.filter((x) => x._id !== itemId);
    return true;
  },
  async alerts() {
    return usingDatabase()
      ? Alert.find().sort({ createdAt: -1 }).lean()
      : memoryAlerts;
  },
  async createAlert(data) {
    if (usingDatabase()) return (await Alert.create(data)).toObject();
    const item = { ...data, _id: id(), createdAt: new Date().toISOString() };
    memoryAlerts.unshift(item);
    return item;
  },
  async deleteAlert(itemId) {
    if (usingDatabase()) return Alert.findByIdAndDelete(itemId);
    memoryAlerts = memoryAlerts.filter((x) => x._id !== itemId);
    return true;
  },
  async chats() {
    return usingDatabase()
      ? ChatSession.find()
          .sort({ updatedAt: -1 })
          .select("sessionId title lang updatedAt")
          .lean()
      : memoryChats.map(({ messages, ...x }) => x);
  },
  async saveChat(sessionId, messages, lang) {
    const title =
      messages.find((x) => x.role === "user")?.content.slice(0, 45) ||
      "New conversation";
    if (usingDatabase())
      return ChatSession.findOneAndUpdate(
        { sessionId },
        { sessionId, messages, lang, title },
        { upsert: true, new: true },
      );
    const old = memoryChats.find((x) => x.sessionId === sessionId);
    if (old)
      Object.assign(old, { messages, lang, title, updatedAt: new Date() });
    else
      memoryChats.unshift({
        sessionId,
        messages,
        lang,
        title,
        updatedAt: new Date(),
      });
  },
};
