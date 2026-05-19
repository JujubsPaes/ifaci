const express = require("express")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())

// =====================
// DADOS EM MEMÓRIA
// =====================
const devices = []
let nextId = 1

const usuarios = []
let nextIdUsuario = 1

// =====================
// ROTAS LEGADAS (mantidas para compatibilidade)
// =====================

// GET / → lista todos os dados legados (mantido)
app.get("/", (req, res) => {
     res.status(200).json(devices)
})

// POST /iot → recebe dado legado de sensor
app.post("/iot", (req, res) => {
     const body = req.body
     const novoDevice = {
          id: nextId++,
          nome: body.Sensor || "Dispositivo sem nome",
          statusDispositivo: body.Status ? "online" : "offline",
          temperatura: body.temperatura || 0,
          pressao: body.pressao || 0,
          umidade: body.umidade || 0,
          presenca: body.presenca || false,
          rele: body.rele || false,
          conexao: body.conexao || false,
     }
     devices.push(novoDevice)
     res.status(201).json({ msg: "Dispositivo criado com sucesso!", device: novoDevice })
})

// DELETE /destroy → apaga todos
app.delete("/destroy", (req, res) => {
     devices.splice(0, devices.length)
     nextId = 1
     res.status(200).json({ msg: "Todos os dispositivos foram removidos." })
})

// DELETE /destroy/:id → apaga por índice (legado)
app.delete("/destroy/:id", (req, res) => {
     const idx = parseInt(req.params.id)
     if (isNaN(idx) || idx < 0 || idx >= devices.length) {
          return res.status(404).json({ msg: "Índice inválido." })
     }
     devices.splice(idx, 1)
     res.status(200).json({ msg: `Item ${idx} deletado com sucesso.` })
})

// =====================
// ROTAS DE DISPOSITIVOS IoT
// =====================

// GET /devices → lista todos os dispositivos
app.get("/devices", (req, res) => {
     res.status(200).json(devices)
})

// GET /devices/:id → busca dispositivo por id
app.get("/devices/:id", (req, res) => {
     const id = parseInt(req.params.id)
     const device = devices.find(d => d.id === id)

     if (!device) {
          return res.status(404).json({ msg: "Dispositivo não encontrado." })
     }

     res.status(200).json(device)
})

// POST /devices → cria novo dispositivo
app.post("/devices", (req, res) => {
     const {
          nome,
          statusDispositivo,
          temperatura,
          pressao,
          umidade,
          presenca,
          rele,
          conexao,
     } = req.body

     if (!nome) {
          return res.status(400).json({ msg: "O campo 'nome' é obrigatório." })
     }

     const novoDevice = {
          id: nextId++,
          nome,
          statusDispositivo: statusDispositivo || "offline",
          temperatura: temperatura ?? 0,
          pressao: pressao ?? 0,
          umidade: umidade ?? 0,
          presenca: presenca ?? false,
          rele: rele ?? false,
          conexao: conexao ?? false,
     }

     devices.push(novoDevice)
     res.status(201).json({ msg: "Dispositivo criado com sucesso!", device: novoDevice })
})

// PUT /devices/:id/relay → altera status do relé
app.put("/devices/:id/relay", (req, res) => {
     const id = parseInt(req.params.id)
     const device = devices.find(d => d.id === id)

     if (!device) {
          return res.status(404).json({ msg: "Dispositivo não encontrado." })
     }

     if (req.body.rele === undefined) {
          return res.status(400).json({ msg: "Campo 'rele' é obrigatório (true/false)." })
     }

     device.rele = req.body.rele
     res.status(200).json({ msg: "Status do relé atualizado.", device })
})

// PUT /devices/:id/connection → altera status da conexão
app.put("/devices/:id/connection", (req, res) => {
     const id = parseInt(req.params.id)
     const device = devices.find(d => d.id === id)

     if (!device) {
          return res.status(404).json({ msg: "Dispositivo não encontrado." })
     }

     if (req.body.conexao === undefined) {
          return res.status(400).json({ msg: "Campo 'conexao' é obrigatório (true/false)." })
     }

     device.conexao = req.body.conexao
     // Atualiza o statusDispositivo com base na conexão
     device.statusDispositivo = req.body.conexao ? "online" : "offline"
     res.status(200).json({ msg: "Status da conexão atualizado.", device })
})

