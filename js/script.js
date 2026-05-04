// DADOS
const dashboardData = [
  {
    quarter: "Q1_2025",
    regionais: [
      {nome:"SP1 CARD",  nota:76.9, atingimento:0.769},
      {nome:"SP2 CARD",  nota:83.5,  atingimento:0.835},
      {nome:"RJ ES CARD",nota:78.0,  atingimento:0.780},
      {nome:"RS CARD",   nota:72.1,  atingimento:0.721},
      {nome:"CO CARD",   nota:91.9,  atingimento:0.919},
      {nome:"NE CARD",   nota:81.9,  atingimento:0.819},
      {nome:"RJ ES MOVILWAY",nota:78.6,  atingimento:0.786},
      {nome:"MG MOVILWAY",   nota:81.9,  atingimento:0.819},
      {nome:"RS MOVILWAY",   nota:84.1,  atingimento:0.841},
      {nome:"CO MOVILWAY",   nota:85.2,  atingimento:0.852},
    ]
  },
  {
    quarter: "Q2_2025",
    regionais: [
      {nome:"SP1",  nota:81.60, atingimento:0.816},
      {nome:"SP2",  nota:84.8,  atingimento:0.848},
      {nome:"RJ ES",nota:75.3,  atingimento:0.753},
      {nome:"MG",   nota:87.2,  atingimento:0.872},
      {nome:"PR SC",nota:90.4,  atingimento:0.904},
      {nome:"RS",   nota:85.8,  atingimento:0.858},
      {nome:"CO",   nota:89.8,  atingimento:0.898},
      {nome:"NE",   nota:84.5,  atingimento:0.845}
    ]
  },
  {
    quarter: "Q3_2025",
    regionais: [
      {nome:"SP1",  nota:85.2, atingimento:0.852},
      {nome:"SP2",  nota:93.7, atingimento:0.937},
      {nome:"RJ ES",nota:77.4, atingimento:0.774},
      {nome:"MG",   nota:88.6, atingimento:0.886},
      {nome:"PR SC",nota:93.0, atingimento:0.930},
      {nome:"RS",   nota:93.1, atingimento:0.931},
      {nome:"CO",   nota:90.7, atingimento:0.907},
      {nome:"NE",   nota:96.1, atingimento:0.961}
    ]
  },
  {
    quarter: "Q4_2025",
    regionais: [
      {nome:"SP1",  nota:85.2, atingimento:0.852},
      {nome:"SP2",  nota:93.7, atingimento:0.937},
      {nome:"RJ ES",nota:77.4, atingimento:0.774},
      {nome:"MG",   nota:88.6, atingimento:0.886},
      {nome:"PR SC",nota:93.0, atingimento:0.930},
      {nome:"RS",   nota:93.1, atingimento:0.931},
      {nome:"CO",   nota:90.7, atingimento:0.907},
      {nome:"NE",   nota:96.1, atingimento:0.961}
    ]
  },
  {
    quarter: "Q1_2026",
    regionais: [
      {nome:"SP1",  nota:79.1, atingimento:0.791},
      {nome:"SP2",  nota:86.5, atingimento:0.865},
      {nome:"RJ ES",nota:84.6, atingimento:0.846},
      {nome:"MG",   nota:82.2, atingimento:0.822},
      {nome:"PR SC",nota:85.0, atingimento:0.850},
      {nome:"RS",   nota:87.2, atingimento:0.872},
      {nome:"CO",   nota:83.5, atingimento:0.835},
      {nome:"NE",   nota:85.7, atingimento:0.857}
    ]
  }
];

