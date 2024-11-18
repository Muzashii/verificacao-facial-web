# Verificação Facial com Flask e Frontend Responsivo #
Este projeto permite o cadastro e verificação de usuários por reconhecimento facial, utilizando Flask no backend e um frontend responsivo. O sistema usa DeepFace para extração de representações faciais e Firebase para armazenamento.

# Funcionalidades
Cadastro: Envio de 3 imagens para registrar um usuário.

Verificação: Envio de imagem ou captura via webcam para autenticar o usuário.

Webcam Integrada: Capture uma foto diretamente pelo navegador.

Design Responsivo: Interface adaptável para diferentes dispositivos.

# Tecnologias
Backend: Python, Flask, DeepFace, Firebase.

Frontend: HTML, CSS, JavaScript.

# Como Rodar

1. Clone o Repositório

git clone https://github.com/seu-usuario/verificacao-facial.git

cd verificacao-facial

3. Instale as Dependências do Backend

Crie e ative um ambiente virtual:

Copiar código

python -m venv venv

venv\Scripts\activate 

Instale as dependências:

pip install -r requirements.txt

3. Configure o Firebase
   
Crie um projeto no Firebase.

Baixe o arquivo firebase_credentials.json e coloque na raiz do projeto.

5. Rode o Backend
   
python app.py

# Como Usar

Cadastro: Envie 3 imagens para registrar um novo usuário.

Verificação: Envie uma imagem ou use a webcam para autenticar.


