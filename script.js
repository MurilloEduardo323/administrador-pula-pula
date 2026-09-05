const firebaseConfig = {
    apiKey: "AIzaSyDeN9rHuLrMFMjyifSVykcQc9Ixd5mSMWg",
    authDomain: "brinquedos-murillo.firebaseapp.com",
    databaseURL: "https://brinquedos-murillo-default-rtdb.firebaseio.com",
    projectId: "brinquedos-murillo",
    storageBucket: "brinquedos-murillo.firebasestorage.app",
    messagingSenderId: "98837784075",
    appId: "1:98837784075:web:922a0dac507d280bd0c90e"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let todasReservas = [];
let editandoId = null;
let chartLucro = null;

function logar() {
    if(document.getElementById('senha').value === "123") {
        document.getElementById('login-area').classList.add('hidden');
        document.getElementById('painel').classList.remove('hidden');
        carregarDados();
    } else { alert("Senha incorreta!"); }
}

function carregarDados() {
    database.ref('reservas').on('value', snap => {
        todasReservas = [];
        snap.forEach(item => {
            todasReservas.push({ id: item.key, ...item.val() });
        });
        renderizarTabela();
        renderizarGrafico();
    });
}

function renderizarTabela() {
    const mesSel = document.getElementById('filtro-mes').value;
    const lista = document.getElementById('lista');
    lista.innerHTML = "";
    let somaGeral = 0, somaPago = 0, somaPendente = 0, somaFrete = 0;

    todasReservas.sort((a,b) => new Date(a.data) - new Date(b.data));

    todasReservas.forEach(res => {
        const mesData = res.data ? res.data.split('-')[1] : null;

        if(mesSel === "todos" || mesData === mesSel) {
            const valor = parseFloat(res.valorTotal) || 0;
            const frete = parseFloat(res.frete) || 0;
            somaGeral += valor;
            somaFrete += frete;
            if(res.pago) somaPago += valor; else somaPendente += valor;

            const telLimpo = res.telefone ? res.telefone.replace(/\D/g, '') : "";

            if(editandoId === res.id) {
                lista.innerHTML += `
                    <tr>
                        <td><b>${formatarData(res.data)}</b></td>
                        <td>
                            <b>${res.cliente}</b><br>
                            <a href="https://wa.me/55${telLimpo}" target="_blank" class="btn-whats-adm">📱 ${res.telefone}</a>
                        </td>
                        <td><small>${res.brinquedo}</small></td>
                        <td><input type="number" step="0.01" class="input-edicao" id="edit-valor-${res.id}" value="${valor.toFixed(2)}"></td>
                        <td><input type="number" step="0.01" class="input-edicao" id="edit-frete-${res.id}" value="${frete.toFixed(2)}"></td>
                        <td colspan="2">
                            <button class="btn-salvar" onclick="salvarEdicao('${res.id}')">💾 Salvar</button>
                            <button class="btn-cancelar" onclick="cancelarEdicao()">Cancelar</button>
                        </td>
                    </tr>`;
            } else {
                lista.innerHTML += `
                    <tr>
                        <td><b>${formatarData(res.data)}</b></td>
                        <td>
                            <b>${res.cliente}</b><br>
                            <a href="https://wa.me/55${telLimpo}" target="_blank" class="btn-whats-adm">📱 ${res.telefone}</a>
                        </td>
                        <td><small>${res.brinquedo}</small></td>
                        <td style="font-weight:bold; color:#27ae60">R$ ${valor.toFixed(2)}</td>
                        <td>R$ ${frete.toFixed(2)}</td>
                        <td>
                            <button class="${res.pago ? 'pago' : 'pendente'}" onclick="mudarStatus('${res.id}', ${res.pago})">
                                ${res.pago ? 'PAGO' : 'PENDENTE'}
                            </button>
                        </td>
                        <td>
                            <button class="btn-icone" onclick="editarValor('${res.id}')" title="Editar valores">✏️</button>
                            <button class="btn-icone" onclick="excluir('${res.id}')" title="Excluir">🗑️</button>
                        </td>
                    </tr>`;
            }
        }
    });

    document.getElementById('total-geral').innerText = `R$ ${somaGeral.toFixed(2)}`;
    document.getElementById('total-pago').innerText = `R$ ${somaPago.toFixed(2)}`;
    document.getElementById('total-pendente').innerText = `R$ ${somaPendente.toFixed(2)}`;
    document.getElementById('total-lucro').innerText = `R$ ${(somaGeral - somaFrete).toFixed(2)}`;
}

function editarValor(id) {
    editandoId = id;
    renderizarTabela();
}

function cancelarEdicao() {
    editandoId = null;
    renderizarTabela();
}

function salvarEdicao(id) {
    const inputValor = document.getElementById('edit-valor-' + id);
    const inputFrete = document.getElementById('edit-frete-' + id);
    const novoValor = parseFloat(inputValor.value.replace(',', '.')) || 0;
    const novoFrete = parseFloat(inputFrete.value.replace(',', '.')) || 0;

    database.ref('reservas/' + id).update({ valorTotal: novoValor, frete: novoFrete }).then(() => {
        editandoId = null;
    });
}

function formatarData(data) {
    if(!data) return "---";
    const p = data.split("-");
    return `${p[2]}/${p[1]}/${p[0]}`;
}

function mudarStatus(id, atual) { database.ref('reservas/'+id).update({ pago: !atual }); }
function excluir(id) { if(confirm("Excluir reserva?")) database.ref('reservas/'+id).remove(); }

// ---------- GRÁFICO DE LUCRO POR MÊS ----------

const NOMES_MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function agregarPorMes() {
    const mapa = {};
    todasReservas.forEach(res => {
        if(!res.data) return;
        const partes = res.data.split('-');
        if(partes.length < 2) return;
        const chave = `${partes[0]}-${partes[1]}`;
        if(!mapa[chave]) mapa[chave] = { total: 0, frete: 0 };
        mapa[chave].total += parseFloat(res.valorTotal) || 0;
        mapa[chave].frete += parseFloat(res.frete) || 0;
    });

    const chaves = Object.keys(mapa).sort();
    const labels = chaves.map(chave => {
        const [ano, mes] = chave.split('-');
        return `${NOMES_MESES[parseInt(mes, 10) - 1]}/${ano.slice(2)}`;
    });
    const lucro = chaves.map(chave => mapa[chave].total - mapa[chave].frete);
    const freteTotal = chaves.map(chave => mapa[chave].frete);

    return { labels, lucro, freteTotal };
}

function renderizarGrafico() {
    const { labels, lucro, freteTotal } = agregarPorMes();
    const filtro = document.getElementById('filtro-grafico').value;

    const datasets = [];
    if(filtro === 'ambos' || filtro === 'lucro') {
        datasets.push({
            label: 'Lucro (R$)',
            data: lucro,
            backgroundColor: '#27ae60'
        });
    }
    if(filtro === 'ambos' || filtro === 'frete') {
        datasets.push({
            label: 'Total de Frete (R$)',
            data: freteTotal,
            backgroundColor: '#e67e22'
        });
    }

    const ctx = document.getElementById('graficoLucro').getContext('2d');
    if(chartLucro) chartLucro.destroy();
    chartLucro = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => `R$ ${v}` }
                }
            }
        }
    });
}
