class ProductManager {
    constructor() {
        this.baseURL = 'http://localhost:5000';
        this.isEditing = false;
        this.currentProductId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.carregarProdutos();
    }

    bindEvents() {
        document.getElementById('produto-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarProduto();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.cancelarEdicao();
        });
    }

    async carregarProdutos() {
        try {
            this.mostrarLoading(true);
            const response = await fetch(`${this.baseURL}/produtos`);
            const produtos = await response.json();
            this.exibirProdutos(produtos);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            alert('Erro ao carregar produtos');
        } finally {
            this.mostrarLoading(false);
        }
    }

    async salvarProduto() {
        const formData = this.getFormData();
        
        if (!this.validarFormulario(formData)) {
            return;
        }

        try {
            const url = this.isEditing 
                ? `${this.baseURL}/produtos/${this.currentProductId}`
                : `${this.baseURL}/produtos`;
            
            const method = this.isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.limparFormulario();
                this.carregarProdutos();
                this.cancelarEdicao();
                alert(this.isEditing ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
            } else {
                throw new Error('Erro ao salvar produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar produto');
        }
    }

    async deletarProduto(id) {
        if (!confirm('Tem certeza que deseja excluir este produto?')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/produtos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.carregarProdutos();
                alert('Produto excluído com sucesso!');
            } else {
                throw new Error('Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir produto');
        }
    }

    editarProduto(produto) {
        this.isEditing = true;
        this.currentProductId = produto.id;

        document.getElementById('produto-id').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('preco').value = produto.preco;
        document.getElementById('descricao').value = produto.descricao || '';
        document.getElementById('imagem').value = produto.imagem || '';

        document.getElementById('form-title').textContent = 'Editar Produto';
        document.getElementById('submit-btn').textContent = 'Atualizar Produto';
        document.getElementById('cancel-btn').style.display = 'inline-block';

        // Scroll para o formulário
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    cancelarEdicao() {
        this.isEditing = false;
        this.currentProductId = null;
        this.limparFormulario();

        document.getElementById('form-title').textContent = 'Cadastrar Novo Produto';
        document.getElementById('submit-btn').textContent = 'Cadastrar Produto';
        document.getElementById('cancel-btn').style.display = 'none';
    }

    getFormData() {
        return {
            nome: document.getElementById('nome').value.trim(),
            preco: parseFloat(document.getElementById('preco').value),
            descricao: document.getElementById('descricao').value.trim(),
            imagem: document.getElementById('imagem').value.trim()
        };
    }

    validarFormulario(data) {
        if (!data.nome) {
            alert('Por favor, informe o nome do produto');
            return false;
        }

        if (!data.preco || data.preco <= 0) {
            alert('Por favor, informe um preço válido');
            return false;
        }

        return true;
    }

    limparFormulario() {
        document.getElementById('produto-form').reset();
        document.getElementById('produto-id').value = '';
    }

    exibirProdutos(produtos) {
        const container = document.getElementById('produtos-container');
        const noProducts = document.getElementById('no-products');

        if (produtos.length === 0) {
            container.innerHTML = '';
            noProducts.style.display = 'block';
            return;
        }

        noProducts.style.display = 'none';
        container.innerHTML = produtos.map(produto => this.criarCardProduto(produto)).join('');
    }

    criarCardProduto(produto) {
        const imagem = produto.imagem 
            ? `<img src="${produto.imagem}" alt="${produto.nome}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : '';

        const imagemPlaceholder = produto.imagem 
            ? `<div class="product-image default-image" style="display: none;"></div>`
            : `<div class="product-image default-image"></div>`;

        return `
            <div class="product-card">
                ${imagem}
                ${imagemPlaceholder}
                <div class="product-name">${this.escapeHtml(produto.nome)}</div>
                <div class="product-price">R$ ${produto.preco.toFixed(2)}</div>
                <div class="product-description">${this.escapeHtml(produto.descricao || 'Sem descrição')}</div>
                <div class="product-actions">
                    <button class="edit-btn" onclick="productManager.editarProduto(${this.escapeHtml(JSON.stringify(produto))})">
                        ✏️ Editar
                    </button>
                    <button class="delete-btn" onclick="productManager.deletarProduto(${produto.id})">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `;
    }

    mostrarLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar o gerenciador de produtos
const productManager = new ProductManager();