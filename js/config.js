/**
 * DOM-fa Megjelenítő Konfiguráció
 * Globális konfigurációs beállítások a DOM-fa megjelenítőhöz
 */

const DOMViewerConfig = {
    // Alapvető beállítások
    debug: true,                  // Hibakeresési mód engedélyezése
    logToConsole: true,           // Naplózás a konzolra
    
    // Fa elrendezés beállítások
    layout: {
        default: 'tree',          // Alapértelmezett elrendezés: 'tree', 'horizontal', 'radial'
        nodeSizeVertical: 60,     // Függőleges csomópont méret
        nodeSizeHorizontal: 150,  // Vízszintes csomópont méret
        radialRadius: 300,        // Sugaras elrendezés sugara
        separationFactor: 1.2,    // Csomópontok közötti távolság szorzó
    },
    
    // Csomópont megjelenítési beállítások
    node: {
        showAttributes: true,     // Attribútumok megjelenítése
        showTextNodes: true,      // Szövegcsomópontok megjelenítése
        showComments: false,      // Megjegyzések megjelenítése
        maxTextLength: 15,        // Maximális szöveghossz rövidítés nélkül
        maxAttrsShown: 3,         // Maximálisan megjelenítendő attribútumok száma
    },
    
    // Animációs beállítások
    animation: {
        duration: 500,            // Animáció ideje ms-ben
        zoomFactor: 1.2,          // Nagyítási faktor kattintáskor
    },
    
    // Hibakeresési beállítások
    errorHandling: {
        showDetailedErrors: true, // Részletes hibaüzenetek megjelenítése
        alertOnError: false,      // Figyelmeztető ablak hiba esetén
        recoveryMode: true,       // Hibajavítási kísérletek engedélyezése
    },
    
    // DOM-elemzés beállítások
    parser: {
        skipWhitespace: true,     // Üres szövegcsomópontok kihagyása
        maxNestingLevel: 100,     // Maximális beágyazási szint
        timeout: 5000,            // Időtúllépés ms-ben nagy DOM-fák esetén
    }
};

// Exportálás globális változóként a további fájlok számára
window.DOMViewerConfig = DOMViewerConfig;
