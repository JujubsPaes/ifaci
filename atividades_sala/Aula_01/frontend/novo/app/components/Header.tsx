import Link from "next/link"

export default function Header() {
  return (
    <header className="w-full px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">📡</span>
        <h1 className="text-xl font-bold text-gray-800">Painel IoT</h1>
      </div>
      <nav className="flex gap-2">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 font-medium text-sm transition-colors"
        >
          Dispositivos
        </Link>
      </nav>
    </header>
  )
}
