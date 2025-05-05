# DOM-fa Megjelenítő

Interaktív DOM-fa vizualizációs eszköz, amely lehetővé teszi a HTML kód DOM struktúrájának megjelenítését és elemzését.

## A javított változat telepítési útmutatója

A DOM-fa megjelenítő moduláris változatában fontos névütközési problémát javítottunk. A projekt fájljai a következőképpen módosultak:

1. A korábbi `domParser.js` fájl át lett nevezve `domTreeParser.js`-re
2. A modul neve `DOMParser`-ről `DOMTreeParser`-re változott
3. Az `app.js` és `index.html` fájlok frissítve lettek az új név használatára

### Telepítési lépések

1. Töltsd le a javított fájlokat:
   - `js/domTreeParser.js` - frissített DOM elemző modul
   - `js/app.js` - frissített alkalmazás modul
   - `index.html` - frissített hivatkozásokkal

2. Helyezd el őket a webes tárhelyed megfelelő könyvtáraiban, tartva a következő struktúrát:
   - `index.html` (gyökérben)
   - `css/styles.css` és `css/dark-mode.css`
   - `js/` könyvtár minden JavaScript fájllal

3. Ellenőrizd, hogy minden fájl megfelelő olvasási jogosultságokkal rendelkezik.

## Használati útmutató

1. Az `index.html` fájl betöltésekor megjelenik a DOM-fa Megjelenítő felülete.
2. Illeszd be a vizsgálni kívánt HTML kódot a szövegmezőbe, vagy használd az előre definiált példákat.
3. Kattints a "DOM-fa Megjelenítése" gombra a vizualizáció elkészítéséhez.
4. A megjelenített DOM-fa interaktív:
   - Kattints egy elemre az alcsomópontok kibontásához/összecsukásához
   - Dupla kattintás egy elemen részletes információkat jelenít meg
   - A zoom és pan funkciókkal könnyedén navigálhatsz a fában

## Hibaelhárítás

Ha a DOM-fa továbbra sem jelenik meg megfelelően:

1. Nyisd meg a böngésző fejlesztői eszközeit (F12) és ellenőrizd a konzolt a hibaüzenetekért.
2. Ellenőrizd, hogy minden JavaScript fájl megfelelően betöltődik-e.
3. Használd a "Hibakeresés" gombot az alkalmazás belső állapotának megtekintéséhez.
4. Győződj meg róla, hogy a böngésző verziója támogatja a használt technológiákat (modern böngésző szükséges).

## Fontos megjegyzések

- A moduláris struktúra lehetővé teszi a könnyebb hibaelhárítást és bővítést.
- A debug mód alapértelmezetten engedélyezve van a `config.js` fájlban, szükség esetén kikapcsolható.
- A fő módosítás a név ütközés kiküszöbölése volt a beépített böngésző DOMParser API és saját modulunk között.
