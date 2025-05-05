/**
 * Példa DOM struktúrák a DOM-fa megjelenítőhöz
 */

const DOMViewerExamples = {
    /**
     * Egyszerű HTML példa
     */
    simple: `<!DOCTYPE html>
<html>
<head>
    <title>Egyszerű példa</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Üdvözöljük a DOM megjelenítőben!</h1>
    <p>Ez egy egyszerű példa a <strong>DOM-fa</strong> vizualizációjához.</p>
    <div class="container">
        <ul>
            <li>Első elem</li>
            <li>Második elem</li>
        </ul>
        <!-- Ez egy megjegyzés -->
        <button id="btn" class="primary-btn">Kattints ide</button>
    </div>
</body>
</html>`,

    /**
     * Összetett HTML példa többszintű beágyazással
     */
    nested: `<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <title>Összetett DOM példa</title>
    <style>
        .container { color: blue; }
    </style>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">Főoldal</a></li>
                <li><a href="#about">Rólunk</a></li>
                <li><a href="#contact">Kapcsolat</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="welcome">
            <h1>Üdvözöljük</h1>
            <p>Lorem ipsum <em>dolor</em> sit amet.</p>
            <!-- Főoldali tartalom -->
            <div class="features">
                <div class="feature">
                    <h3>Funkció 1</h3>
                    <p>Leírás...</p>
                </div>
                <div class="feature">
                    <h3>Funkció 2</h3>
                    <p>Leírás...</p>
                </div>
            </div>
        </section>
        
        <section id="about">
            <h2>Rólunk</h2>
            <p>Részletes <strong>információk</strong> rólunk.</p>
            <img src="example.jpg" alt="Példa kép">
        </section>
    </main>
    
    <footer>
        <p>&copy; 2025 - Minden jog fenntartva</p>
    </footer>
</body>
</html>`,

    /**
     * Érvénytelen HTML példa hibakereséshez
     */
    invalid: `<!DOCTYPE html>
<html>
<head>
    <title>Hibás HTML példa</title>
</head>
<body>
    <h1>Hiányzó záró tag példa
    <div>
        <p>Ez a bekezdés nincs lezárva.
        <span>Beágyazott nem lezárt elemek</div>
    <ul>
        <li>Első elem
        <li>Második elem
    </ul>
    <!-- Befejezetlen megjegyzés
</body>
</html>`,

    /**
     * Az aktuális oldal HTML kódjának egyszerűsített exportálása
     * @returns {string} Az aktuális oldal HTML kódja egyszerűsítve
     */
    getCurrentPageHTML: function() {
        try {
            // Fejléc és alapszerkezet
            let html = '<!DOCTYPE html>\n<html>\n<head>\n';
            html += '    <title>' + document.title + '</title>\n';
            html += '</head>\n<body>\n';
            
            // Az aktuális tartalom egyszerűsített verziója (maximum 3 szint)
            const simplifyNode = (node, level) => {
                if (level > 3) return '    ' + '  '.repeat(level) + '<!-- ... -->\n';
                
                let result = '';
                if (node.nodeType === 1) { // Element node
                    const tagName = node.tagName.toLowerCase();
                    result += '    ' + '  '.repeat(level) + '<' + tagName;
                    
                    // Maximálisan 3 attribútum
                    let attrCount = 0;
                    for (let i = 0; i < node.attributes.length && attrCount < 3; i++) {
                        const attr = node.attributes[i];
                        result += ' ' + attr.name + '="' + attr.value + '"';
                        attrCount++;
                    }
                    
                    if (node.attributes.length > 3) {
                        result += ' ...';
                    }
                    
                    result += '>\n';
                    
                    // Gyermek elemek feldolgozása
                    if (node.childNodes.length > 0) {
                        for (let i = 0; i < node.childNodes.length; i++) {
                            result += simplifyNode(node.childNodes[i], level + 1);
                        }
                        result += '    ' + '  '.repeat(level) + '</' + tagName + '>\n';
                    }
                } else if (node.nodeType === 3) { // Text node
                    const text = node.textContent.trim();
                    if (text) {
                        result += '    ' + '  '.repeat(level) + text + '\n';
                    }
                } else if (node.nodeType === 8) { // Comment node
                    result += '    ' + '  '.repeat(level) + '<!-- ' + node.textContent + ' -->\n';
                }
                
                return result;
            };
            
            // Body tartalmának egyszerűsítése
            html += simplifyNode(document.body, 0);
            html += '</body>\n</html>';
            
            return html;
        } catch (error) {
            console.error('Hiba az aktuális oldal exportálása során:', error);
            return '<!-- Hiba az aktuális oldal exportálása során -->';
        }
    }
};

// Exportálás globális változóként
window.DOMViewerExamples = DOMViewerExamples;
