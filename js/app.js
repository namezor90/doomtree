/**
 * DOM-fa Megjelenítő Fő Alkalmazás Modul
 * Az alkalmazás belépési pontja, eseménykezelők és inicializálás
 */

// Biztonsági ellenőrzés, hogy a szükséges függőségek elérhetők-e
// JAVÍTVA: DOMParser helyett DOMTreeParser név használata
if (!window.DOMViewerUtils || !window.DOMTreeParser || !window.DOMVisualizer) {
    console.error('Hiba: A szükséges DOM-fa Megjelenítő modulok nem érhetők el!');
    alert('Hiba: A szükséges modulok nem töltődtek be! Kérjük, frissítse az oldalt vagy ellenőrizze a konzolt.');
}

/**
 * DOM-fa Megjelenítő Alkalmazás
 * Az alkalmazás fő logikája és állapotkezelése
 */
const DOMViewerApp = {
    /**
     * Inicializálja az alkalmazást
     */
    init: function() {
        // Modulok inicializálása
        DOMVisualizer.init();
        DetailPanel.init();
        
        // Hibakereső panel inicializálása, ha a debug mód engedélyezve van
        if (DOMViewerConfig.debug) {
            DebugPanel.init();
        }
        
        // Eseménykezelők beállítása
        this._setupEventHandlers();
        
        console.log('DOM-fa Megjelenítő Alkalmazás inicializálva');
    },
    
    /**
     * Beállítja az eseménykezelőket
     * @private
     */
    _setupEventHandlers: function() {
        // DOM megjelenítő gomb
        const visualizeBtn = document.getElementById('visualize-btn');
        if (visualizeBtn) {
            visualizeBtn.addEventListener('click', this._handleVisualize.bind(this));
        }
        
        // Példák betöltése gombok
        const simpleExampleBtn = document.getElementById('simple-example');
        if (simpleExampleBtn) {
            simpleExampleBtn.addEventListener('click', () => {
                document.getElementById('html-input').value = DOMViewerExamples.simple;
            });
        }
        
        const nestedExampleBtn = document.getElementById('nested-example');
        if (nestedExampleBtn) {
            nestedExampleBtn.addEventListener('click', () => {
                document.getElementById('html-input').value = DOMViewerExamples.nested;
            });
        }
        
        const currentPageBtn = document.getElementById('current-page');
        if (currentPageBtn) {
            currentPageBtn.addEventListener('click', () => {
                document.getElementById('html-input').value = DOMViewerExamples.getCurrentPageHTML();
            });
        }
        
        // Zoom vezérlők
        const zoomInBtn = document.getElementById('zoom-in');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => DOMVisualizer.zoom(DOMViewerConfig.animation.zoomFactor));
        }
        
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => DOMVisualizer.zoom(1 / DOMViewerConfig.animation.zoomFactor));
        }
        
        const zoomResetBtn = document.getElementById('zoom-reset');
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => DOMVisualizer.resetZoom());
        }
        
        // Kibontás/összecsukás gombok
        const expandAllBtn = document.getElementById('expand-all');
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => DOMVisualizer.expandAll());
        }
        
        const collapseAllBtn = document.getElementById('collapse-all');
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => DOMVisualizer.collapseNodes());
        }
        
        // Hibakereső panel gomb
        const debugBtn = document.getElementById('debug-btn');
        if (debugBtn && DOMViewerConfig.debug) {
            debugBtn.addEventListener('click', () => DebugPanel.showPanel());
            debugBtn.style.display = 'block';
        } else if (debugBtn) {
            debugBtn.style.display = 'none';
        }
    },
    
    /**
     * DOM vizualizáció kezelése
     * @private
     */
    _handleVisualize: function() {
        // HTML kód beszerzése
        const htmlInput = document.getElementById('html-input').value.trim();
        
        if (!htmlInput) {
            DOMViewerUtils.showStatus('Kérjük, adjon meg HTML kódot!', 'error');
            return;
        }
        
        // Elemzés és megjelenítés
        try {
            // HTML elemzése DOM-fává
            // JAVÍTVA: DOMParser helyett DOMTreeParser használata
            const treeData = DOMTreeParser.createTreeData(htmlInput);
            
            // Ha sikeres az elemzés, vizualizáljuk
            if (treeData) {
                DOMVisualizer.visualizeDomTree(treeData);
            } else {
                throw new Error('A DOM-fa nem hozható létre. Ellenőrizze a HTML kódot!');
            }
        } catch (error) {
            console.error('Hiba a DOM-fa feldolgozása során:', error);
            DOMViewerUtils.showStatus('Hiba a DOM-fa feldolgozása során: ' + error.message, 'error');
            
            // Hibakeresési mód jelzése, ha engedélyezve van
            if (DOMViewerConfig.debug) {
                DOMViewerUtils.showStatus('A hibakeresési mód engedélyezve van! Kattintson a "Hibakeresés" gombra a részletekért.', 'warning', 10000);
            }
        }
    }
};

// Alkalmazás indítása, amikor a DOM betöltődött
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Kísérlet az alkalmazás indítására
        DOMViewerApp.init();
        
        // Konzol üzenet fejlesztőknek
        if (DOMViewerConfig.debug) {
            console.log('%c DOM-fa Megjelenítő (Fejlesztői mód) ', 'background: #4a6fa5; color: white; padding: 5px; border-radius: 3px;');
            console.log('Hiba esetén nyisd meg a hibakereső panelt a "Hibakeresés" gombbal!');
        }
    } catch (error) {
        // Hiba kezelése az inicializálás során
        console.error('Kritikus hiba az alkalmazás indítása során:', error);
        
        // Felhasználói értesítés
        const errorMessage = 'Hiba történt az alkalmazás betöltése során. Részletek a konzolban.';
        alert(errorMessage);
        
        // Státuszüzenet, ha a DOMViewerUtils már betöltődött
        if (window.DOMViewerUtils) {
            DOMViewerUtils.showStatus(errorMessage, 'error', 0);
        }
    }
});