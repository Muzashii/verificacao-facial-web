document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    const mensagem = document.getElementById('mensagem');
    const imagemPrev = document.getElementById('imagemPrev');
    const imagemCapturada = document.getElementById('imagemCapturada');
    const webcam = document.getElementById('webcam');
    const capturaCanvas = document.getElementById('capturaCanvas');
    const pararWebcam = document.getElementById('pararWebcam');
    const imagemPreviaContainer = document.querySelector('.imagem-previa');
    let stream = null;

    // Função para mostrar ou esconder o loading
    function mostrarLoading(mostrar) {
        loading.classList.toggle('hidden', !mostrar);
    }

    // Função para exibir mensagens de sucesso ou erro
    function exibirMensagem(texto, sucesso = true) {
        mensagem.classList.remove('hidden');
        mensagem.classList.toggle('sucesso', sucesso);
        mensagem.classList.toggle('erro', !sucesso);
        mensagem.querySelector('p').textContent = texto;

        setTimeout(() => mensagem.classList.add('hidden'), 5000);
    }

    // Função de Cadastro
    document.getElementById('formCadastro').addEventListener('submit', function (event) {
        event.preventDefault();
        mostrarLoading(true);
        console.log('Iniciando cadastro...');

        const nome = document.getElementById('nome').value;
        const imagens = document.getElementById('imagens').files;

        if (imagens.length < 3) {
            exibirMensagem('Envie pelo menos 3 imagens.', false);
            mostrarLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('nome', nome);
        for (let i = 0; i < imagens.length; i++) {
            formData.append('imagens', imagens[i]);
        }

        fetch('/cadastrar', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                console.log('Resposta recebida:', response);
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(data => {
                console.log('Dados do servidor:', data);
                exibirMensagem(data.mensagem, true);
            })
            .catch(error => {
                console.error('Erro durante o cadastro:', error);
                exibirMensagem('Erro no cadastro: ' + error.message, false);
            })
            .finally(() => {
                console.log('Finalizando cadastro.');
                mostrarLoading(false);
            });
    });

    // Função de Verificação
    document.getElementById('formVerificacao').addEventListener('submit', function (event) {
        event.preventDefault();
        mostrarLoading(true);
        console.log('Iniciando verificação...');

        const nome = document.getElementById('nome_verificacao').value;
        const imagemArquivo = document.getElementById('imagem_verificacao').files[0];
        const formData = new FormData();
        formData.append('nome', nome);

        if (stream) {
            capturaCanvas.width = webcam.videoWidth;
            capturaCanvas.height = webcam.videoHeight;
            capturaCanvas.getContext('2d').drawImage(webcam, 0, 0);
            capturaCanvas.toBlob((blob) => {
                formData.append('imagem', blob);
                enviarVerificacao(formData);
            });
        } else if (imagemArquivo) {
            formData.append('imagem', imagemArquivo);
            enviarVerificacao(formData);
        } else {
            exibirMensagem('Selecione uma imagem ou use a webcam para verificar.', false);
            mostrarLoading(false);
        }
    });

    // Função para enviar a verificação
    function enviarVerificacao(formData) {
        fetch('/verificar', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                exibirMensagem(data.mensagem, data.mensagem === 'Usuário verificado com sucesso');
            })
            .catch(error => {
                console.error('Erro na verificação:', error);
                exibirMensagem('Erro na verificação: ' + error.message, false);
            })
            .finally(() => {
                mostrarLoading(false);
            });
    }

    // Função de Exibição da Pré-visualização
    document.getElementById('imagem_verificacao').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                imagemPrev.src = reader.result;
                imagemPreviaContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // Habilitar Webcam
    document.getElementById('capturaWebcam').addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((mediaStream) => {
                stream = mediaStream;
                webcam.srcObject = stream;
                webcam.classList.remove('hidden');
                imagemCapturada.classList.add('hidden');
                capturaCanvas.classList.add('hidden');
                pararWebcam.classList.remove('hidden');
            })
            .catch((error) => {
                console.error('Erro ao acessar a webcam:', error);
                exibirMensagem('Erro ao acessar a webcam.', false);
            });
    });

    // Parar Webcam
    pararWebcam.addEventListener('click', () => {
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            webcam.classList.add('hidden');
            pararWebcam.classList.add('hidden');
            imagemCapturada.classList.add('hidden');
            stream = null;
        }
    });
});
