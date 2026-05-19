"use client"
import { useState, useEffect, useRef } from "react"
import {
  getDevices,
  deleteDevice,
  updateRelayStatus,
  updateConnectionStatus,
  updateDevice,
  createDevice,
  type Device,
  type NovoDevice,
} from "../services/api"

// =====================
// ESTADO INICIAL DO FORMULÁRIO
// =====================
const formInicial: NovoDevice = {
  nome: "",
  statusDispositivo: "offline",
  temperatura: 0,
  pressao: 0,
  umidade: 0,
  presenca: false,
  rele: false,
  conexao: false,
}

// =====================
// COMPONENTE PRINCIPAL
// =====================
export default function ListarDispositivos() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [loadingAcao, setLoadingAcao] = useState(false)

  // Modais
  const [modalCriar, setModalCriar] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [form, setForm] = useState<NovoDevice>(formInicial)
  const editandoId = useRef<number | null>(null)

  // =====================
  // CARREGAR DISPOSITIVOS
  // =====================
  const carregarDevices = async () => {
    setLoading(true)
    setErro("")
    try {
      const dados = await getDevices()
      setDevices(dados)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar dispositivos.")
    } finally {
      setLoading(false)
    }
  }

  // Roda apenas uma vez ao montar o componente
  useEffect(() => {
    carregarDevices()
  }, [])

  // =====================
  // CRIAR DISPOSITIVO
  // =====================
  const handleCriar = async () => {
    if (!form.nome.trim()) {
      alert("Informe o nome do dispositivo.")
      return
    }
    setLoadingAcao(true)
    try {
      const resposta = await createDevice(form)
      alert(resposta.msg)
      setModalCriar(false)
      setForm(formInicial)
      carregarDevices()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao criar dispositivo.")
    } finally {
      setLoadingAcao(false)
    }
  }

  // =====================
  // EDITAR DISPOSITIVO
  // =====================
  const handleEditar = async () => {
    if (editandoId.current === null) return
    setLoadingAcao(true)
    try {
      const resposta = await updateDevice(editandoId.current, form)
      alert(resposta.msg)
      setModalEditar(false)
      setForm(formInicial)
      editandoId.current = null
      carregarDevices()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao editar dispositivo.")
    } finally {
      setLoadingAcao(false)
    }
  }

  // =====================
  // DELETAR DISPOSITIVO
  // =====================
  const handleDeletar = async (id: number) => {
    if (!confirm("Deseja remover este dispositivo?")) return
    try {
      const resposta = await deleteDevice(id)
      alert(resposta.msg)
      carregarDevices()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao remover dispositivo.")
    }
  }

  // =====================
  // TOGGLE RELÉ
  // =====================
  const handleToggleRele = async (device: Device) => {
    try {
      await updateRelayStatus(device.id, !device.rele)
      carregarDevices()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao atualizar relé.")
    }
  }

  // =====================
  // TOGGLE CONEXÃO
  // =====================
  const handleToggleConexao = async (device: Device) => {
    try {
      await updateConnectionStatus(device.id, !device.conexao)
      carregarDevices()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao atualizar conexão.")
    }
  }

  // =====================
  // RENDER
  // =====================
  return (
    <div className="w-full flex flex-col gap-4">

      {/* Cabeçalho da lista */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Dispositivos IoT</h2>
        <div className="flex gap-2">
          <button
            onClick={carregarDevices}
            className="text-sm px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors"
          >
            🔄 Atualizar
          </button>
          <button
            onClick={() => { setForm(formInicial); setModalCriar(true) }}
            className="text-sm px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white cursor-pointer transition-colors"
          >
            + Novo Dispositivo
          </button>
        </div>
      </div>

      {/* Estados de loading e erro */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-8 justify-center">
          <span className="animate-spin">⏳</span> Carregando dispositivos...
        </div>
      )}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
          ⚠️ {erro}
        </div>
      )}
      {!loading && !erro && devices.length === 0 && (
        <div className="text-center text-gray-400 py-12 text-sm">
          Nenhum dispositivo cadastrado. Clique em &quot;+ Novo Dispositivo&quot; para começar.
        </div>
      )}

      {/* Cards de dispositivos */}
      <div className="grid grid-cols-1 gap-4">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onEditar={() => {
              editandoId.current = device.id
              setForm({
                nome: device.nome,
                statusDispositivo: device.statusDispositivo,
                temperatura: device.temperatura,
                pressao: device.pressao,
                umidade: device.umidade,
                presenca: device.presenca,
                rele: device.rele,
                conexao: device.conexao,
              })
              setModalEditar(true)
            }}
            onDeletar={() => handleDeletar(device.id)}
            onToggleRele={() => handleToggleRele(device)}
            onToggleConexao={() => handleToggleConexao(device)}
          />
        ))}
      </div>

      {/* Modal Criar */}
      {modalCriar && (
        <ModalFormDevice
          titulo="Novo Dispositivo"
          form={form}
          setForm={setForm}
          loading={loadingAcao}
          onConfirmar={handleCriar}
          onCancelar={() => setModalCriar(false)}
        />
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <ModalFormDevice
          titulo={`Editar Dispositivo #${editandoId.current}`}
          form={form}
          setForm={setForm}
          loading={loadingAcao}
          onConfirmar={handleEditar}
          onCancelar={() => setModalEditar(false)}
        />
      )}
    </div>
  )
}

