import CriarEquipamento from "../components/CriarEquipamentos"
import Header from "../components/Header"
import ListarEquipamentos from "../components/ListarEquipamentos"

export default function Equipamentos() {
    return (
        <div>
            <Header />
            <div className="flex gap-4 p-4">
                <CriarEquipamento />
                <ListarEquipamentos />
            </div>
        </div>
    )
}