/**
 * Hibakereső panel modul a DOM-fa megjelenítőhöz
 * Fejlett hibakeresési és diagnosztikai eszközök
 */

const DebugPanel = {
    /**
     * Panel DOM elemei
     */
    panel: null,
    domStructureTab: null,
    parsedDataTab: null,
    consoleTab: null,
    
    /**
     * Inicializálja a hibakereső panelt
     */
    init: function() {
        // Csak debug módban inicializáljuk
        if (!DOMViewerConfig.debug) return;
        
        this.panel = document.getElementById('debug-panel');
        this.domStructureTab = document.getElementById('dom-structure-content');
        this.parsedDataTab = document.getElementById('parsed-data-content');
        this.consoleTab = document.getElementById('console-content');
        
        // Panel bezárása gomb
        const closeBtn = this.panel.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePanel());
        }
        
        // Tab kezelés
        const tabs = this.panel.querySelectorAll('.debug-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => this._switchTab(tab.dataset.tab));
        });
        
        // Konzol törlése gomb
        const clearConsoleBtn = document.getElementById('clear-console');
        if (clearConsoleBtn) {
            clearConsoleBtn.addEventListener('click', () => this.clearConsole());
        }
        
        console.log('DebugPanel inicializálva');
    },
    
    /**
     * Panel megjelenítése
     */
    showPanel: function() {
        if (!DOMViewerConfig.debug) return;
        this.panel.style.display = 'block';
    },
    
    /**
     * Panel elrejtése
     */
    hidePanel: function() {
        this.panel.style.display = 'none';
    },
    
    /**
     * Tab váltása
     * @private
     */
    _switchTab: function(tabId) {
        // Aktív tab és tartalom kiválasztása
        const tabs = this.panel.querySelectorAll('.debug-tab');
        const contents = this.panel.querySelectorAll('.debug-content');
        
        // Összes tab és tartalom inaktívvá tétele
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        
        // Kiválasztott tab és tartalom aktiválása
        this.panel.querySelector(`.debug-tab[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    },
    
    /**
     * DOM-szerkezet frissítése a hibakereső panelen
     * @param {object} domTree - Feldolgozott DOM-fa
     */
    updateDOMStructure: function(domTree) {
        if (!DOMViewerConfig.debug || !this.domStructureTab) return;
        
        try {
            // DOM struktúra generálása
            this.domStructureTab.innerHTML = this._generateDOMTreeHTML(domTree);
            
            // Kattintás kezelő hozzáadása a kibontható csomópontokhoz
            const items = this.domStructureTab.querySelectorAll('.tree-item');
            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const parent = e.currentTarget;
                    const children = parent.querySelector('.tree-children');
                    if (children) {
                        children.style.display = children.style.display === 'none' ? 'block' : 'none';
                        
                        // + vagy - ikon megjelenítése
                        const icon = parent.querySelector('.tree-icon');
                        if (icon) {
                            icon.textContent = children.style.display === 'none' ? '+' : '-';
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Hiba a DOM struktúra frissítése során:', error);
            this.log('Hiba a DOM struktúra frissítése során: ' + error.message, 'error');
        }
    },
    
    /**
     * HTML kód generálása a DOM fa megjelenítéséhez
     * @private
     */
    _generateDOMTreeHTML: function(node, level = 0) {
        if (!node) return '';
        
        let html = '';
        const indent = level * 20; // Behúzás szintje
        
        // Csomópont típus szerinti megjelenítés
        let nodeClass = '';
        let nodeText = '';
        
        if (node.nodeType === 1) { // Element
            nodeClass = 'element';
            nodeText = `<span class="${nodeClass}">&lt;${node.tagName.toLowerCase()}</span>`;
            
            // Attribútumok hozzáadása
            if (node.attributes && node.attributes.length > 0) {
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    nodeText += ` <span class="attribute">${attr.name}="${attr.value}"</span>`;
                }
            }
            
            nodeText += '<span class="element">&gt;</span>';
        } else if (node.nodeType === 3) { // Text
            nodeClass = 'text';
            nodeText = `<span class="${nodeClass}">"${DOMViewerUtils.truncateText(node.textContent)}"</span>`;
        } else if (node.nodeType === 8) { // Comment
            nodeClass = 'comment';
            nodeText = `<span class="${nodeClass}">&lt;!-- ${DOMViewerUtils.truncateText(node.textContent)} --&gt;</span>`;
        } else {
            nodeClass = 'other';
            nodeText = `<span class="${nodeClass}">${node.nodeName}</span>`;
        }
        
        // Csomópont megjelenítése
        html += `<div class="tree-item" data-node-id="${node.uniqueId}" style="margin-left: ${indent}px;">`;
        
        // Ha van gyermek, + ikon megjelenítése
        if (node.children && node.children.length > 0) {
            html += `<span class="tree-icon">-</span> `;
        } else {
            html += `<span class="tree-spacer">&nbsp;&nbsp;</span> `;
        }
        
        html += `${nodeText}`;
        html += `</div>`;
        
        // Gyermekek rekurzív megjelenítése
        if (node.children && node.children.length > 0) {
            html += `<div class="tree-children" style="display: block;">`;
            for (let i = 0; i < node.children.length; i++) {
                html += this._generateDOMTreeHTML(node.children[i], level + 1);
            }
            html += `</div>`;
        }
        
        return html;
    },
    
    /**
     * Elemzett adatok frissítése a hibakereső panelen
     * @param {object} data - Elemzett adatok
     */
    updateParsedData: function(data) {
        if (!DOMViewerConfig.debug || !this.parsedDataTab) return;
        
        try {
            // Adatok JSON formátumban
            const formattedData = DOMViewerUtils.formatObject(data);
            this.parsedDataTab.textContent = formattedData;
        } catch (error) {
            console.error('Hiba az elemzett adatok frissítése során:', error);
            this.log('Hiba az elemzett adatok frissítése során: ' + error.message, 'error');
        }
    },
    
    /**
     * Üzenet naplózása a hibakereső konzolra
     * @param {string} message - Naplózandó üzenet
     * @param {string} type - Üzenet típusa ('info', 'error', 'warning')
     */
    log: function(message, type = 'info') {
        if (!DOMViewerConfig.debug || !this.consoleTab) return;
        
        try {
            const now = new Date();
            const timestamp = now.toLocaleTimeString();
            
            // Új log bejegyzés létrehozása
            const logEntry = document.createElement('div');
            logEntry.className = `console-log console-${type}`;
            logEntry.innerHTML = `[${timestamp}] ${message}`;
            
            // Hozzáadás a konzolhoz
            this.consoleTab.appendChild(logEntry);
            
            // Görgetés az aljára
            this.consoleTab.scrollTop = this.consoleTab.scrollHeight;
        } catch (error) {
            console.error('Hiba a konzol naplózás során:', error);
        }
    },
    
    /**
     * Hiba naplózása részletes hiba objektummal
     * @param {Error} error - Hiba objektum
     */
    logError: function(error) {
        if (!DOMViewerConfig.debug) return;
        
        this.log(`Hiba: ${error.message}`, 'error');
        
        // Stack trace hozzáadása, ha elérhető
        if (error.stack) {
            this.log(`Stack: ${error.stack}`, 'error');
        }
    },
    
    /**
     * Konzol törlése
     */
    clearConsole: function() {
        if (!DOMViewerConfig.debug || !this.consoleTab) return;
        this.consoleTab.innerHTML = '';
    }
};

// Exportálás globális változóként
window.DebugPanel = DebugPanel;
