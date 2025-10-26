(function() {
    'use strict';

    let observadorAtivo = false;
    let timeoutCalculo;

    console.log('🚀 MusixMatch Calculator - CARREGADO!');

    // Funções de conversão (mantidas iguais)
    function timestampParaSegundos(timestamp) {
        if (!timestamp) return 0;
        const partes = timestamp.split(/[:.]/);
        if (partes.length >= 2) {
            const minutos = parseInt(partes[0]) || 0;
            const segundos = parseInt(partes[1]) || 0;
            const milesimos = parseInt(partes[2]) || 0;
            return minutos * 60 + segundos + milesimos / 1000;
        }
        return 0;
    }

    function segundosParaTimestamp(segundos) {
        const min = Math.floor(segundos / 60);
        const seg = Math.floor(segundos % 60);
        const cs = Math.floor((segundos % 1) * 100);
        return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
    }

    // FUNÇÃO PRINCIPAL - IDÊNTICA À ORIGINAL
    function calcularInstrumentais() {
        clearTimeout(timeoutCalculo);
        
        try {
            const linhas = document.querySelectorAll('.css-175oi2r.r-1xfd6ze.r-1awozwy.r-13awgt0.r-18u37iz.r-1h0z5md');

            if (linhas.length === 0) {
                setTimeout(calcularInstrumentais, 1000);
                return;
            }

            let instrumentaisEncontrados = 0;

            linhas.forEach((linha, index) => {
                const tagInstrumental = linha.querySelector('div.css-146c3p1.r-fdjqy7.r-a023e6.r-1kfrs79.r-1cwl3u0');

                if (tagInstrumental && tagInstrumental.textContent.trim() === 'Instrumental') {
                    instrumentaisEncontrados++;

                    // Remove cálculo anterior se existir
                    const calculoAnterior = linha.querySelector('.mxm-instrumental-calc');
                    if (calculoAnterior) {
                        calculoAnterior.remove();
                    }

                    const timestampElement = linha.querySelector('div.css-146c3p1.r-fdjqy7.r-a023e6.r-rjixqe');
                    if (!timestampElement) return;

                    const timestampAtual = timestampElement.textContent.trim();
                    const tempoAtualSegundos = timestampParaSegundos(timestampAtual);

                    let tempoProximaSegundos = null;
                    let encontrouProxima = false;

                    for (let i = index + 1; i < linhas.length; i++) {
                        const linhaAtual = linhas[i];
                        const tagAtual = linhaAtual.querySelector('div.css-146c3p1.r-fdjqy7.r-a023e6.r-1kfrs79.r-1cwl3u0');

                        if (!tagAtual || tagAtual.textContent.trim() !== 'Instrumental') {
                            const timestampProximo = linhaAtual.querySelector('div.css-146c3p1.r-fdjqy7.r-a023e6.r-rjixqe');
                            if (timestampProximo) {
                                tempoProximaSegundos = timestampParaSegundos(timestampProximo.textContent.trim());
                                encontrouProxima = true;
                                break;
                            }
                        }
                    }

                    if (!encontrouProxima) {
                        const tempoTotalElement = document.querySelector('[class*="duration"], [class*="total-time"]');
                        if (tempoTotalElement) {
                            const tempoTotalText = tempoTotalElement.textContent.match(/(\d+):(\d+)/);
                            if (tempoTotalText) {
                                tempoProximaSegundos = parseInt(tempoTotalText[1]) * 60 + parseInt(tempoTotalText[2]);
                            }
                        }
                    }

                    if (tempoProximaSegundos && tempoProximaSegundos > tempoAtualSegundos) {
                        const duracaoSegundos = tempoProximaSegundos - tempoAtualSegundos;

                        const calculoElement = document.createElement('div');
                        calculoElement.className = 'mxm-instrumental-calc';
                        calculoElement.style.cssText = `
                            position: absolute;
                            right: 10px;
                            top: 50%;
                            transform: translateY(-50%);
                            background: ${duracaoSegundos >= 15 ? '#4CAF50' : '#F44336'};
                            color: white;
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 11px;
                            font-weight: bold;
                            z-index: 1000;
                            white-space: nowrap;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            font-family: 'Courier New', monospace;
                            cursor: help;
                        `;

                        calculoElement.textContent = segundosParaTimestamp(duracaoSegundos);
                        calculoElement.title = `Duração: ${duracaoSegundos.toFixed(2)}s | ${duracaoSegundos >= 15 ? 'VÁLIDO' : 'INVÁLIDO'}`;

                        linha.style.position = 'relative';
                        linha.appendChild(calculoElement);
                    }
                }
            });

            if (instrumentaisEncontrados > 0) {
                console.log(`🎵 Instrumentais: ${instrumentaisEncontrados}`);
            }

        } catch (error) {
            console.error('Erro no cálculo:', error);
        }
    }

    // OBSERVADOR - IDÊNTICO AO ORIGINAL (ISSO É O SEGREDO!)
    function iniciarObservador() {
        if (observadorAtivo) return;

        try {
            const observer = new MutationObserver(function(mutations) {
                let deveRecalcular = false;

                for (let mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        deveRecalcular = true;
                        break;
                    }
                    if (mutation.type === 'characterData') { // ← CRÍTICO!
                        deveRecalcular = true;
                        break;
                    }
                }

                if (deveRecalcular) {
                    clearTimeout(timeoutCalculo);
                    timeoutCalculo = setTimeout(calcularInstrumentais, 300);
                }
            });

            // MESMA ESTRATÉGIA DE SELEÇÃO DO ORIGINAL
            const seletoresEditor = [
                '[class*="editor"]',
                '.r-1oszu61', 
                '[data-testid*="editor"]',
                'main',
                '#root'
            ];

            let editorContainer = null;
            for (let seletor of seletoresEditor) {
                editorContainer = document.querySelector(seletor);
                if (editorContainer) break;
            }

            if (!editorContainer) {
                editorContainer = document.body;
            }

            // CONFIGURAÇÃO IDÊNTICA - characterData É ESSENCIAL!
            observer.observe(editorContainer, {
                childList: true,
                subtree: true,
                characterData: true  // ← DETECTA MUDANÇAS DE TEXTO EM TEMPO REAL!
            });

            observadorAtivo = true;
            console.log('👀 Observador ATIVADO (configuração original)');

        } catch (error) {
            console.error('Erro no observador:', error);
        }
    }

    // INICIALIZAÇÃO - MANTENDO A ESTRATÉGIA ORIGINAL
    function inicializar() {
        console.log('⚡ Iniciando calculadora...');

        // Cálculo inicial
        calcularInstrumentais();
        
        // Observador
        iniciarObservador();

        // Backup periódico (10 segundos como no original)
        setInterval(calcularInstrumentais, 10000);

        // Event listeners do original
        document.addEventListener('click', function(e) {
            if (e.target.closest('button') || e.target.closest('[class*="play"]')) {
                setTimeout(calcularInstrumentais, 1000);
            }
        });

        // Monitor de URL do original
        let urlAnterior = window.location.href;
        setInterval(() => {
            if (window.location.href !== urlAnterior) {
                urlAnterior = window.location.href;
                setTimeout(() => {
                    calcularInstrumentais();
                    iniciarObservador();
                }, 2000);
            }
        }, 1000);

        console.log('🎉 Calculadora PRONTA (configuração original)');
    }

    // ESTRATÉGIA DE CARGA IDÊNTICA À ORIGINAL
    function iniciarScript() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(inicializar, 1000);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(inicializar, 1000);
            });
        }

        setTimeout(inicializar, 5000);
        window.addEventListener('load', function() {
            setTimeout(inicializar, 1000);
        });
    }

    // INICIA
    iniciarScript();

})();