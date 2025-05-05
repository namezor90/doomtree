/**
 * Segédfüggvények a DOM-fa megjelenítőhöz
 */

const DOMViewerUtils = {
    /**
     * Státuszüzenet megjelenítése
     * @param {string} message - Megjelenítendő üzenet
     * @param {string} type - Üzenet típusa ('info', 'error', 'warning', 'success')
     * @param {number} timeout - Automatikus eltüntetés ideje ms-ben (0 = nem tűnik el)
     */
    showStatus: function(message, type = 'info', timeout = 5000) {
        const statusArea = document.getElementById('status-area');
        statusArea.textContent = message;
        statusArea.style.display = 'block';
        
        // Típus szerinti stílus beállítása
        statusArea.className = 'status-area';
        if (type === 'error') {
            statusArea.classList.add('error-message');
        } else if (type === 'warning') {
            statusArea.classList.add('warning-message');
        } else if (type === 'success') {
            statusArea.classList.add('success-message');
        }
        
        // Naplózás a konzolra
        if (DOMViewerConfig.logToConsole) {
            if (type === 'error') {
                console.error(message);
            } else if (type === 'warning') {
                console.warn(message);
            } else if (type === 'success') {
                console.log('%c' + message, 'color: green');
            } else {
                console.log(message);
            }
        }
        
        // Automatikus elrejtés, ha a timeout nagyobb, mint 0
        if (timeout > 0) {
            setTimeout(() => {
                statusArea.style.display = 'none';
            }, timeout);
        }
        
        // Továbbítás a hibakereső panel konzolja felé is
        if (window.DebugPanel) {
            DebugPanel.log(message, type);
        }
    },
    
    /**
     * Kivételek biztonságos kezelése, naplózással
     * @param {function} fn - Végrehajtandó függvény
     * @param {string} errorMessage - Hibaüzenet hiba esetén
     * @param {boolean} showError - Hibaüzenet megjelenítése a felhasználó számára
     * @returns {*} A függvény visszatérési értéke vagy null hiba esetén
     */
    tryCatch: function(fn, errorMessage = 'Hiba történt', showError = true) {
        try {
            return fn();
        } catch (error) {
            const detailedError = `${errorMessage}: ${error.message}`;
            
            // Napló a konzolra
            console.error(detailedError);
            console.error(error.stack);
            
            // Felhasználói értesítés, ha szükséges
            if (showError) {
                this.showStatus(
                    DOMViewerConfig.errorHandling.showDetailedErrors ? detailedError : errorMessage, 
                    'error'
                );
            }
            
            // Hibaelhárítási módban további részletek
            if (DOMViewerConfig.debug && window.DebugPanel) {
                DebugPanel.logError(error);
            }
            
            return null;
        }
    },
    
    /**
     * Szöveg rövidítése megadott hosszra
     * @param {string} text - Rövidítendő szöveg
     * @param {number} maxLength - Maximális hossz
     * @returns {string} Rövidített szöveg
     */
    truncateText: function(text, maxLength = DOMViewerConfig.node.maxTextLength) {
        if (!text) return '';
        text = text.trim();
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    /**
     * DOM csomópont típusának szöveges neve
     * @param {number} nodeType - DOM csomópont típusa
     * @returns {string} Típus neve
     */
    getNodeTypeName: function(nodeType) {
        switch(nodeType) {
            case 1: return 'ELEMENT_NODE';
            case 3: return 'TEXT_NODE';
            case 8: return 'COMMENT_NODE';
            case 9: return 'DOCUMENT_NODE';
            case 10: return 'DOCTYPE_NODE';
            case 11: return 'DOCUMENT_FRAGMENT_NODE';
            default: return `ISMERETLEN_TÍPUS (${nodeType})`;
        }
    },
    
    /**
     * HTML kód formázása (színezés és behúzás)
     * @param {string} html - Formázandó HTML kód
     * @returns {string} Formázott HTML (csak megjelenítéshez)
     */
    formatHTML: function(html) {
        // Egyszerű HTML formázás, csak megjelenítési célokra
        if (!html) return '';
        
        // Speciális karakterek kezelése, hogy láthatóak legyenek
        html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Tagek színezése
        html = html.replace(/&lt;(\/?[a-zA-Z][a-zA-Z0-9]*)/g, 
            '<span style="color:var(--element-color)">&lt;$1</span>');
        
        // Attribútumok színezése
        html = html.replace(/([a-zA-Z-]+)="([^"]*)"/g, 
            '<span style="color:var(--attribute-color)">$1</span>="<span style="color:var(--text-node-color)">$2</span>"');
        
        return html;
    },
    
    /**
     * Objektum szép formázása JSON-ként
     * @param {object} obj - Formázandó objektum
     * @returns {string} Formázott JSON
     */
    formatObject: function(obj) {
        try {
            return JSON.stringify(obj, null, 2);
        } catch (error) {
            console.error('Hiba az objektum formázása során:', error);
            return 'Hiba az objektum formázása során';
        }
    },
    
    /**
     * UUID generálása (egyedi azonosító)
     * @returns {string} Egyedi azonosító
     */
    generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }