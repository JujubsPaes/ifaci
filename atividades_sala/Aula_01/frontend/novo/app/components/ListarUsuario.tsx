"use client"
import { useState, useEffect, useRef, ChangeEvent } from "react"
import { getUsuarios, deletarUsuario, editarUsuario, type Usuario } from "../services/api"

export default function ListarUsuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")

  const [modalAberto, setModalAberto] = useState(false)
  const [formEdicao, setFormEdicao] = useState({ nome_completo: "", email: "", senha: "" })
  const [loadingAcao, setLoadingAcao] = useState(false)
  const userId = useRef(0)

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

  // Array de dependências vazio: roda apenas uma vez ao montar o componente
  useEffect(() => {
    carregarUsuarios()
  }, [])

  const handleDeletar = async (id: number) => {
    if (!confirm("Deseja deletar este usuário?")) return
    try {
      const resposta = await deletarUsuario(id)
      alert(resposta.msg)
      carregarUsuarios()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao deletar.")
    }
  }

  const pegaInfo = (e: ChangeEvent<HTMLInputElement>, campo: keyof typeof formEdicao) => {
    setFormEdicao({ ...formEdicao, [campo]: e.target.value })
  }

  const handleEditar = async () => {
    setLoadingAcao(true)
    try {
      const resposta = await editarUsuario(userId.current, formEdicao)
      alert(resposta.msg)
      setModalAberto(false)
      setFormEdicao({ nome_completo: "", email: "", senha: "" })
      carregarUsuarios()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao editar.")
    } finally {
      setLoadingAcao(false)
    }
  }

  return (
    <div className="w-[50vw] max-h-[88vh] overflow-y-auto bg-white text-black rounded-xl flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Usuários</h2>
        <button
          onClick={carregarUsuarios}
          className="text-sm px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
        >
          🔄 Atualizar
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">Carregando...</p>}
      {erro && <p className="text-red-500 text-sm">{erro}</p>}
      {!loading && usuarios.length === 0 && (
        <p className="text-gray-500 text-sm">Nenhum usuário cadastrado.</p>
      )}

      {usuarios.map((usuario) => (
        <div key={usuario.id} className="bg-gray-300 border-2 border-gray-500 rounded-lg p-4">
          <h2 className="text-lg font-semibold">Usuário {usuario.id}</h2>
          <p>{usuario.nome_completo}</p>
          <p>Email: {usuario.email}</p>
          <p>Senha: {usuario.senha}</p>
          <div className="flex w-full justify-end gap-4 mt-2">
            <button
              onClick={() => {
                userId.current = usuario.id
                setFormEdicao({
                  nome_completo: usuario.nome_completo,
                  email: usuario.email,
                  senha: usuario.senha,
                })
                setModalAberto(true)
              }}
              className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeletar(usuario.id)}
              className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
            >
              Deletar
            </button>
          </div>
        </div>
      ))}

      {/* Modal de edição */}
      {modalAberto && (
        <div className="w-screen h-screen inset-0 absolute bg-gray-700/50 flex justify-center items-center">
          <div className="w-[50vw] h-fit rounded-2xl shadow-lg bg-white flex flex-col px-6 py-4 gap-8">
            <h2 className="text-xl font-semibold">Editar Usuário {userId.current}</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Novo Nome"
                value={formEdicao.nome_completo}
                onChange={(e) => pegaInfo(e, "nome_completo")}
                className="p-4 rounded-lg outline-2 outline-red-500"
              />
              <input
                type="email"
                placeholder="Novo email"
                value={formEdicao.email}
                onChange={(e) => pegaInfo(e, "email")}
                className="p-4 rounded-lg outline-2 outline-red-500"
              />
              <input
                type="password"
                placeholder="Nova Senha"
                value={formEdicao.senha}
                onChange={(e) => pegaInfo(e, "senha")}
                className="p-4 rounded-lg outline-2 outline-red-500"
              />
              <div className="flex gap-8 justify-end w-full">
                <button
                  onClick={handleEditar}
                  disabled={loadingAcao}
                  className="rounded-lg px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white cursor-pointer disabled:opacity-50"
                >
                  {loadingAcao ? "Salvando..." : "Confirmar"}
                </button>
                <button
                  onClick={() => setModalAberto(false)}
                  className="rounded-lg px-4 py-2 bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