// REGRAS DE NEGÓCIO (classificação, cálculos)
const REGRAS = {
  antiga: {
    label: 'Regra Antiga',
    faixas: [
      {nome:'Black',    min:85, max:100, rem:2.10, classe:'badge-black'},
      {nome:'Platinum', min:75, max:84.99, rem:1.70, classe:'badge-platinum'},
      {nome:'Advanced', min:65, max:74.99, rem:1.30, classe:'badge-advanced'},
      {nome:'Basic',    min:55, max:64.99, rem:0.80, classe:'badge-basic'},
      {nome:'Light',    min:0,  max:54.99, rem:0.00, classe:'badge-light'}
    ],
    descricao: 'Black ≥85 | Platinum ≥75 | Advanced ≥65 | Basic ≥55 | Light &lt;55',
    bannerClass: 'nova',
    icon: '🆕'
  },
  nova: {
    label: 'Regra Nova',
    faixas: [
      {nome:'Black',    min:90, max:100, rem:2.10, classe:'badge-black'},
      {nome:'Platinum', min:80, max:89.99, rem:1.70, classe:'badge-platinum'},
      {nome:'Advanced', min:70, max:79.99, rem:1.30, classe:'badge-advanced'},
      {nome:'Basic',    min:60, max:69.99, rem:0.80, classe:'badge-basic'},
      {nome:'Light',    min:0,  max:59.99, rem:0.00, classe:'badge-light'}
    ],
    descricao: 'Black ≥90 | Platinum ≥80 | Advanced ≥70 | Basic ≥60 | Light &lt;60',
    bannerClass: 'antiga',
    icon: '📋'
  }
};

// ESTADO GLOBAL
let regraAtiva   = 'nova';
let quarterAtivo = 'Q1_2026';
let regionalAtiva = 'TODAS';
let regionalChart    = null;
let distributionChart = null;

// FUNÇÕES AUXILIARES
function getClassificacao(regra, nota) {
    if (!REGRAS[regra] || typeof nota !== 'number') return null;
    const faixas = REGRAS[regra].faixas;
    return faixas.find(f => nota >= f.min) || faixas[faixas.length - 1];
}

function getRemuneracao(regra, nomeClassificacao) {
    if (!REGRAS[regra]) return 0;
    const faixa = REGRAS[regra].faixas.find(f => f.nome === nomeClassificacao);
    return faixa ? faixa.rem : 0;
}

function getBarColor(regra, nota) {
    const c = getClassificacao(regra, nota);
    if (!c) return '#9CA3AF';
    const colorMap = {
        Black: '#1A1A1A', Platinum: '#BCC6CC',
        Advanced: '#3B82F6', Basic: '#10B981', Light: '#9CA3AF'
    };
    return colorMap[c.nome] || '#9CA3AF';
}

// CÁLCULO NOTA FINAL
function calcularNotaFinal(regionais) {
    if (!Array.isArray(regionais) || regionais.length === 0) return null;
    const notas = regionais.map(r => r.nota).filter(n => typeof n === 'number');
    if (notas.length === 0) return null;
    const media = notas.reduce((a, b) => a + b, 0) / notas.length;
    const maiorNota = Math.max(...notas);
    const menorNota = Math.min(...notas);
    const diferenca = maiorNota - menorNota;

    const todasBlack    = regionais.every(r => r.nota >= 90);
    const todasPlatinum = regionais.every(r => r.nota >= 80 && r.nota < 90);
    const mesmaFaixa    = todasBlack || todasPlatinum;

    let notaFinal = media;
    let penalizacao = false;
    if (diferenca >= 4 && !mesmaFaixa) {
        notaFinal = media - 3;
        penalizacao = true;
    }

    return { media, notaFinal, diferenca, penalizacao, maiorNota, menorNota, mesmaFaixa };
}

// FILTRAR REGIONAIS
function getRegionaisAtivas(data) {
    if (!data || !data.regionais) return [];
    if (regionalAtiva === 'TODAS') return data.regionais;
    return data.regionais.filter(r => r && r.nome === regionalAtiva);
}

