import type { Device } from "../services/api"

interface ICard {
  device: Device
  onToggleRele: () => void
  onToggleConexao: () => void
  onEditar: () => void
  onDeletar: () => void
}

export default function Card({ device, onToggleRele, onToggleConexao, onEditar, onDeletar }: ICard) {
  const online = device.statusDispositivo === "online"

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 w-72 border border-gray-100">

      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bold text-gray-800 text-base">{device.nome}</h2>
          <p className="text-xs text-gray-400">ID: {device.id}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
        }`}>
          {online ? "● ONLINE" : "● OFFLINE"}
        </span>
      </div>

      {/* Sensores */}
      <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2 text-sm">
        <SensorLinha icon="🌡️" label="Temperatura" valor={`${device.temperatura} °C`} />
        <SensorLinha icon="📊" label="Pressão"     valor={`${device.pressao} hPa`} />
        <SensorLinha icon="💧" label="Umidade"     valor={`${device.umidade} %`} />
        <SensorLinha
          icon="👁️"
          label="Presença"
          valor={device.presenca ? "Detectada" : "Não detectada"}
          destaque={device.presenca}
        />
        <SensorLinha
          icon="🔒"
          label="Relé"
          valor={device.rele ? "Ativado" : "Desativado"}
          destaque={device.rele}
        />
        <SensorLinha
          icon="🔌"
          label="Conexão"
          valor={device.conexao ? "Liberada" : "Travada"}
          destaque={device.conexao}
        />
      </div>

      {/* Comandos IoT */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onToggleConexao}
          className={`w-full py-2 rounded-lg text-white text-sm font-medium cursor-pointer transition-colors ${
            device.conexao
              ? "bg-red-400 hover:bg-red-500"
              : "bg-blue-400 hover:bg-blue-500"
          }`}
        >
          {device.conexao ? "⛔ Travar Conexão" : "🔌 Liberar Conexão"}
        </button>
        <button
          onClick={onToggleRele}
          className={`w-full py-2 rounded-lg text-white text-sm font-medium cursor-pointer transition-colors ${
            device.rele
              ? "bg-orange-400 hover:bg-orange-500"
              : "bg-green-400 hover:bg-green-500"
          }`}
        >
          {device.rele ? "🔒 Travar Relé" : "🔓 Liberar Relé"}
        </button>
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={onEditar}
          className="flex-1 py-2 rounded-lg bg-blue-400 hover:bg-blue-500 text-white text-sm cursor-pointer transition-colors"
        >
          Editar
        </button>
        <button
          onClick={onDeletar}
          className="flex-1 py-2 rounded-lg bg-red-400 hover:bg-red-500 text-white text-sm cursor-pointer transition-colors"
        >
          Remover
        </button>
      </div>
    </div>
  )
}

// Linha de sensor reutilizável
function SensorLinha({
  icon,
  label,
  valor,
  destaque,
}: {
  icon: string
  label: string
  valor: string
  destaque?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">
        {icon} {label}
      </span>
      <span className={`font-semibold ${destaque ? "text-green-600" : "text-gray-700"}`}>
        {valor}
      </span>
    </div>
  )
}
