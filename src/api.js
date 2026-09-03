import { initialMockDeliveries } from "./mockData";

const useMocks = import.meta.env.VITE_USE_MOCKS !== "false";
const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:7071").replace(/\/$/, "");
const helloUrl = import.meta.env.VITE_HELLO_URL
  || (import.meta.env.DEV
    ? "https://rg-cloudlog-atv1-bqh5arcmf3habeh3.brazilsouth-01.azurewebsites.net/api/helloCloudLog"
    : "/api/hello");
let mockDeliveries = structuredClone(initialMockDeliveries);

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Falha na requisição (${response.status}).`);
  }
  return payload;
}

const wait = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

export async function checkCloudLogFunction(name = "Laura") {
  const separator = helloUrl.includes("?") ? "&" : "?";
  const response = await fetch(`${helloUrl}${separator}name=${encodeURIComponent(name)}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Falha na requisição (${response.status}).`);
  return payload;
}

export async function listDeliveries(filters = {}) {
  if (!useMocks) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value),
    );
    return request(`/api/deliveries?${params.toString()}`);
  }
  await wait();
  const search = (filters.search || "").toLowerCase();
  const items = mockDeliveries.filter((item) => {
    const matchesStatus = !filters.status || filters.status === "Todos" || item.status === filters.status;
    const matchesSearch = !search || [item.code, item.customer, item.destination, item.driver]
      .some((value) => value.toLowerCase().includes(search));
    return matchesStatus && matchesSearch;
  });
  return { items, total: items.length };
}

export async function createDelivery(delivery) {
  if (!useMocks) return request("/api/deliveries", { method: "POST", body: JSON.stringify(delivery) });
  await wait();
  const item = {
    ...delivery,
    _id: crypto.randomUUID(),
    progress: Number(delivery.progress || 0),
    updatedAt: new Date().toISOString(),
  };
  mockDeliveries = [item, ...mockDeliveries];
  return item;
}

export async function updateDelivery(id, delivery) {
  if (!useMocks) return request(`/api/deliveries/${id}`, { method: "PUT", body: JSON.stringify(delivery) });
  await wait();
  const index = mockDeliveries.findIndex((item) => item._id === id);
  if (index < 0) throw new Error("Entrega não encontrada.");
  mockDeliveries[index] = { ...mockDeliveries[index], ...delivery, updatedAt: new Date().toISOString() };
  return mockDeliveries[index];
}

export async function deleteDelivery(id) {
  if (!useMocks) return request(`/api/deliveries/${id}`, { method: "DELETE" });
  await wait();
  mockDeliveries = mockDeliveries.filter((item) => item._id !== id);
  return { deleted: true, id };
}

export const apiMode = useMocks ? "Demonstração" : "Azure Functions";
