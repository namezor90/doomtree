/**
 * DOM elemző modul a DOM-fa megjelenítőhöz
 */

const DOMParser = {
    /**
     * Egyedi azonosító számláló
     */
    _nodeId: 0,
    
    /**
     * HTML kód elemzése DOM-fává
     * @param {string} htmlString - A feldolgozandó HTML kód
     * @returns {object|null} - A feldolgozott DOM fa vagy null hiba esetén
     */
    parseHTML: function(htmlString) {
        return DOMViewerUtils.tryCatch(() => {
            // Visszaállítjuk a számlálót minden új elemzésnél
            this._nodeId = 0;
            
            // HTML elemzése a böngésző beépített DOM parserével
            const parser = new window.DOMParser();
            let doc;
            
            try {
                doc = parser.parseFromString(htmlString, 'text/html');
                
                // Ellenőrizzük, hogy a parser nem dobott-e hibát
                const parserError = doc.querySelector('parsererror');
                if (parserError) {
                    throw new Error('HTML elemzési hiba: ' + parserError.textContent);
                }
            } catch (e) {
                throw new Error('HTML elemzési hiba: ' + e.message);
            }
            
            // A gyökérelem a HTML elem
            const rootNode = doc.documentElement;
            
            // Rekurzív elemzés időtúllépéssel
            const startTime = Date.now();
            const result = this._processNode(rootNode, 0, startTime);
            
            // Debug információk
            if (DOMViewerConfig.debug) {
                console.log(`DOM elemzés kész: ${this._nodeId} csomópont feldolgozva`);
                
                // Hibakeresési adatok frissítése
                if (window.DebugPanel) {
                    DebugPanel.updateParsedData(result);
                }
            }
            
            return result;
        }, 'Hiba történt a HTML elemzése során');
    },
    
    /**
     * Rekurzív csomópont feldolgozás
     * @param {Node} node - A feldolgozandó DOM csomópont
     * @param {number} level - Beágyazási szint
     * @param {number} startTime - Kezdési idő (timeout kezeléshez)
     * @returns {object} - A feldolgozott csomópont adatokkal
     */
    _processNode: function(node, level, startTime) {
        // Időtúllépés ellenőrzése
        if (Date.now() - startTime > DOMViewerConfig.parser.timeout) {
            throw new Error(`Időtúllépés a DOM elemzése során: több mint ${DOMViewerConfig.parser.timeout}ms`);
        }
        
        // Maximális beágyazási szint ellenőrzése
        if (level > DOMViewerConfig.parser.maxNestingLevel) {
            return {
                nodeType: -1, // Speciális típus a túl mély beágyazás jelzésére
                nodeName: "MAX_NESTING_LEVEL",
                textContent: `A maximális beágyazási szint elérve (${DOMViewerConfig.parser.maxNestingLevel})`,
                uniqueId: ++this._nodeId,
                children: []
            };
        }
        
        // Új csomópont létrehozása az eredeti alapján, kiegészítve adatokkal
        const processedNode = {
            nodeType: node.nodeType,
            nodeName: node.nodeName,
            textContent: node.textContent,
            uniqueId: ++this._nodeId,
            children: []
        };
        
        // Elem specifikus feldolgozás
        if (node.nodeType === 1) { // Element node
            processedNode.tagName = node.tagName;
            
            // Attribútumok másolása
            if (node.attributes && node.attributes.length > 0) {
                processedNode.attributes = [];
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    processedNode.attributes.push({
                        name: attr.name,
                        value: attr.value
                    });
                }
            }
        }
        
        // Gyermek elemek rekurzív feldolgozása
        if (node.childNodes && node.childNodes.length > 0) {
            for (let i = 0; i < node.childNodes.length; i++) {
                const childNode = node.childNodes[i];
                
                // Szűrés a beállítások alapján
                if (this._shouldProcessNode(childNode)) {
                    processedNode.children.push(
                        this._processNode(childNode, level + 1, startTime)
                    );
                }
            }
        }
        
        return processedNode;
    },
    
    /**
     * Ellenőrzi, hogy egy csomópontot fel kell-e dolgozni
     * @param {Node} node - Ellenőrizendő csomópont
     * @returns {boolean} - True, ha a csomópontot fel kell dolgozni
     */
    _shouldProcessNode: function(node) {
        // Elem csomópontokat mindig feldolgozzuk
        if (node.nodeType === 1) {
            return true;
        }
        
        // Szövegcsomópontok kezelése
        if (node.nodeType === 3) { // TEXT_NODE
            // Üres szövegcsomópontokat kihagyjuk, ha a konfiguráció szerint
            if (DOMViewerConfig.parser.skipWhitespace && node.textContent.trim() === '') {
                return false;
            }
            return true;
        }
        
        // Megjegyzés csomópontok kezelése a beállítás szerint
        if (node.nodeType === 8) { // COMMENT_NODE
            return DOMViewerConfig.node.showComments;
        }
        
        // Egyéb csomóponttípusokat általában nem dolgozunk fel
        return false;
    },
    
    /**
     * HTML kód elemzése és hierarchia létrehozása a fastruktúrához
     * @param {string} htmlString - A feldolgozandó HTML kód
     * @returns {object} - D3.js hierarchikus struktúra
     */
    createTreeData: function(htmlString) {
        // HTML elemzése DOM struktúrává
        const domTree = this.parseHTML(htmlString);
        if (!domTree) return null;
        
        // Hibakeresési információk frissítése
        if (DOMViewerConfig.debug && window.DebugPanel) {
            DebugPanel.updateDOMStructure(domTree);
        }
        
        return domTree;
    }
};

// Exportálás globális változóként
window.DOMParser = DOMParser;