// INSIGHTS
function gerarInsights(resultado, regionais, regra) {
    if (!resultado || !Array.isArray(regionais) || !REGRAS[regra]) return [];
    const regLabel = REGRAS[regra].label;
    const classificacao = getClassificacao(regra, resultado.notaFinal);
    if (!classificacao) return [];
    const insights = [];

    insights.push(`<strong>${regLabel}</strong> — Nota final consolidada: <strong>${resultado.notaFinal.toFixed(1)}</strong> → Classificação <strong>${classificacao.nome}</strong> (R$ ${classificacao.rem.toFixed(2)} por ativação).`);

    if (resultado.penalizacao) {
        insights.push(`Penalização de <strong>-3 pontos</strong> aplicada: variação entre regionais foi de ${resultado.diferenca.toFixed(1)} pts e não estão na mesma faixa. Média bruta: ${resultado.media.toFixed(1)}.`);
    } else {
        if (resultado.diferenca >= 4) {
            insights.push(`Diferença de ${resultado.diferenca.toFixed(1)} pts entre regionais, mas <strong>sem penalização</strong> pois estão na mesma faixa de classificação.`);
        } else {
            insights.push(`Desempenho <strong>equilibrado</strong>: variação de apenas ${resultado.diferenca.toFixed(1)} pts entre regionais — sem penalização.`);
        }
    }

    if (regionais.length > 1) {
        const melhor = regionais.reduce((p, c) => (p.nota > c.nota) ? p : c);
        const pior   = regionais.reduce((p, c) => (p.nota < c.nota) ? p : c);
        if (melhor && pior) {
            insights.push(`🏆 Melhor desempenho: <strong>${melhor.nome}</strong> com ${melhor.nota.toFixed(1)} pts (${getClassificacao(regra, melhor.nota)?.nome || 'N/A'}).`);
            insights.push(`⚠️ Oportunidade de melhoria: <strong>${pior.nome}</strong> com ${pior.nota.toFixed(1)} pts (${getClassificacao(regra, pior.nota)?.nome || 'N/A'}).`);
        }
    }

    // Impacto da mudança de regra
    const regraAlternativa = regra === 'nova' ? 'antiga' : 'nova';
    const classAlt = getClassificacao(regraAlternativa, resultado.notaFinal);
    if (classAlt && classAlt.nome !== classificacao.nome) {
        const sentido = regra === 'nova' ? 'sobe' : 'cai';
        insights.push(`💡 Comparativo: pela <strong>${REGRAS[regraAlternativa].label}</strong>, a classificação seria <strong>${classAlt.nome}</strong> (R$ ${classAlt.rem.toFixed(2)}) — ${sentido === 'sobe' ? 'mais favorável na regra nova' : 'mais favorável na regra antiga'}.`);
    } else {
        insights.push(`💡 Comparativo: a classificação <strong>${classificacao.nome}</strong> é a mesma em ambas as regras para esta nota final.`);
    }

    return insights;
}

// ATUALIZAR BANNER
function atualizarBanner() {
    const regra = REGRAS[regraAtiva];
    if (!regra) return;
    const banner = document.getElementById('ruleBanner');
    if (!banner) return;
    banner.className = `rule-banner ${regra.bannerClass}`;
    const textEl = document.getElementById('ruleBannerText');
    if (textEl) textEl.innerHTML = `<strong>${regra.icon} ${regra.label} ativa</strong> — ${regra.descricao}`;

    // Legenda de cores
    const colorMap = {Black:'#1A1A1A', Platinum:'#BCC6CC', Advanced:'#3B82F6', Basic:'#10B981', Light:'#9CA3AF'};
    const legendEl = document.getElementById('ruleLegend');
    if (legendEl) {
        legendEl.innerHTML = regra.faixas.map(f =>
            `<span class="legend-item"><span class="legend-dot" style="background:${colorMap[f.nome] || '#9CA3AF'}"></span>${f.nome}: R$${f.rem.toFixed(2)}</span>`
        ).join('');
    }
}

// ATUALIZAR FILTROS
function atualizarFiltros(data) {
    if (!data || !data.regionais) return;
    const nomes = ['TODAS', ...data.regionais.map(r => r ? r.nome : null).filter(Boolean)];
    const bar = document.getElementById('filterBar');
    if (!bar) return;
    bar.innerHTML = '<span class="filter-label">🔍 Filtrar Regional:</span>' +
        nomes.map(n =>
            `<button class="filter-btn ${n === regionalAtiva ? 'active' : ''}"
                     onclick="setRegional('${n.replace(/'/g, '\\\'')}')">${n === 'TODAS' ? '🌎 Todas' : n}</button>`
        ).join('');
}

