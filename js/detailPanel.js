/**
 * Részletpanel modul a DOM-fa megjelenítőhöz
 * Megjeleníti a kiválasztott DOM csomópont részleteit
 */

const DetailPanel = {
    /**
     * Panel DOM elemei
     */
    panel: null,
    contentArea: null,
    propsArea: null,
    titleArea: null,
    
    /**
     * Inicializálja a részletpanelt
     */
    init: function() {
        this.panel = document.getElementById('detail-panel');
        this.contentArea = document.getElementById('detail-content');
        this.propsArea = document.getElementById('detail-props');
        this.titleArea = this.panel.querySelector('.detail-title');
        
        // Panel bezárása gomb
        const closeBtn = this.panel.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePanel());
        }
        
        console.log('DetailPanel inicializálva');
    },
    
    /**
     * Csomópont részleteinek megjelenítése
     * @param {Object} node - DOM csomópont adatok
     */
    showNodeDetails: function(node) {
        if (!node) return;
        
        try {
            // Panel címének beállítása
            this._setTitle(node);
            
            // Tartalom megjelenítése
            this._setContent(node);
            
            // Tulajdonságok megjelenítése
            this._setProperties(node);
            
            // Panel megjelenítése
            this.panel.style.display = 'block';
        } catch (error) {
            console.error('Hiba a részletek megjelenítése során:', error);
            DOMViewerUtils.showStatus('Hiba a csomópont részleteinek megjelenítése során: ' + error.message, 'error');
        }
    },
    
    /**
     * Panel elrejtése
     */
    hidePanel: function() {
        this.panel.style.display = 'none';
    },
    
    /**
     * Panel címének beállítása
     * @private
     */
    _setTitle: function(node) {
        const nodeType = node.nodeType;
        
        if (nodeType === 1) { // Element
            this.titleArea.textContent = `<${node.tagName.toLowerCase()}> Elem részletei`;
        } else if (nodeType === 3) { // Text
            this.titleArea.textContent = 'Szövegcsomópont részletei';
        } else if (nodeType === 8) { // Comment
            this.titleArea.textContent = 'Megjegyzés részletei';
        } else {
            this.titleArea.textContent = `Csomópont részletei (Típus: ${DOMViewerUtils.getNodeTypeName(nodeType)})`;
        }
    },
    
    /**
     * Tartalom beállítása
     * @private
     */
    _setContent: function(node) {
        const nodeType = node.nodeType;
        let contentHtml = '';
        
        if (nodeType === 1) { // Element
            // Elem részleteinek megjelenítése
            let openTag = `<${node.tagName.toLowerCase()}`;
            
            // Attribútumok hozzáadása
            if (node.attributes && node.attributes.length > 0) {
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    openTag += ` ${attr.name}="${attr.value}"`;
                }
            }
            
            openTag += '>';
            contentHtml = openTag;
            
            // Tartalom és záró tag
            contentHtml += '\n  ...\n';
            contentHtml += `</${node.tagName.toLowerCase()}>`;
        } else if (nodeType === 3) { // Text
            // Szövegcsomópont tartalmának megjelenítése
            contentHtml = node.textContent;
        } else if (nodeType === 8) { // Comment
            // Megjegyzés tartalmának megjelenítése
            contentHtml = `<!-- ${node.textContent} -->`;
        } else {
            contentHtml = `Node type: ${nodeType}, Name: ${node.nodeName}`;
        }
        
        this.contentArea.textContent = contentHtml;
    },
    
    /**
     * Tulajdonságok beállítása
     * @private
     */
    _setProperties: function(node) {
        const nodeType = node.nodeType;
        let propsHtml = '';
        
        if (nodeType === 1) { // Element
            // Elem tulajdonságainak listázása
            propsHtml += this._createPropRow('Típus', 'Element');
            propsHtml += this._createPropRow('Tag', node.tagName.toLowerCase());
            propsHtml += this._createPropRow('Egyedi ID', node.uniqueId);
            
            if (node.attributes && node.attributes.length > 0) {
                propsHtml += '<div class="prop-row"><div class="prop-name">Attribútumok:</div><div>';
                
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    propsHtml += `${attr.name}="${attr.value}"<br>`;
                }
                
                propsHtml += '</div></div>';
            }
            
            if (node.children && node.children.length > 0) {
                propsHtml += this._createPropRow('Gyermekek', node.children.length);
            }
        } else if (nodeType === 3) { // Text
            // Szövegcsomópont tulajdonságainak listázása
            propsHtml += this._createPropRow('Típus', 'Text');
            propsHtml += this._createPropRow('Egyedi ID', node.uniqueId);
            propsHtml += this._createPropRow('Hossz', node.textContent.length + ' karakter');
            
            // Eredeti szöveg megjelenítése
            const originalText = node.textContent;
            if (originalText.length > 100) {
                propsHtml += this._createPropRow('Tartalom (első 100 karakter)', originalText.substring(0, 100) + '...');
            } else {
                propsHtml += this._createPropRow('Tartalom', originalText);
            }
        } else if (nodeType === 8) { // Comment
            // Megjegyzés tulajdonságainak listázása
            propsHtml += this._createPropRow('Típus', 'Comment');
            propsHtml += this._createPropRow('Egyedi ID', node.uniqueId);
            propsHtml += this._createPropRow('Hossz', node.textContent.length + ' karakter');
        }
        
        this.propsArea.innerHTML = propsHtml;
    },
    
    /**
     * Tulajdonság sor HTML-jének előállítása
     * @private
     */
    _createPropRow: function(name, value) {
        return `<div class="prop-row"><div class="prop-name">${name}:</div><div>${value}</div></div>`;
    }
};

// Exportálás globális változóként
window.DetailPanel = DetailPanel;
