const express = require('express');
const cors = require('cors');
const api = express();

// Middlewares
api.use(express.json());
api.use(cors());

// === USUÁRIOS ===
const dadosUsuarios = [];
let idUsuario = 0;

api.get('/usuarios', (req, res) => res.status(200).send(dadosUsuarios));

api.post('/novoUsuario', (req, res) => {
    idUsuario++;
    const user = { id: idUsuario, ...req.body };
    dadosUsuarios.push(user);
    res.status(201).send({ code: 201, msg: "Usuário criado com sucesso!", user });
});

api.put('/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosUsuarios.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Usuário não encontrado" });

    dadosUsuarios[index] = { id, ...req.body };
    res.status(200).send({ code: 200, msg: "Usuário editado com sucesso!" });
});

api.delete('/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosUsuarios.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Usuário não encontrado" });

    dadosUsuarios.splice(index, 1);
    res.status(200).send({ code: 200, msg: "Usuário deletado com sucesso!" });
});

// === EQUIPAMENTOS ===
const dadosEquipamentos = [];
let idEquipamento = 0;

api.get('/equipamentos', (req, res) => res.status(200).send(dadosEquipamentos));

api.post('/equipamentos', (req, res) => {
    idEquipamento++;
    const equipamento = { id: idEquipamento, nome: req.body.nome };
    dadosEquipamentos.push(equipamento);
    res.status(201).send({ code: 201, msg: "Equipamento criado com sucesso!", equipamento });
});

api.put('/equipamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosEquipamentos.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Equipamento não encontrado" });

    dadosEquipamentos[index] = { id, ...req.body };
    res.status(200).send({ code: 200, msg: "Equipamento editado com sucesso!" });
});

api.delete('/equipamentos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosEquipamentos.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Equipamento não encontrado" });

    dadosEquipamentos.splice(index, 1);

    // Deleta dispositivos vinculados
    for (let i = dadosDispositivos.length - 1; i >= 0; i--) {
        if (dadosDispositivos[i].equipamentoId === id) dadosDispositivos.splice(i, 1);
    }

    res.status(200).send({ code: 200, msg: "Equipamento e dispositivos deletados" });
});

// === DISPOSITIVOS ===
const dadosDispositivos = [];
let idDispositivo = 0;

// GET dispositivos de um equipamento
api.get('/equipamentos/:id/dispositivos', (req, res) => {
    const equipamentoId = parseInt(req.params.id);
    const lista = dadosDispositivos.filter(d => d.equipamentoId === equipamentoId);
    res.status(200).send(lista);
});

// POST criar dispositivo em equipamento
api.post('/equipamentos/:id/dispositivos', (req, res) => {
    const equipamentoId = parseInt(req.params.id);
    idDispositivo++;

    const novoDispositivo = {
        id: idDispositivo,
        equipamentoId,
        statusDispositivo: req.body.statusDispositivo || "offline",
        sensores: {
            temperatura: req.body.sensores?.temperatura || 0,
            pressao: req.body.sensores?.pressao || 0,
            umidade: req.body.sensores?.umidade || 0,
            presenca: req.body.sensores?.presenca || false,
            rele: req.body.sensores?.rele || false
        },
        comandoLiberarConexao: req.body.comandoLiberarConexao || false,
        comandoLiberarRele: req.body.comandoLiberarRele || false
    };

    dadosDispositivos.push(novoDispositivo);
    res.status(201).send({ code: 201, msg: "Dispositivo criado com sucesso!", novoDispositivo });
});

// PUT atualizar dispositivo (sensores ou comandos)
api.put('/dispositivos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const disp = dadosDispositivos.find(d => d.id === id);
    if (!disp) return res.status(404).send({ code: 404, msg: "Dispositivo não encontrado" });

    if (req.body.statusDispositivo) disp.statusDispositivo = req.body.statusDispositivo;
    if (req.body.sensores) disp.sensores = { ...disp.sensores, ...req.body.sensores };
    if (req.body.comandoLiberarConexao !== undefined) disp.comandoLiberarConexao = req.body.comandoLiberarConexao;
    if (req.body.comandoLiberarRele !== undefined) disp.comandoLiberarRele = req.body.comandoLiberarRele;

    res.status(200).send({ code: 200, msg: "Dispositivo atualizado com sucesso!", disp });
});

// DELETE dispositivo
api.delete('/dispositivos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosDispositivos.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Dispositivo não encontrado" });

    dadosDispositivos.splice(index, 1);
    res.status(200).send({ code: 200, msg: "Dispositivo deletado com sucesso!" });
});

// === INICIAR API ===
const porta = 8080;
api.listen(porta, () => console.log(`API rodando na porta ${porta}`));