"use client"

import { useState, useEffect, useRef } from "react"
import Card from "./components/Card"
import Botao from "./components/Botao"
import Usuarios from "./components/Usuarios"
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  updateRelayStatus,
  updateConnectionStatus,
  type Device,
  type NovoDevice,
} from "./services/api"

// =====================
// ESTADO INICIAL DO FORMULÁRIO DE DEVICE
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

type Aba = "dispositivos" | "usuarios"

// =====================
// PÁGINA PRINCIPAL
// =====================
export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("dispositivos")

  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [loadingAcao, setLoadingAcao] = useState(false)

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

  useEffect(() => {
    carregarDevices()
  }, [])

  // =====================
  // CRIAR DISPOSITIVO
  // =====================
  const handleCriar = async () => {
    if (!form.nome.trim()) { alert("Informe o nome do dispositivo."); return }
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
  // LIMPAR TODOS
  // =====================
  const handleLimparTudo = async () => {
    if (!confirm("Deseja remover TODOS os dispositivos?")) return
    try {
      await fetch("http://localhost:8080/destroy", { method: "DELETE" })
      alert("Todos os dispositivos foram removidos.")
      carregarDevices()
    } catch {
      alert("Erro ao limpar dados.")
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
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📡</span>
          <h1 className="text-xl font-bold text-gray-800">Painel IoT</h1>
        </div>

        {/* Abas de navegação */}
        <nav className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setAbaAtiva("dispositivos")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              abaAtiva === "dispositivos"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📡 Dispositivos
          </button>
          <button
            onClick={() => setAbaAtiva("usuarios")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              abaAtiva === "usuarios"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            👤 Usuários
          </button>
        </nav>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ===== ABA DISPOSITIVOS ===== */}
        {abaAtiva === "dispositivos" && (
          <div className="flex flex-col gap-6">

            {/* Barra de ações */}
            <div className="flex gap-2 justify-end">
              <Botao nome="🔄 Atualizar" estilo="secundario" onClick={carregarDevices} />
              <Botao nome="+ Novo Dispositivo" estilo="primario" onClick={() => { setForm(formInicial); setModalCriar(true) }} />
              <Botao nome="🗑️ Limpar Tudo" estilo="deletar" onClick={handleLimparTudo} />
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center items-center py-20 text-gray-400 gap-2">
                <span className="animate-spin text-xl">⏳</span>
                <span>Carregando dispositivos...</span>
              </div>
            )}

            {/* Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                ⚠️ {erro}
                <button onClick={carregarDevices} className="ml-3 underline cursor-pointer">
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Lista vazia */}
            {!loading && !erro && devices.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-lg font-medium">Nenhum dispositivo cadastrado.</p>
                <p className="text-sm mt-1">Clique em &quot;+ Novo Dispositivo&quot; para começar.</p>
              </div>
            )}

            {/* Grid de cards */}
            {!loading && devices.length > 0 && (
              <div className="flex flex-wrap gap-5">
                {devices.map((device) => (
                  <Card
                    key={device.id}
                    device={device}
                    onToggleRele={() => handleToggleRele(device)}
                    onToggleConexao={() => handleToggleConexao(device)}
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
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ABA USUÁRIOS ===== */}
        {abaAtiva === "usuarios" && <Usuarios />}
      </main>

      {/* Modal Criar Dispositivo */}
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

      {/* Modal Editar Dispositivo */}
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
// MODAL FORMULÁRIO DE DISPOSITIVO
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

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome do Dispositivo *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Sensor Sala A"
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <select
              value={form.statusDispositivo}
              onChange={(e) => setForm({ ...form, statusDispositivo: e.target.value as "online" | "offline" })}
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Temperatura (°C)</label>
              <input type="number" value={form.temperatura}
                onChange={(e) => setForm({ ...form, temperatura: Number(e.target.value) })}
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Pressão (hPa)</label>
              <input type="number" value={form.pressao}
                onChange={(e) => setForm({ ...form, pressao: Number(e.target.value) })}
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Umidade (%)</label>
              <input type="number" value={form.umidade}
                onChange={(e) => setForm({ ...form, umidade: Number(e.target.value) })}
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.presenca}
                onChange={(e) => setForm({ ...form, presenca: e.target.checked })}
                className="w-4 h-4 accent-blue-500" />
              Presença detectada
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.rele}
                onChange={(e) => setForm({ ...form, rele: e.target.checked })}
                className="w-4 h-4 accent-green-500" />
              Relé ativado
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.conexao}
                onChange={(e) => setForm({ ...form, conexao: e.target.checked })}
                className="w-4 h-4 accent-blue-500" />
              Conexão liberada
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
          <Botao nome="Cancelar" estilo="secundario" onClick={onCancelar} />
          <Botao
            nome={loading ? "Salvando..." : "Confirmar"}
            estilo="confirmar"
            onClick={onConfirmar}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )
}
