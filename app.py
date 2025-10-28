from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)


DATABASE = 'database.db'


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Tabela 
def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            descricao TEXT,
            imagem TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Rota frontend
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# Rota 
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# GET 
@app.route('/produtos', methods=['GET'])
def listar_produtos():
    conn = get_db_connection()
    produtos = conn.execute('SELECT * FROM produtos').fetchall()
    conn.close()
    
    produtos_list = []
    for produto in produtos:
        produtos_list.append({
            'id': produto['id'],
            'nome': produto['nome'],
            'preco': produto['preco'],
            'descricao': produto['descricao'],
            'imagem': produto['imagem']
        })
    
    return jsonify(produtos_list)

# POST 
@app.route('/produtos', methods=['POST'])
def cadastrar_produto():
    dados = request.get_json()
    
    nome = dados.get('nome')
    preco = dados.get('preco')
    descricao = dados.get('descricao', '')
    imagem = dados.get('imagem', '')
    
    if not nome or not preco:
        return jsonify({'erro': 'Nome e preço são obrigatórios'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO produtos (nome, preco, descricao, imagem) VALUES (?, ?, ?, ?)',
        (nome, preco, descricao, imagem)
    )
    conn.commit()
    produto_id = cursor.lastrowid
    conn.close()
    
    return jsonify({
        'id': produto_id,
        'nome': nome,
        'preco': preco,
        'descricao': descricao,
        'imagem': imagem
    }), 201

# PUT
@app.route('/produtos/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    dados = request.get_json()
    
    nome = dados.get('nome')
    preco = dados.get('preco')
    descricao = dados.get('descricao', '')
    imagem = dados.get('imagem', '')
    
    if not nome or not preco:
        return jsonify({'erro': 'Nome e preço são obrigatórios'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE produtos SET nome = ?, preco = ?, descricao = ?, imagem = ? WHERE id = ?',
        (nome, preco, descricao, imagem, id)
    )
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'erro': 'Produto não encontrado'}), 404
    
    conn.close()
    
    return jsonify({
        'id': id,
        'nome': nome,
        'preco': preco,
        'descricao': descricao,
        'imagem': imagem
    })

# DELETE - Remover produto
@app.route('/produtos/<int:id>', methods=['DELETE'])
def deletar_produto(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM produtos WHERE id = ?', (id,))
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'erro': 'Produto não encontrado'}), 404
    
    conn.close()
    return jsonify({'mensagem': 'Produto deletado com sucesso'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)