// RENDERIZAÇÃO (KPIs, tabela, gráficos)
function updateDashboard() {
    const data = dashboardData.find(d => d && d.quarter === quarterAtivo);
    if (!data) return;

    atualizarBanner();
    atualizarFiltros(data);

    const regionais = getRegionaisAtivas(data);
    if (!regionais.length) return;

    const resultado = calcularNotaFinal(regionais);
    if (!resultado) return;

    const classificacao = getClassificacao(regraAtiva, resultado.notaFinal);
    if (!classificacao) return;
    const remuneracao   = classificacao.rem;

    // KPIs
    const kpiGrid = document.getElementById('kpiGrid');
    if (kpiGrid) {
        kpiGrid.innerHTML = `
            <div class="kpi-card">
                <div class="kpi-label">Nota Final</div>
                <div class="kpi-value large">${resultado.notaFinal.toFixed(1)}</div>
                <div class="kpi-info">Média bruta: ${resultado.media.toFixed(1)}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Classificação — ${REGRAS[regraAtiva].label}</div>
                <div class="kpi-value"><span class="kpi-badge ${classificacao.classe}">${classificacao.nome}</span></div>
                <div class="kpi-info">${classificacao.nome === 'Black' ? 'Excelência operacional' :
                                        classificacao.nome === 'Platinum' ? 'Desempenho superior' : 'Bom desempenho'}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Remuneração por Ativação</div>
                <div class="kpi-value">R$ ${remuneracao.toFixed(2)}</div>
                <div class="kpi-info">Conforme tabela do programa</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Variação entre Regionais</div>
                <div class="kpi-value">${resultado.diferenca.toFixed(1)}</div>
                <div class="kpi-info">
                    <span class="${resultado.penalizacao ? 'trend-down' : 'trend-up'}">
                        ${resultado.penalizacao ? '⚠️ Penalização -3 pts aplicada' : '✓ Sem penalização'}
                    </span>
                </div>
            </div>
        `;
    }

    // INSIGHTS
    const insights = gerarInsights(resultado, regionais, regraAtiva);
    const insightsCard = document.getElementById('insightsCard');
    if (insightsCard) {
        insightsCard.innerHTML = `
            <div class="insights-title"><span>💡</span> Análise Inteligente — ${REGRAS[regraAtiva].label}</div>
            <ul class="insights-list">${insights.map(i => `<li>${i}</li>`).join('')}</ul>
        `;
    }

    // TABELA
    const regraAlternativa = regraAtiva === 'nova' ? 'antiga' : 'nova';
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        tableBody.innerHTML = [...regionais]
            .sort((a, b) => b.nota - a.nota)
            .map(r => {
                if (!r) return '';
                const cls = getClassificacao(regraAtiva, r.nota);
                if (!cls) return '';
                const clsAlt = getClassificacao(regraAlternativa, r.nota);
                const status = r.nota >= (regraAtiva === 'nova' ? 85 : 90) ? 'success' :
                               r.nota >= (regraAtiva === 'nova' ? 75 : 80) ? 'warning' : 'danger';
                const scoreClass = r.nota >= (regraAtiva === 'nova' ? 85 : 90) ? 'score-high' :
                                   r.nota >= (regraAtiva === 'nova' ? 75 : 80) ? 'score-medium' : 'score-low';

                let compareTag = '';
                if (clsAlt && cls.nome !== clsAlt.nome) {
                    const up = REGRAS[regraAtiva].faixas.indexOf(REGRAS[regraAtiva].faixas.find(f => f.nome === cls.nome))
                             < REGRAS[regraAlternativa].faixas.indexOf(REGRAS[regraAlternativa].faixas.find(f => f.nome === clsAlt.nome));
                    compareTag = `<span class="compare-tag ${up ? 'compare-up' : 'compare-down'}">
                        ${up ? '▲' : '▼'} ${clsAlt.nome}
                    </span>`;
                } else if (clsAlt) {
                    compareTag = `<span class="compare-tag compare-same">= ${clsAlt.nome}</span>`;
                }

                return `<tr>
                    <td><span class="status-dot status-${status}"></span></td>
                    <td><strong>${r.nome.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong></td>
                    <td class="score-cell ${scoreClass}">${r.nota.toFixed(1)}</td>
                    <td><span class="kpi-badge ${cls.classe}">${cls.nome}</span>${compareTag}</td>
                    <td>R$ ${cls.rem.toFixed(2)}</td>
                    <td>${(r.atingimento * 100).toFixed(1)}%</td>
                    <td>
                        <span class="kpi-badge ${clsAlt ? clsAlt.classe : ''}" style="opacity:0.7;font-size:0.68rem">
                            ${clsAlt ? clsAlt.nome : 'N/A'} · R$ ${clsAlt ? clsAlt.rem.toFixed(2) : '0.00'}
                        </span>
                    </td>
                </tr>`;
            }).join('');
    }

    // GRÁFICO DE BARRAS
    const labels = regionais.map(r => r ? r.nome : '').filter(Boolean);
    const valores = regionais.map(r => r ? r.nota : 0).filter(n => typeof n === 'number');
    const cores = regionais.map(r => r ? getBarColor(regraAtiva, r.nota) : '#9CA3AF');

    if (regionalChart) regionalChart.destroy();
    const regionalCanvas = document.getElementById('regionalChart');
    if (regionalCanvas) {
        regionalChart = new Chart(regionalCanvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Nota por Regional',
                    data: valores,
                    backgroundColor: cores,
                    borderRadius: 8,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1A1A1A',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        borderColor: '#C40000',
                        borderWidth: 2,
                        callbacks: {
                            label: ctx => {
                                const c = getClassificacao(regraAtiva, ctx.raw);
                                const cAlt = getClassificacao(regraAtiva === 'nova' ? 'antiga' : 'nova', ctx.raw);
                                return [
                                    `Nota: ${ctx.raw.toFixed(1)}`,
                                    `Classificação (${REGRAS[regraAtiva].label}): ${c ? c.nome : 'N/A'}`,
                                    `Classificação (${REGRAS[regraAtiva === 'nova' ? 'antiga' : 'nova'].label}): ${cAlt ? cAlt.nome : 'N/A'}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true, max: 100,
                        grid: { color: '#E5E7EB', drawBorder: false },
                        ticks: { font: { size: 12 }, color: '#6B7280' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 12, weight: 'bold' }, color: '#1A1A1A' }
                    }
                }
            }
        });
    }

    // GRÁFICO DE DISTRIBUIÇÃO
    const distribuicao = regionais.reduce((acc, r) => {
        if (!r) return acc;
        const nome = getClassificacao(regraAtiva, r.nota)?.nome || 'N/A';
        acc[nome] = (acc[nome] || 0) + 1;
        return acc;
    }, {});

    const colorMap = {
        Black:'#1A1A1A', Platinum:'#BCC6CC',
        Advanced:'#3B82F6', Basic:'#10B981', Light:'#9CA3AF'
    };

    if (distributionChart) distributionChart.destroy();
    const distributionCanvas = document.getElementById('distributionChart');
    if (distributionCanvas) {
        distributionChart = new Chart(distributionCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(distribuicao),
                datasets: [{
                    data: Object.values(distribuicao),
                    backgroundColor: Object.keys(distribuicao).map(k => colorMap[k] || '#9CA3AF'),
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { size: 13, weight: '600' },
                            color: '#1A1A1A',
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1A1A1A',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        borderColor: '#C40000',
                        borderWidth: 2,
                        callbacks: {
                            label: ctx => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                return `${ctx.raw} regional(is) — ${((ctx.raw/total)*100).toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// EVENTOS
function setRegra(regra) {
    if (!REGRAS[regra]) return;
    regraAtiva = regra;
    const btnNova = document.getElementById('btnNova');
    const btnAntiga = document.getElementById('btnAntiga');
    if (btnNova) btnNova.classList.toggle('active', regra === 'nova');
    if (btnAntiga) btnAntiga.classList.toggle('active', regra === 'antiga');
    updateDashboard();
}

function setRegional(nome) {
    regionalAtiva = nome;
    updateDashboard();
}

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('quarterSelector');
    if (selector) {
        selector.addEventListener('change', e => {
            quarterAtivo = e.target.value;
            regionalAtiva = 'TODAS'; // reset filtro ao trocar ciclo
            updateDashboard();
        });
    }
});

// INICIALIZAÇÃO
updateDashboard();