// PUT /devices/:id → atualiza dados completos do dispositivo (sensores)
app.put("/devices/:id", (req, res) => {
     const id = parseInt(req.params.id)
     const device = devices.find(d => d.id === id)

     if (!device) {
          return res.status(404).json({ msg: "Dispositivo não encontrado." })
     }

     const campos = ["nome", "statusDispositivo", "temperatura", "pressao", "umidade", "presenca", "rele", "conexao"]
     campos.forEach(campo => {
          if (req.body[campo] !== undefined) {
               device[campo] = req.body[campo]
          }
     })

     res.status(200).json({ msg: "Dispositivo atualizado com sucesso.", device })
})

// DELETE /devices/:id → remove dispositivo por id
app.delete("/devices/:id", (req, res) => {
     const id = parseInt(req.params.id)
     const index = devices.findIndex(d => d.id === id)

     if (index === -1) {
          return res.status(404).json({ msg: "Dispositivo não encontrado." })
     }

     devices.splice(index, 1)
     res.status(200).json({ msg: "Dispositivo removido com sucesso." })
})

// =====================
// ROTAS DE USUÁRIOS
// =====================

// GET /usuarios → lista todos os usuários
app.get("/usuarios", (req, res) => {
     res.status(200).json(usuarios)
})

// GET /usuarios/:id → busca usuário por id
app.get("/usuarios/:id", (req, res) => {
     const id = parseInt(req.params.id)
     const usuario = usuarios.find(u => u.id === id)
     if (!usuario) return res.status(404).json({ msg: "Usuário não encontrado." })
     res.status(200).json(usuario)
})

// POST /usuarios → cria novo usuário
app.post("/usuarios", (req, res) => {
     const { nome, email, senha } = req.body
     if (!nome || !email || !senha) {
          return res.status(400).json({ msg: "Campos 'nome', 'email' e 'senha' são obrigatórios." })
     }
     const novoUsuario = { id: nextIdUsuario++, nome, email, senha }
     usuarios.push(novoUsuario)
     res.status(201).json({ msg: "Usuário criado com sucesso!", usuario: novoUsuario })
})

// PUT /usuarios/:id → edita usuário
app.put("/usuarios/:id", (req, res) => {
     const id = parseInt(req.params.id)
     const usuario = usuarios.find(u => u.id === id)
     if (!usuario) return res.status(404).json({ msg: "Usuário não encontrado." })

     const campos = ["nome", "email", "senha"]
     campos.forEach(campo => {
          if (req.body[campo] !== undefined) usuario[campo] = req.body[campo]
     })

     res.status(200).json({ msg: "Usuário atualizado com sucesso.", usuario })
})

// DELETE /usuarios/:id → remove usuário
app.delete("/usuarios/:id", (req, res) => {
     const id = parseInt(req.params.id)
     const index = usuarios.findIndex(u => u.id === id)
     if (index === -1) return res.status(404).json({ msg: "Usuário não encontrado." })
     usuarios.splice(index, 1)
     res.status(200).json({ msg: "Usuário removido com sucesso." })
})

// =====================
// INICIAR SERVIDOR
// =====================
const PORT = 8080
app.listen(PORT, () => {
     console.log(`Servidor IoT rodando em http://localhost:${PORT}`)
     console.log("Rotas disponíveis:")
     console.log("  GET    /usuarios")
     console.log("  GET    /usuarios/:id")
     console.log("  POST   /usuarios")
     console.log("  PUT    /usuarios/:id")
     console.log("  DELETE /usuarios/:id")
     console.log("  GET    /devices")
     console.log("  GET    /devices/:id")
     console.log("  POST   /devices")
     console.log("  PUT    /devices/:id")
     console.log("  PUT    /devices/:id/relay")
     console.log("  PUT    /devices/:id/connection")
     console.log("  DELETE /devices/:id")
})
