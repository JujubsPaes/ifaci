interface IBotao {
  nome: string
  estilo: keyof typeof estilos
  onClick: () => void
  disabled?: boolean
}

const estilos = {
  deletar:    "bg-red-500 hover:bg-red-400 text-white font-bold",
  confirmar:  "bg-green-500 hover:bg-green-400 text-white font-bold",
  secundario: "bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium",
  primario:   "bg-blue-500 hover:bg-blue-600 text-white font-bold",
} as const

export default function Botao({ nome, estilo, onClick, disabled }: IBotao) {
  const estiloAtivo = estilos[estilo]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg shadow-sm px-4 py-2 cursor-pointer transition-colors disabled:opacity-50 ${estiloAtivo}`}
    >
      {nome}
    </button>
  )
}
