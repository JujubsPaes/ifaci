"use client"
import { useState, ChangeEvent } from "react"
import { criarUsuario } from "../services/api"

export default function CriarUsuario() {
  const [form, setForm] = useState({ nome_completo: "", email: "", senha: "" })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const pegaInfo = (e: ChangeEvent<HTMLInputElement>, campo: keyof typeof form) => {
    setForm({ ...form, [campo]: e.target.value })
  }

  const handleCriar = async () => {
    if (!form.nome_completo || !form.email || !form.senha) {
      setErro("Preencha todos os campos.")
      return
    }
    setErro("")
    setLoading(true)
    try {
      const resposta = await criarUsuario(form)
      alert(resposta.msg)
      setForm({ nome_completo: "", email: "", senha: "" })
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao criar usuário.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[50vw] flex flex-col gap-4 rounded-xl max-h-fit bg-white text-black p-4">
      <h2 className="text-lg font-semibold">Criar Novo Usuário</h2>

      {erro && <p className="text-red-500 text-sm">{erro}</p>}

      <input
        type="text"
        placeholder="Nome Completo"
        value={form.nome_completo}
        onChange={(e) => pegaInfo(e, "nome_completo")}
        className="p-4 rounded-lg outline-2 outline-red-500"
      />
      <input
        type="email"
        placeholder="email@email.com"
        value={form.email}
        onChange={(e) => pegaInfo(e, "email")}
        className="p-4 rounded-lg outline-2 outline-red-500"
      />
      <input
        type="password"
        placeholder="Crie uma senha"
        value={form.senha}
        onChange={(e) => pegaInfo(e, "senha")}
        className="p-4 rounded-lg outline-2 outline-red-500"
      />

      <button
        onClick={handleCriar}
        disabled={loading}
        className="py-2 px-4 text-white rounded-lg hover:bg-red-500 bg-red-400 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Criando..." : "Enviar"}
      </button>
    </div>
  )
}
