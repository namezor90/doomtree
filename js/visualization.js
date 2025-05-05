/**
 * Vizualizációs modul a DOM-fa megjelenítőhöz
 */

const DOMVisualizer = {
    /**
     * Vizualizációhoz szükséges alapváltozók
     */
    svg: null,
    treeData: null,
    currentZoom: { scale: 1, x: 0, y: 0 },
    tooltipDiv: null,
    
    /**
     * Inicializálja a vizualizációs modult
     */
    init: function() {
        // SVG elem kiválasztása
        this.svg = d3.select('#tree-svg');
        
        // Tooltip létrehozása
        this.tooltipDiv = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
        
        // SVG méretezése
        this.updateSvgSize();
        
        // Ablak átméretezés kezelése
        window.addEventListener('resize', () => {
            this.updateSvgSize();
            if (this.treeData) this.updateVisualization();
        });
        
        console.log('DOM Visualizer inicializálva');
    },
    
    /**
     * SVG méretének frissítése a konténer alapján
     */
    updateSvgSize: function() {
        const container = document.getElementById('tree-container');
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.svg.attr('width', width)
               .attr('height', height);
    },
    
    /**
     * Megjelenít egy DOM-fát a kapott adatok alapján
     * @param {object} treeData - Elemzett DOM-fa adatok
     */
    visualizeDomTree: function(treeData) {
        return DOMViewerUtils.tryCatch(() => {
            if (!treeData) {
                throw new Error('Nincs megjeleníthető DOM-fa adat');
            }
            
            this.treeData = treeData;
            this.updateVisualization();
            DOMViewerUtils.showStatus('DOM-fa sikeresen megjelenítve!', 'success');
        }, 'Hiba történt a DOM-fa megjelenítése során');
    },
    
    /**
     * Frissíti a vizualizációt a beállítások és az aktuális treeData alapján
     */
    updateVisualization: function() {
        return DOMViewerUtils.tryCatch(() => {
            if (!this.treeData) return;
            
            // Beállítások lekérése
            const layoutType = document.getElementById('layout-type').value;
            const nodeDistance = parseInt(document.getElementById('node-distance').value);
            const showAttributes = document.getElementById('show-attributes').checked;
            const showTextNodes = document.getElementById('show-text-nodes').checked;
            const showComments = document.getElementById('show-comments').checked;
            
            // SVG tartalom törlése
            this.svg.selectAll('*').remove();
            
            // Transzformációs csoport hozzáadása
            const g = this.svg.append('g')
                .attr('class', 'transform-group')
                .attr('transform', `translate(${this.currentZoom.x},${this.currentZoom.y}) scale(${this.currentZoom.scale})`);
            
            // Drag & pan funkció
            const dragHandler = d3.drag()
                .on('start', function() {
                    d3.select(this).attr('cursor', 'grabbing');
                })
                .on('drag', (event) => {
                    this.currentZoom.x += event.dx;
                    this.currentZoom.y += event.dy;
                    g.attr('transform', `translate(${this.currentZoom.x},${this.currentZoom.y}) scale(${this.currentZoom.scale})`);
                })
                .on('end', function() {
                    d3.select(this).attr('cursor', 'grab');
                });
            
            dragHandler(this.svg);
            this.svg.attr('cursor', 'grab');
            
            // Hierarchikus adatszerkezet készítése
            const root = d3.hierarchy(this.treeData);
            
            // Elrendezés beállítása a választott típus alapján
            let treeLayout;
            if (layoutType === 'horizontal') {
                treeLayout = d3.tree()
                    .nodeSize([nodeDistance, nodeDistance * 2.5])
                    .separation(() => 1);
            } else if (layoutType === 'radial') {
                treeLayout = d3.cluster()
                    .size([2 * Math.PI, DOMViewerConfig.layout.radialRadius]);
            } else { // Alapértelmezett függőleges fa
                treeLayout = d3.tree()
                    .nodeSize([nodeDistance * 2.5, nodeDistance])
                    .separation(() => 1);
            }
            
            // Fa létrehozása és csomópontok elhelyezése
            treeLayout(root);
            
            // Csomópontok és linkek kirajzolása a kiválasztott elrendezés szerint
            if (layoutType === 'radial') {
                this._renderRadialLayout(g, root, showAttributes, showTextNodes, showComments);
            } else {
                this._renderTreeLayout(g, root, layoutType === 'horizontal', showAttributes, showTextNodes, showComments);
            }
            
            // Kezdeti nézet centrálása
            this.centerView();
        }, 'Hiba történt a vizualizáció frissítése során');
    },
    
    /**
     * Sugaras elrendezés kirajzolása
     * @private
     */
    _renderRadialLayout: function(g, root, showAttributes, showTextNodes, showComments) {
        // Linkek (vonalak) kirajzolása
        const links = g.selectAll('.link')
            .data(root.links())
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', d => {
                const startAngle = d.source.x;
                const startRadius = d.source.y;
                const endAngle = d.target.x;
                const endRadius = d.target.y;
                
                const x0 = startRadius * Math.cos(startAngle - Math.PI/2);
                const y0 = startRadius * Math.sin(startAngle - Math.PI/2);
                const x1 = endRadius * Math.cos(endAngle - Math.PI/2);
                const y1 = endRadius * Math.sin(endAngle - Math.PI/2);
                
                return `M${x0},${y0}C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1}`;
            });
        
        // Csomópontok kirajzolása
        const nodes = g.selectAll('.node')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', d => {
                if (d.data.nodeType === 1) return 'node element-node';
                if (d.data.nodeType === 3) return 'node text-node';
                if (d.data.nodeType === 8) return 'node comment-node';
                return 'node';
            })
            .attr('transform', d => {
                const x = d.y * Math.cos(d.x - Math.PI/2);
                const y = d.y * Math.sin(d.x - Math.PI/2);
                return `translate(${x},${y})`;
            });
            
        // Csomópontok megjelenítése
        this._renderNodes(nodes, showAttributes, showTextNodes, showComments);
    },
    
    /**
     * Fa elrendezés kirajzolása (vízszintes vagy függőleges)
     * @private
     */
    _renderTreeLayout: function(g, root, isHorizontal, showAttributes, showTextNodes, showComments) {
        // Linkek (vonalak) kirajzolása
        const links = g.selectAll('.link')
            .data(root.links())
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', d => {
                if (isHorizontal) {
                    return `M${d.source.y},${d.source.x}
                            C${(d.source.y + d.target.y) / 2},${d.source.x}
                             ${(d.source.y + d.target.y) / 2},${d.target.x}
                             ${d.target.y},${d.target.x}`;
                } else {
                    return `M${d.source.x},${d.source.y}
                            C${d.source.x},${(d.source.y + d.target.y) / 2}
                             ${d.target.x},${(d.source.y + d.target.y) / 2}
                             ${d.target.x},${d.target.y}`;
                }
            });
        
        // Csomópontok kirajzolása
        const nodes = g.selectAll('.node')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', d => {
                if (d.data.nodeType === 1) return 'node element-node';
                if (d.data.nodeType === 3) return 'node text-node';
                if (d.data.nodeType === 8) return 'node comment-node';
                return 'node';
            })
            .attr('transform', d => {
                if (isHorizontal) {
                    return `translate(${d.y},${d.x})`;
                } else {
                    return `translate(${d.x},${d.y})`;
                }
            });
            
        // Csomópontok megjelenítése
        this._renderNodes(nodes, showAttributes, showTextNodes, showComments);
    },
    
    /**
     * Csomópontok megjelenítése
     * @private
     */
    _renderNodes: function(nodes, showAttributes, showTextNodes, showComments) {
        // Téglalap hozzáadása a csomópontokhoz
        nodes.append('rect')
            .attr('width', d => {
                const nodeType = d.data.nodeType;
                const nodeName = nodeType === 1 ? d.data.tagName.toLowerCase() : 
                               nodeType === 3 ? 'text' : 'comment';
                
                let attrs = '';
                if (nodeType === 1 && showAttributes) {
                    const attributes = d.data.attributes;
                    if (attributes && attributes.length > 0) {
                        for (let i = 0; i < Math.min(attributes.length, DOMViewerConfig.node.maxAttrsShown); i++) {
                            const attr = attributes[i];
                            attrs += ` ${attr.name}="${attr.value}"`;
                        }
                        if (attributes.length > DOMViewerConfig.node.maxAttrsShown) attrs += '...';
                    }
                }
                
                // Szövegcsomópontok kezelése
                let textContent = '';
                if (nodeType === 3) {
                    textContent = d.data.textContent.trim();
                    if (textContent.length > DOMViewerConfig.node.maxTextLength) {
                        textContent = textContent.substring(0, DOMViewerConfig.node.maxTextLength) + '...';
                    }
                } else if (nodeType === 8) {
                    textContent = d.data.textContent.trim();
                    if (textContent.length > DOMViewerConfig.node.maxTextLength) {
                        textContent = textContent.substring(0, DOMViewerConfig.node.maxTextLength) + '...';
                    }
                }
                
                // Csomópont szélességének kiszámítása a tartalom alapján
                const baseWidth = nodeName.length * 8;
                const attrsWidth = attrs.length * 6;
                const textWidth = textContent.length * 7;
                
                return Math.max(baseWidth + attrsWidth, textWidth, 30);
            })
            .attr('height', d => {
                return d.data.nodeType === 1 ? (showAttributes && d.data.attributes && d.data.attributes.length > 0) ? 40 : 30 : 25;
            })
            .attr('y', -15);
        
        // Csomópont nevének megjelenítése
        nodes.append('text')
            .attr('dy', 0)
            .text(d => {
                const nodeType = d.data.nodeType;
                
                if (nodeType === 1) {
                    return d.data.tagName.toLowerCase();
                } else if (nodeType === 3 && showTextNodes) {
                    let text = d.data.textContent.trim();
                    if (text.length > DOMViewerConfig.node.maxTextLength) {
                        text = text.substring(0, DOMViewerConfig.node.maxTextLength) + '...';
                    }
                    return `"${text}"`;
                } else if (nodeType === 8 && showComments) {
                    let comment = d.data.textContent.trim();
                    if (comment.length > DOMViewerConfig.node.maxTextLength) {
                        comment = comment.substring(0, DOMViewerConfig.node.maxTextLength) + '...';
                    }
                    return `<!-- ${comment} -->`;
                }
                
                return '';
            });
        
        // Attribútumok megjelenítése
        if (showAttributes) {
            nodes.filter(d => d.data.nodeType === 1 && d.data.attributes && d.data.attributes.length > 0)
                .append('text')
                .attr('class', 'node-attrs')
                .attr('dy', 15)
                .text(d => {
                    const attributes = d.data.attributes;
                    let attrs = '';
                    
                    if (attributes && attributes.length > 0) {
                        for (let i = 0; i < Math.min(attributes.length, DOMViewerConfig.node.maxAttrsShown); i++) {
                            const attr = attributes[i];
                            attrs += `${attr.name}="${attr.value}" `;
                        }
                        if (attributes.length > DOMViewerConfig.node.maxAttrsShown) attrs += '...';
                    }
                    
                    return attrs;
                });
        }
        
        // Összenyitható/bezárható csomópontok és interaktivitás
        this._addNodeInteractivity(nodes);
    },
    
    /**
     * Csomópontok interaktivitásának hozzáadása
     * @private
     */
    _addNodeInteractivity: function(nodes) {
        const self = this;
        
        nodes.each(function(d) {
            const node = d3.select(this);
            
            // Csak az elem csomópontok lehetnek összezárhatók
            if (d.data.nodeType === 1 && d.children && d.children.length > 0) {
                node.on('click', function(event, d) {
                    // Kattintáskor a csomópont lezárása/kinyitása
                    event.stopPropagation();
                    
                    if (d._children) {
                        // Kinyitás
                        d.children = d._children;
                        d._children = null;
                    } else {
                        // Bezárás
                        d._children = d.children;
                        d.children = null;
                    }
                    
                    self.updateVisualization();
                });
                
                // Kurzor módosítása, hogy jelezze a kattinthatóságot
                node.style('cursor', 'pointer');
            }
            
            // Tooltip és részletpanel
            node.on('mouseover', function(event, d) {
                // Tooltip megjelenítése
                self.tooltipDiv.transition()
                    .duration(200)
                    .style('opacity', .9);
                
                const nodeType = d.data.nodeType;
                let tooltipText = '';
                
                if (nodeType === 1) {
                    tooltipText = `<${d.data.tagName.toLowerCase()}>`;
                    if (d.data.attributes && d.data.attributes.length > 0) {
                        tooltipText += ' (Kattintson a részletekért)';
                    }
                } else if (nodeType === 3) {
                    tooltipText = 'Szövegcsomópont';
                } else if (nodeType === 8) {
                    tooltipText = 'Megjegyzés';
                }
                
                self.tooltipDiv.html(tooltipText)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 20) + 'px');
            })
            .on('mouseout', function() {
                // Tooltip elrejtése
                self.tooltipDiv.transition()
                    .duration(500)
                    .style('opacity', 0);
            })
            .on('dblclick', function(event, d) {
                // Részletek megjelenítése dupla kattintásra
                event.stopPropagation();
                if (window.DetailPanel) {
                    DetailPanel.showNodeDetails(d.data);
                }
            });
        });
    },
    
    /**
     * Nézet középre igazítása
     */
    centerView: function() {
        const svgRect = document.getElementById('tree-svg').getBoundingClientRect();
        this.currentZoom.x = svgRect.width / 2;
        this.currentZoom.y = 50;
        this.applyZoom();
    },
    
    /**
     * Zoom alkalmazása
     */
    applyZoom: function() {
        this.svg.select('g.transform-group')
            .attr('transform', `translate(${this.currentZoom.x},${this.currentZoom.y}) scale(${this.currentZoom.scale})`);
    },
    
    /**
     * Nagyítás/kicsinyítés
     * @param {number} factor - Nagyítási faktor
     */
    zoom: function(factor) {
        this.currentZoom.scale *= factor;
        this.applyZoom();
    },
    
    /**
     * Zoom alaphelyzetbe állítása
     */
    resetZoom: function() {
        this.currentZoom = { scale: 1, x: 0, y: 0 };
        this.applyZoom();
    },
    
    /**
     * Összes csomópont kibontása
     */
    expandAll: function() {
        return DOMViewerUtils.tryCatch(() => {
            if (!this.treeData) return;
            
            function expand(node) {
                if (node._children) {
                    node.children = node._children;
                    node._children = null;
                }
                
                if (node.children) {
                    for (let i = 0; i < node.children.length; i++) {
                        expand(node.children[i]);
                    }
                }
            }
            
            const root = d3.hierarchy(this.treeData);
            expand(root);
            this.updateVisualization();
        }, 'Hiba történt a csomópontok kibontása során');
    },
    
    /**
     * Csomópontok összecsukása
     */
    collapseNodes: function() {
        return DOMViewerUtils.tryCatch(() => {
            if (!this.treeData) return;
            
            function collapse(node) {
                if (node.children && node.children.length > 0) {
                    node._children = node.children;
                    node.children = null;
                }
            }
            
            // Az első szint kibontva marad
            const root = d3.hierarchy(this.treeData);
            if (root.children) {
                for (let i = 0; i < root.children.length; i++) {
                    collapse(root.children[i]);
                }
            }
            
            this.updateVisualization();
        }, 'Hiba történt a csomópontok összecsukása során');
    }
};

// Exportálás globális változóként
window.DOMVisualizer = DOMVisualizer;