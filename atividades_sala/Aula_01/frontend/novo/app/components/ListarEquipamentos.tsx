"use client"
import { useState, useEffect, useRef, ChangeEvent } from "react"
import {
  getEquipamentos,
  criarEquipamento,
  editarEquipamento,
  deletarEquipamento,
  getDispositivos,
  criarDispositivo,
  editarDispositivo,
  deletarDispositivo,
  updateRelayStatus,
  updateConnectionStatus,
  type Equipamento,
  type Dispositivo,
  type NovoDispositivo,
} from "../services/api"

const dispositivoInicial: NovoDispositivo = {
  statusDispositivo: "offline",
  sensores: { temperatura: 0, pressao: 0, umidade: 0, presenca: false, rele: false },
  comandoLiberarConexao: false,
  comandoLiberarRele: false,
}

export default function ListarEquipamentos() {
  // === EQUIPAMENTOS ===
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [loadingEquip, setLoadingEquip] = useState(true)
  const [erroEquip, setErroEquip] = useState("")
  const [formEquip, setFormEquip] = useState({ nome: "" })
  const [modalEditarEquip, setModalEditarEquip] = useState(false)
  const [loadingAcao, setLoadingAcao] = useState(false)
  const equipamentoId = useRef(0)

  // === DISPOSITIVOS ===
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [loadingDisp, setLoadingDisp] = useState(false)
  const [modalDispositivos, setModalDispositivos] = useState(false)
  const [modalCriarDisp, setModalCriarDisp] = useState(false)
  const [modalEditarDisp, setModalEditarDisp] = useState(false)
  const [formDisp, setFormDisp] = useState<NovoDispositivo>(dispositivoInicial)
  const dispositivoId = useRef(0)

  const carregarEquipamentos = async () => {
    setLoadingEquip(true)
    setErroEquip("")
    try {
      const dados = await getEquipamentos()
      setEquipamentos(dados)
    } catch (e: unknown) {
      setErroEquip(e instanceof Error ? e.message : "Erro ao carregar equipamentos.")
    } finally {
      setLoadingEquip(false)
    }
  }

  // Array de dependências vazio: roda apenas uma vez ao montar o componente
  useEffect(() => {
    carregarEquipamentos()
  }, [])

  const carregarDispositivos = async (equipId: number) => {
    setLoadingDisp(true)
    try {
      const dados = await getDispositivos(equipId)
      setDispositivos(dados)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao carregar dispositivos.")
    } finally {
      setLoadingDisp(false)
    }
  }

  // === HANDLERS EQUIPAMENTOS ===

  const handleDeletarEquip = async (id: number) => {
    if (!confirm("Deletar este equipamento e todos os seus dispositivos?")) return
    try {
      const resposta = await deletarEquipamento(id)
      alert(resposta.msg)
      carregarEquipamentos()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao deletar.")
    }
  }

  const handleEditarEquip = async () => {
    setLoadingAcao(true)
    try {
      const resposta = await editarEquipamento(equipamentoId.current, formEquip)
      alert(resposta.msg)
      setModalEditarEquip(false)
      setFormEquip({ nome: "" })
      carregarEquipamentos()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao editar.")
    } finally {
      setLoadingAcao(false)
    }
  }

  // === HANDLERS DISPOSITIVOS ===

  const handleCriarDisp = async () => {
    setLoadingAcao(true)
    try {
      const resposta = await criarDispositivo(equipamentoId.current, formDisp)
      alert(resposta.msg)
      setModalCriarDisp(false)
      setFormDisp(dispositivoInicial)
      carregarDispositivos(equipamentoId.current)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao criar dispositivo.")
    } finally {
      setLoadingAcao(false)
    }
  }

  const handleEditarDisp = async () => {
    setLoadingAcao(true)
    try {
      const resposta = await editarDispositivo(dispositivoId.current, formDisp)
      alert(resposta.msg)
      setModalEditarDisp(false)
      setFormDisp(dispositivoInicial)
      carregarDispositivos(equipamentoId.current)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao editar dispositivo.")
    } finally {
      setLoadingAcao(false)
    }
  }

  const handleDeletarDisp = async (id: number) => {
    if (!confirm("Deletar este dispositivo?")) return
    try {
      const resposta = await deletarDispositivo(id)
      alert(resposta.msg)
      carregarDispositivos(equipamentoId.current)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao deletar dispositivo.")
    }
  }

  const handleToggleRele = async (disp: Dispositivo) => {
    try {
      await updateRelayStatus(disp.id, !disp.comandoLiberarRele)
      carregarDispositivos(equipamentoId.current)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao atualizar relé.")
    }
  }

  const handleToggleConexao = async (disp: Dispositivo) => {
    try {
      await updateConnectionStatus(disp.id, !disp.comandoLiberarConexao)
      carregarDispositivos(equipamentoId.current)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao atualizar conexão.")
    }
  }

  // === RENDER ===

  return (
    <div className="w-[50vw] max-h-[88vh] overflow-y-auto bg-white text-black rounded-xl flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Equipamentos</h2>
        <button
          onClick={carregarEquipamentos}
          className="text-sm px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
        >
          🔄 Atualizar
        </button>
      </div>

      {loadingEquip && <p className="text-gray-500 text-sm">Carregando...</p>}
      {erroEquip && <p className="text-red-500 text-sm">{erroEquip}</p>}
      {!loadingEquip && equipamentos.length === 0 && (
        <p className="text-gray-500 text-sm">Nenhum equipamento cadastrado.</p>
      )}

      {equipamentos.map((equip) => (
        <div key={equip.id} className="bg-gray-300 border-2 border-gray-500 rounded-lg p-4">
          <h2 className="text-lg font-semibold">Equipamento {equip.id}</h2>
          <p>{equip.nome}</p>
          <div className="flex w-full justify-end gap-4 mt-2">
            <button
              onClick={() => {
                equipamentoId.current = equip.id
                carregarDispositivos(equip.id)
                setModalDispositivos(true)
              }}
              className="rounded-lg px-4 py-2 bg-green-400 hover:bg-green-500 text-white cursor-pointer"
            >
              Dispositivos
            </button>
            <button
              onClick={() => {
                equipamentoId.current = equip.id
                setFormEquip({ nome: equip.nome })
                setModalEditarEquip(true)
              }}
              className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeletarEquip(equip.id)}
              className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
            >
              Deletar
            </button>
          </div>
        </div>
      ))}

      {/* === MODAL EDITAR EQUIPAMENTO === */}
      {modalEditarEquip && (
        <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
          <div className="w-[50vw] h-fit rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-8">
            <h2 className="text-xl font-semibold">Editar Equipamento {equipamentoId.current}</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Novo Nome"
                value={formEquip.nome}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormEquip({ nome: e.target.value })}
                className="p-4 rounded-lg outline-2 outline-blue-500"
              />
              <div className="flex gap-8 justify-end w-full">
                <button
                  onClick={handleEditarEquip}
                  disabled={loadingAcao}
                  className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer disabled:opacity-50"
                >
                  {loadingAcao ? "Salvando..." : "Confirmar"}
                </button>
                <button
                  onClick={() => setModalEditarEquip(false)}
                  className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL DISPOSITIVOS === */}
      {modalDispositivos && (
        <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
          <div className="w-[60vw] max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Dispositivos do Equipamento {equipamentoId.current}
              </h2>
              <button
                onClick={() => { setFormDisp(dispositivoInicial); setModalCriarDisp(true) }}
                className="rounded-lg px-4 py-2 bg-green-400 hover:bg-green-500 text-white cursor-pointer text-sm"
              >
                + Novo Dispositivo
              </button>
            </div>

            {loadingDisp && <p className="text-gray-500 text-sm">Carregando dispositivos...</p>}
            {!loadingDisp && dispositivos.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum dispositivo cadastrado.</p>
            )}

            {dispositivos.map((disp) => (
              <div key={disp.id} className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Dispositivo {disp.id}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      disp.statusDispositivo === "online"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {disp.statusDispositivo.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-sm">
                  <p>🌡️ Temperatura: <strong>{disp.sensores.temperatura} °C</strong></p>
                  <p>📊 Pressão: <strong>{disp.sensores.pressao} hPa</strong></p>
                  <p>💧 Umidade: <strong>{disp.sensores.umidade} %</strong></p>
                  <p>👁️ Presença: <strong>{disp.sensores.presenca ? "Detectada" : "Não detectada"}</strong></p>
                  <p>🔒 Relé (sensor): <strong>{disp.sensores.rele ? "Ativado" : "Desativado"}</strong></p>
                </div>

                {/* Comandos IoT */}
                <div className="flex gap-3 mt-1 flex-wrap">
                  <button
                    onClick={() => handleToggleConexao(disp)}
                    className={`rounded-lg px-3 py-2 text-white cursor-pointer text-sm ${
                      disp.comandoLiberarConexao
                        ? "bg-red-400 hover:bg-red-500"
                        : "bg-blue-400 hover:bg-blue-500"
                    }`}
                  >
                    {disp.comandoLiberarConexao ? "⛔ Travar Conexão" : "🔌 Liberar Conexão"}
                  </button>
                  <button
                    onClick={() => handleToggleRele(disp)}
                    className={`rounded-lg px-3 py-2 text-white cursor-pointer text-sm ${
                      disp.comandoLiberarRele
                        ? "bg-orange-400 hover:bg-orange-500"
                        : "bg-green-400 hover:bg-green-500"
                    }`}
                  >
                    {disp.comandoLiberarRele ? "🔒 Travar Relé" : "🔓 Liberar Relé"}
                  </button>
                </div>

                <div className="flex w-full justify-end gap-4 mt-1">
                  <button
                    onClick={() => {
                      dispositivoId.current = disp.id
                      setFormDisp({
                        statusDispositivo: disp.statusDispositivo,
                        sensores: { ...disp.sensores },
                        comandoLiberarConexao: disp.comandoLiberarConexao,
                        comandoLiberarRele: disp.comandoLiberarRele,
                      })
                      setModalEditarDisp(true)
                    }}
                    className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletarDisp(disp.id)}
                    className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer text-sm"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setModalDispositivos(false)}
                className="rounded-lg px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL CRIAR DISPOSITIVO === */}
      {modalCriarDisp && (
        <ModalFormDispositivo
          titulo="Novo Dispositivo"
          form={formDisp}
          setForm={setFormDisp}
          loading={loadingAcao}
          onConfirmar={handleCriarDisp}
          onCancelar={() => setModalCriarDisp(false)}
        />
      )}

      {/* === MODAL EDITAR DISPOSITIVO === */}
      {modalEditarDisp && (
        <ModalFormDispositivo
          titulo={`Editar Dispositivo ${dispositivoId.current}`}
          form={formDisp}
          setForm={setFormDisp}
          loading={loadingAcao}
          onConfirmar={handleEditarDisp}
          onCancelar={() => setModalEditarDisp(false)}
        />
      )}
    </div>
  )
}

// === COMPONENTE AUXILIAR: Formulário de Dispositivo ===
type ModalFormProps = {
  titulo: string
  form: NovoDispositivo
  setForm: (f: NovoDispositivo) => void
  loading: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

function ModalFormDispositivo({ titulo, form, setForm, loading, onConfirmar, onCancelar }: ModalFormProps) {
  return (
    <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
      <div className="w-[50vw] h-fit rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-4">
        <h2 className="text-xl font-semibold">{titulo}</h2>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Status do Dispositivo</label>
          <select
            value={form.statusDispositivo}
            onChange={(e) => setForm({ ...form, statusDispositivo: e.target.value })}
            className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>

          <label className="text-sm font-medium">Temperatura (°C)</label>
          <input
            type="number"
            value={form.sensores.temperatura}
            onChange={(e) => setForm({ ...form, sensores: { ...form.sensores, temperatura: Number(e.target.value) } })}
            className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
          />

          <label className="text-sm font-medium">Pressão (hPa)</label>
          <input
            type="number"
            value={form.sensores.pressao}
            onChange={(e) => setForm({ ...form, sensores: { ...form.sensores, pressao: Number(e.target.value) } })}
            className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
          />

          <label className="text-sm font-medium">Umidade (%)</label>
          <input
            type="number"
            value={form.sensores.umidade}
            onChange={(e) => setForm({ ...form, sensores: { ...form.sensores, umidade: Number(e.target.value) } })}
            className="p-3 rounded-lg outline-2 outline-blue-500 border border-gray-300"
          />

          <div className="flex gap-8">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={form.sensores.presenca}
                onChange={(e) => setForm({ ...form, sensores: { ...form.sensores, presenca: e.target.checked } })}
                className="w-4 h-4"
              />
              Presença detectada
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={form.sensores.rele}
                onChange={(e) => setForm({ ...form, sensores: { ...form.sensores, rele: e.target.checked } })}
                className="w-4 h-4"
              />
              Relé ativado
            </label>
          </div>
        </div>

        <div className="flex gap-8 justify-end w-full">
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="rounded-lg px-4 py-2 bg-green-400 hover:bg-green-500 text-white cursor-pointer disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>
          <button
            onClick={onCancelar}
            className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
