"use client"
import { useState, ChangeEvent } from "react"
import { criarEquipamento } from "../services/api"

export default function CriarEquipamento() {
  const [nome, setNome] = useState("")
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const handleCriar = async () => {
    if (!nome.trim()) {
      setErro("Informe o nome do equipamento.")
      return
    }
    setErro("")
    setLoading(true)
    try {
      const resposta = await criarEquipamento({ nome })
      alert(resposta.msg)
      setNome("")
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao criar equipamento.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[50vw] flex flex-col gap-4 rounded-xl max-h-fit bg-white text-black p-4">
      <h2 className="text-lg font-semibold">Criar Novo Equipamento</h2>

      {erro && <p className="text-red-500 text-sm">{erro}</p>}

      <input
        type="text"
        placeholder="Nome do Equipamento"
        value={nome}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
        className="p-4 rounded-lg outline-2 outline-blue-500"
      />

      <button
        onClick={handleCriar}
        disabled={loading}
        className="py-2 px-4 text-white rounded-lg hover:bg-blue-600 bg-blue-500 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Criando..." : "Criar"}
      </button>
    </div>
  )
}
