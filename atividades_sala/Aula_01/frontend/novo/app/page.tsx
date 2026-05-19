import Header from "./components/Header"
import ListarDispositivos from "./components/ListarDispositivos"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ListarDispositivos />
      </main>
    </div>
  )
}
