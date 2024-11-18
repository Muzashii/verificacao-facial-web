from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from firebase_admin import credentials, firestore, initialize_app
from deepface import DeepFace
import numpy as np
from scipy.spatial.distance import cosine

# Inicializar o aplicativo Flask
app = Flask(__name__)
CORS(app)

# Configuração do Firebase
cred = credentials.Certificate("reconhecimento-facial.json")
initialize_app(cred)
db = firestore.client()

# Criar pasta para salvar imagens, se não existir
os.makedirs('fotos', exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')  # Certifique-se de que o arquivo index.html está na pasta templates/

# Função para extrair representações faciais
def extrair_representacao(caminho_imagem):
    try:
        resultados = DeepFace.represent(img_path=caminho_imagem, model_name='Facenet', enforce_detection=False)
        if resultados:
            return resultados[0]['embedding']
    except Exception as e:
        print(f"Erro ao extrair representação: {e}")
    return None

# Rota para cadastrar um usuário com 3 imagens
@app.route('/cadastrar', methods=['POST'])
def cadastrar_usuario():
    nome = request.form['nome']
    arquivos = request.files.getlist('imagens')  # Recebe múltiplos arquivos

    if len(arquivos) < 3:
        return jsonify({'mensagem': 'Envie pelo menos 3 imagens'}), 400

    embeddings = []

    for arquivo in arquivos:
        caminho_imagem = os.path.join('fotos', arquivo.filename)
        arquivo.save(caminho_imagem)

        # Extrair embeddings de cada imagem
        representacao = extrair_representacao(caminho_imagem)
        if representacao is None:
            return jsonify({'mensagem': f'Nenhum rosto encontrado na imagem {arquivo.filename}'}), 400

        embeddings.append(representacao)

    # Calcular a média dos embeddings
    embedding_medio = np.mean(embeddings, axis=0)

    # Salvar os dados no Firebase
    db.collection('usuarios').document(nome).set({'rosto': embedding_medio.tolist()})

    return jsonify({'mensagem': 'Usuário cadastrado com sucesso'})

# Rota para verificar um usuário
@app.route('/verificar', methods=['POST'])
def verificar_usuario():
    nome = request.form['nome']
    arquivo = request.files['imagem']
    caminho_imagem = os.path.join('fotos', arquivo.filename)
    arquivo.save(caminho_imagem)

    # Obter os dados do usuário do Firebase
    usuario_doc = db.collection('usuarios').document(nome).get()
    if not usuario_doc.exists:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404

    dados = usuario_doc.to_dict()
    rosto_cadastrado = dados.get('rosto')
    if rosto_cadastrado is None:
        return jsonify({'mensagem': 'Nenhum rosto cadastrado para este usuário'}), 400

    # Extrair representação da imagem enviada
    representacao = extrair_representacao(caminho_imagem)
    if representacao is None:
        return jsonify({'mensagem': 'Nenhum rosto encontrado na imagem enviada'}), 400

    # Calcular a distância entre os embeddings
    distancia = cosine(rosto_cadastrado, representacao)

    # Ajustar a tolerância (threshold)
    THRESHOLD = 0.55  # Ajuste conforme necessário

    # Verificar similaridade
    if distancia < THRESHOLD:
        return jsonify({'mensagem': 'Usuário verificado com sucesso'})
    else:
        return jsonify({'mensagem': 'Rosto não corresponde ao cadastrado'}), 400

# Iniciar o servidor
if __name__ == '__main__':
    app.run(debug=True)
