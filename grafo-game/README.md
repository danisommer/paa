# 🎮 GrafoQuest

Jogo educativo e interativo para estudar **Grafos** e **Algoritmos Gulosos** da disciplina
de **Projeto e Análise de Algoritmos (UTFPR)**. Jogável apenas com o mouse, 100% offline.

Três modos: **Missões** (campanha com 12 fases), **Arena de Algoritmos** (monte o algoritmo
arrastando blocos de pseudocódigo) e **Laboratório de Grafos** (construa o grafo e rode os
algoritmos passo a passo).

**Stack:** React + Vite · Tailwind CSS · D3.js (SVG) · Zustand · Framer Motion · lucide-react.

---

## 📋 Pré-requisitos

| Ferramenta | Versão recomendada | Observação |
|------------|--------------------|------------|
| **Node.js** | **18 LTS ou 20 LTS** | mínimo 18. Vem com o `npm`. |
| **npm**     | 9+                 | já incluído no Node |
| Navegador   | Chrome, Edge, Firefox (recente) | qualquer um moderno |

> Verifique o que já está instalado:
> ```bash
> node --version
> npm --version
> ```

> ⚠️ **Sobre o Tailwind:** este projeto usa **Tailwind CSS v3** (via PostCSS), que roda
> perfeitamente no **Node 18**. Se algum dia você migrar para o Tailwind v4
> (`@tailwindcss/vite`), será necessário **Node ≥ 20**.

---

## 🚀 Execução rápida (qualquer SO)

A partir da pasta do projeto (`grafo-game`):

```bash
npm install          # instala as dependências (só na 1ª vez)
npm run dev          # inicia o servidor de desenvolvimento na porta 5173
```

Abra no navegador: **http://localhost:5173**

Scripts disponíveis:

| Comando | O que faz |
|---------|-----------|
| `npm run dev`     | servidor de desenvolvimento com hot-reload (porta 5173) |
| `npm run build`   | gera a versão de produção otimizada em `dist/` |
| `npm run preview` | serve o conteúdo de `dist/` localmente (porta 5173) |

---

## 🪟 Windows (nativo, sem WSL)

1. **Instale o Node.js**
   - Opção A — site oficial: baixe o instalador **LTS** em <https://nodejs.org> e conclua o assistente.
   - Opção B — via **winget** (PowerShell):
     ```powershell
     winget install OpenJS.NodeJS.LTS
     ```
   - Feche e reabra o terminal depois de instalar.

2. **Abra o PowerShell** na pasta do projeto e rode:
   ```powershell
   cd caminho\para\grafo-game
   npm install
   npm run dev
   ```

3. Acesse **http://localhost:5173** no navegador.

> Se o PowerShell bloquear scripts do npm, rode uma vez (como usuário atual):
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

---

## 🐧 Windows + WSL2 (Ubuntu) — *configuração usada no desenvolvimento*

1. **Abra o terminal do Ubuntu (WSL)** e instale o Node (via nvm, recomendado):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   source ~/.bashrc
   nvm install --lts        # instala o Node LTS
   ```
   Ou via apt (versão pode ser mais antiga):
   ```bash
   sudo apt update && sudo apt install -y nodejs npm
   ```

2. **Entre na pasta do projeto e rode:**
   ```bash
   cd ~/prog/paa/grafo-game
   npm install
   npm run dev
   ```

3. Acesse **http://localhost:5173** no navegador do **Windows**.

> 💡 **Se `localhost:5173` não abrir no Windows** (acontece em algumas configurações de WSL2):
> use o **IP do WSL** que o Vite mostra na linha `Network:` ao iniciar, por exemplo
> `http://172.20.158.38:5173`. Para descobrir o IP manualmente:
> ```bash
> hostname -I
> ```
> O `vite.config.js` já está com `host: true`, então o servidor escuta em todas as interfaces.

---

## 🍎 macOS

1. **Instale o Node.js**
   - Via **Homebrew** (recomendado):
     ```bash
     brew install node
     ```
   - Ou baixe o instalador **LTS** em <https://nodejs.org>.

2. **No Terminal**, na pasta do projeto:
   ```bash
   cd /caminho/para/grafo-game
   npm install
   npm run dev
   ```

3. Acesse **http://localhost:5173**.

---

## 🐧 Linux

### Ubuntu / Debian
```bash
# Node LTS via NodeSource (versão atualizada)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

cd /caminho/para/grafo-game
npm install
npm run dev
```

### Fedora / RHEL
```bash
sudo dnf install -y nodejs npm
cd /caminho/para/grafo-game
npm install
npm run dev
```

### Arch / Manjaro
```bash
sudo pacman -S nodejs npm
cd /caminho/para/grafo-game
npm install
npm run dev
```

Depois acesse **http://localhost:5173**.

---

## 🛠️ Solução de problemas

| Problema | Solução |
|----------|---------|
| **`localhost:5173` não abre no Windows (WSL)** | Use o IP do WSL (`hostname -I`) → `http://<ip>:5173`. |
| **Porta 5173 ocupada** | O Vite escolhe outra porta automaticamente — veja a URL impressa no terminal. Ou finalize o processo que usa a porta. |
| **`command not found: npm`** | O Node não está instalado/no PATH. Reabra o terminal após instalar. |
| **Erro `Cannot find native binding` (oxide/Tailwind)** | Acontece com Tailwind **v4** no Node 18. Este projeto usa Tailwind **v3**, então não deve ocorrer. Se ocorrer, rode `rm -rf node_modules package-lock.json && npm install`. |
| **Tela em branco / mudanças não aparecem** | Hard-refresh no navegador (**Ctrl+Shift+R**) para limpar o cache. |
| **`npm install` muito lento ou falha** | Tente `npm install --no-audit --no-fund` ou troque de rede. |
| **Quero apagar meu progresso** | O progresso fica no `localStorage`. Use o botão **"Zerar progresso"** no menu, ou limpe os dados do site no navegador. |

---

## 📂 Estrutura do projeto

```
grafo-game/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                 # menu principal, barra de progresso, navegação
    ├── index.css
    ├── components/             # GraphCanvas (D3/SVG), StepPanel, blocos, drawer, etc.
    ├── modes/                  # MissionsMode, ArenaMode, LabMode
    ├── algorithms/             # geradores passo a passo: dijkstra, bfs, dfs, prim,
    │                           #   kruskal, kosaraju, topologicalSort, floydWarshall, huffman
    ├── store/                  # gameStore (Zustand + persistência em localStorage)
    └── data/                   # exampleGraphs, concepts, missions, arenaBlocks
```

---

## ℹ️ Notas

- **Funciona offline:** não há chamadas a APIs externas.
- **Resolução:** otimizado para telas de **1280px ou mais**.
- **Grafos de exemplo** são reconstruídos fielmente dos exercícios da prova
  (CFC da questão 1, grafo de Dijkstra/Prim/Kruskal das listas, fábrica e rede de gás).
- **Salvamento:** missões concluídas, pontuações e configurações são salvas automaticamente
  no `localStorage` do navegador.
