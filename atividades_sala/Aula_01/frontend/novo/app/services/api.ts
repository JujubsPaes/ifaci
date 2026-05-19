// =====================
// CONFIGURAÇÃO BASE
// =====================
const BASE_URL = "http://localhost:8080"

// =====================
// TIPOS
// =====================

export type Device = {
  id: number
  nome: string
  statusDispositivo: "online" | "offline"
  temperatura: number
  pressao: number
  umidade: number
  presenca: boolean
  rele: boolean
  conexao: boolean
}

export type NovoDevice = Omit<Device, "id">

export type ApiResponse<T = undefined> = {
  msg: string
  device?: T
}

// =====================
// HELPER INTERNO
// =====================

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => ({ msg: `Erro HTTP ${response.status}` }))
    throw new Error(erro.msg || `Erro HTTP ${response.status}`)
  }

  return response.json()
}

// =====================
// FUNÇÕES DE DISPOSITIVOS
// =====================

/** Lista todos os dispositivos */
export const getDevices = (): Promise<Device[]> =>
  request<Device[]>("/devices")

/** Busca um dispositivo pelo ID */
export const getDeviceById = (id: number): Promise<Device> =>
  request<Device>(`/devices/${id}`)

/** Cria um novo dispositivo */
export const createDevice = (dados: NovoDevice): Promise<ApiResponse<Device>> =>
  request<ApiResponse<Device>>("/devices", {
    method: "POST",
    body: JSON.stringify(dados),
  })

/** Atualiza campos gerais do dispositivo (sensores, nome, status) */
export const updateDevice = (id: number, dados: Partial<NovoDevice>): Promise<ApiResponse<Device>> =>
  request<ApiResponse<Device>>(`/devices/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  })

/** Altera o status do relé (trava de segurança) */
export const updateRelayStatus = (id: number, rele: boolean): Promise<ApiResponse<Device>> =>
  request<ApiResponse<Device>>(`/devices/${id}/relay`, {
    method: "PUT",
    body: JSON.stringify({ rele }),
  })

/** Altera o status da conexão do dispositivo */
export const updateConnectionStatus = (id: number, conexao: boolean): Promise<ApiResponse<Device>> =>
  request<ApiResponse<Device>>(`/devices/${id}/connection`, {
    method: "PUT",
    body: JSON.stringify({ conexao }),
  })

/** Remove um dispositivo */
export const deleteDevice = (id: number): Promise<ApiResponse> =>
  request<ApiResponse>(`/devices/${id}`, { method: "DELETE" })
