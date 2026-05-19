"use client"
import { useState, useEffect, useRef, ChangeEvent } from "react"
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  type Usuario,
  type NovoUsuario,
} from "../services/api"
import Botao from "./Botao"

const formInicial: NovoUsuario = { nome: "", email: "", senha: "" }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [loadingAcao, setLoadingAcao] = useState(false)

  // Formulário de criação
  const [formCriar, setFormCriar] = useState<NovoUsuario>(formInicial)
  const [erroCriar, setErroCriar] = useState("")

  // Modal de edição
  const [modalEditar, setModalEditar] = useState(false)
  const [formEditar, setFormEditar] = useState<NovoUsuario>(formInicial)
  const editandoId = useRef<number | null>(null)

  // =====================
  // CARREGAR USUÁRIOS
  // =====================
  const carregarUsuarios = async () => {
    setLoading(true)
    setErro("")
    try {
      const dados = await getUsuarios()
      setUsuarios(dados)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar usuários.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  // =====================
  // CRIAR USUÁRIO
  // =====================
  const handleCriar = async () => {
    if (!formCriar.nome.trim() || !formCriar.email.trim() || !formCriar.senha.trim()) {
      setErroCriar("Preencha todos os campos.")
      return
    }
    setErroCriar("")
    setLoadingAcao(true)
    try {
      const resposta = await createUsuario(formCriar)
      alert(resposta.msg)
      setFormCriar(formInicial)
      carregarUsuarios()
    } catch (e: unknown) {
      setErroCriar(e instanceof Error ? e.message : "Erro ao criar usuário.")
    } finally {
      setLoadingAcao(false)
    }
  }

  // =====================
  // EDITAR USUÁRIO
  // =====================
  const handleEditar = async () => {
    if (editandoId.current === null) return
    setLoadingAcao(true)
    try {
      const resposta = await updateUsuario(editandoId.current, formEditar)
      alert(resposta.msg)
      setModalEditar(false)
      setFormEditar(formInicial)
      editandoId.current = null
      carregarUsuarios()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao editar usuário.")
    } finally {
      setLoadingAcao(false)
    }
  }

  // =====================
  // DELETAR USUÁRIO
  // =====================
  const handleDeletar = async (id: number) => {
    if (!confirm("Deseja remover este usuário?")) return
    try {
      const resposta = await deleteUsuario(id)
      alert(resposta.msg)
      carregarUsuarios()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao remover usuário.")
    }
  }

  const pegaInfoCriar = (e: ChangeEvent<HTMLInputElement>, campo: keyof NovoUsuario) => {
    setFormCriar({ ...formCriar, [campo]: e.target.value })
  }

  const pegaInfoEditar = (e: ChangeEvent<HTMLInputElement>, campo: keyof NovoUsuario) => {
    setFormEditar({ ...formEditar, [campo]: e.target.value })
  }

  // =====================
  // RENDER
  // =====================
  return (
    <div className="flex gap-6 w-full">

      {/* Formulário de criação */}
      <div className="w-80 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 h-fit">
        <h2 className="text-lg font-bold text-gray-800">Novo Usuário</h2>

        {erroCriar && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            ⚠️ {erroCriar}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome *</label>
            <input
              type="text"
              placeholder="Nome completo"
              value={formCriar.nome}
              onChange={(e) => pegaInfoCriar(e, "nome")}
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email *</label>
            <input
              type="email"
              placeholder="email@email.com"
              value={formCriar.email}
              onChange={(e) => pegaInfoCriar(e, "email")}
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Senha *</label>
            <input
              type="password"
              placeholder="Crie uma senha"
              value={formCriar.senha}
              onChange={(e) => pegaInfoCriar(e, "senha")}
              className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
            />
          </div>
        </div>

        <Botao
          nome={loadingAcao ? "Criando..." : "Criar Usuário"}
          estilo="confirmar"
          onClick={handleCriar}
          disabled={loadingAcao}
        />
      </div>

      {/* Lista de usuários */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Lista de Usuários</h2>
          <Botao nome="🔄 Atualizar" estilo="secundario" onClick={carregarUsuarios} />
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
            <span className="animate-spin">⏳</span> Carregando...
          </div>
        )}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
            ⚠️ {erro}
          </div>
        )}
        {!loading && !erro && usuarios.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            Nenhum usuário cadastrado ainda.
          </div>
        )}

        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex justify-between items-center"
          >
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-gray-800">{usuario.nome}</p>
              <p className="text-sm text-gray-500">{usuario.email}</p>
              <p className="text-xs text-gray-400">ID: {usuario.id}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  editandoId.current = usuario.id
                  setFormEditar({ nome: usuario.nome, email: usuario.email, senha: usuario.senha })
                  setModalEditar(true)
                }}
                className="px-4 py-2 rounded-lg bg-blue-400 hover:bg-blue-500 text-white text-sm cursor-pointer transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeletar(usuario.id)}
                className="px-4 py-2 rounded-lg bg-red-400 hover:bg-red-500 text-white text-sm cursor-pointer transition-colors"
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edição */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 bg-gray-800/60 flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-gray-800">
              Editar Usuário #{editandoId.current}
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <input
                  type="text"
                  value={formEditar.nome}
                  onChange={(e) => pegaInfoEditar(e, "nome")}
                  className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  value={formEditar.email}
                  onChange={(e) => pegaInfoEditar(e, "email")}
                  className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Senha</label>
                <input
                  type="password"
                  value={formEditar.senha}
                  onChange={(e) => pegaInfoEditar(e, "senha")}
                  className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <Botao nome="Cancelar" estilo="secundario" onClick={() => setModalEditar(false)} />
              <Botao
                nome={loadingAcao ? "Salvando..." : "Confirmar"}
                estilo="confirmar"
                onClick={handleEditar}
                disabled={loadingAcao}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