// =====================
// CARD DE DISPOSITIVO
// =====================
type DeviceCardProps = {
  device: Device
  onEditar: () => void
  onDeletar: () => void
  onToggleRele: () => void
  onToggleConexao: () => void
}

function DeviceCard({ device, onEditar, onDeletar, onToggleRele, onToggleConexao }: DeviceCardProps) {
  const online = device.statusDispositivo === "online"

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">

      {/* Cabeçalho do card */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{device.nome}</h3>
          <p className="text-xs text-gray-400">ID: {device.id}</p>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
          }`}
        >
          {online ? "● ONLINE" : "● OFFLINE"}
        </span>
      </div>

      {/* Sensores */}
      <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded-lg p-3">
        <SensorItem icon="🌡️" label="Temperatura" value={`${device.temperatura} °C`} />
        <SensorItem icon="📊" label="Pressão" value={`${device.pressao} hPa`} />
        <SensorItem icon="💧" label="Umidade" value={`${device.umidade} %`} />
        <SensorItem
          icon="👁️"
          label="Presença"
          value={device.presenca ? "Detectada" : "Não detectada"}
          highlight={device.presenca}
        />
        <SensorItem
          icon="🔒"
          label="Relé"
          value={device.rele ? "Ativado" : "Desativado"}
          highlight={device.rele}
        />
        <SensorItem
          icon="🔌"
          label="Conexão"
          value={device.conexao ? "Liberada" : "Travada"}
          highlight={device.conexao}
        />
      </div>

      {/* Comandos IoT */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToggleConexao}
          className={`flex-1 min-w-[140px] rounded-lg px-3 py-2 text-white text-sm font-medium cursor-pointer transition-colors ${
            device.conexao
              ? "bg-red-400 hover:bg-red-500"
              : "bg-blue-400 hover:bg-blue-500"
          }`}
        >
          {device.conexao ? "⛔ Travar Conexão" : "🔌 Liberar Conexão"}
        </button>
        <button
          onClick={onToggleRele}
          className={`flex-1 min-w-[140px] rounded-lg px-3 py-2 text-white text-sm font-medium cursor-pointer transition-colors ${
            device.rele
              ? "bg-orange-400 hover:bg-orange-500"
              : "bg-green-400 hover:bg-green-500"
          }`}
        >
          {device.rele ? "🔒 Travar Relé" : "🔓 Liberar Relé"}
        </button>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={onEditar}
          className="px-4 py-2 rounded-lg bg-blue-400 hover:bg-blue-500 text-white text-sm cursor-pointer transition-colors"
        >
          Editar
        </button>
        <button
          onClick={onDeletar}
          className="px-4 py-2 rounded-lg bg-red-400 hover:bg-red-500 text-white text-sm cursor-pointer transition-colors"
        >
          Remover
        </button>
      </div>
    </div>
  )
}

// =====================
// ITEM DE SENSOR
// =====================
type SensorItemProps = {
  icon: string
  label: string
  value: string
  highlight?: boolean
}

function SensorItem({ icon, label, value, highlight }: SensorItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`font-semibold text-sm ${highlight ? "text-green-600" : "text-gray-700"}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

// =====================
// MODAL DE FORMULÁRIO
// =====================
type ModalFormProps = {
  titulo: string
  form: NovoDevice
  setForm: (f: NovoDevice) => void
  loading: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

function ModalFormDevice({ titulo, form, setForm, loading, onConfirmar, onCancelar }: ModalFormProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-800/60 flex justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>

        <div className="flex flex-col gap-3">

          {/* Nome */}
          <div>
            <label className="text-sm font-medium text-gray-600">Nome do Dispositivo *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Sensor Sala A"
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 outline-2 outline-blue-400 text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-600">Status do Dispositivo</label>
            <select
              value={form.statusDispositivo}
              onChange={(e) => setForm({ ...form, statusDispositivo: e.target.value as "online" | "offline" })}
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 outline-2 outline-blue-400 text-sm"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* Sensores numéricos */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Temperatura (°C)</label>
              <input
                type="number"
                value={form.temperatura}
                onChange={(e) => setForm({ ...form, temperatura: Number(e.target.value) })}
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 outline-2 outline-blue-400 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Pressão (hPa)</label>
              <input
                type="number"
                value={form.pressao}
                onChange={(e) => setForm({ ...form, pressao: Number(e.target.value) })}
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 outline-2 outline-blue-400 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Umidade (%)</label>
              <input
                type="number"
                value={form.umidade}
                onChange={(e) => setForm({ ...form, umidade: Number(e.target.value) })}
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 outline-2 outline-blue-400 text-sm"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.presenca}
                onChange={(e) => setForm({ ...form, presenca: e.target.checked })}
                className="w-4 h-4 accent-blue-500"
              />
              Presença detectada
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.rele}
                onChange={(e) => setForm({ ...form, rele: e.target.checked })}
                className="w-4 h-4 accent-green-500"
              />
              Relé ativado
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.conexao}
                onChange={(e) => setForm({ ...form, conexao: e.target.checked })}
                className="w-4 h-4 accent-blue-500"
              />
              Conexão liberada
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
          <button
            onClick={onCancelar}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  )
}
