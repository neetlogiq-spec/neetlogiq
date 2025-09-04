#!/usr/bin/env node

/**
 * 🎨 NeetLogIQ Design Preview Server
 * 
 * Features:
 * - Interactive preview of Medical Theme at port 7001
 * - Interactive preview of Modern Theme at port 7002
 * - Live theme switching and customization
 * - Component showcase for each theme
 * - Responsive design testing
 * 
 * Usage: node design-preview-server.js [start|stop|status]
 */

import { createServer } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DesignPreviewServer {
  constructor() {
    this.medicalServer = null;
    this.modernServer = null;
    this.medicalPort = 7001;
    this.modernPort = 7002;
    
    this.themes = {
      medical: {
        name: 'Medical Theme',
        description: 'Professional healthcare design system',
        colors: {
          primary: '#2563eb',
          secondary: '#059669',
          accent: '#dc2626',
          neutral: '#f8fafc',
          dark: '#1e293b'
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '1rem',
          fontWeight: '500'
        }
      },
      modern: {
        name: 'Modern Theme',
        description: 'Contemporary, trendy design system',
        colors: {
          primary: '#7c3aed',
          secondary: '#10b981',
          accent: '#f59e0b',
          neutral: '#f9fafb',
          dark: '#111827'
        },
        typography: {
          fontFamily: 'Poppins, system-ui, sans-serif',
          fontSize: '1rem',
          fontWeight: '600'
        }
      }
    };
  }

  async start() {
    console.log('🎨 Starting NeetLogIQ Design Preview Servers...');
    
    try {
      // Start Medical Theme Server
      await this.startMedicalServer();
      
      // Start Modern Theme Server
      await this.startModernServer();
      
      console.log('✅ Design preview servers started successfully!');
      console.log(`🏥 Medical Theme: http://localhost:${this.medicalPort}`);
      console.log(`🚀 Modern Theme: http://localhost:${this.modernPort}`);
      
    } catch (error) {
      console.error('❌ Failed to start design preview servers:', error.message);
    }
  }

  async startMedicalServer() {
    return new Promise((resolve, reject) => {
      this.medicalServer = createServer((req, res) => {
        this.handleRequest(req, res, 'medical');
      });
      
      this.medicalServer.listen(this.medicalPort, () => {
        console.log(`🏥 Medical theme preview server running on port ${this.medicalPort}`);
        resolve();
      });
      
      this.medicalServer.on('error', (error) => {
        console.error(`❌ Medical server error:`, error.message);
        reject(error);
      });
    });
  }

  async startModernServer() {
    return new Promise((resolve, reject) => {
      this.modernServer = createServer((req, res) => {
        this.handleRequest(req, res, 'modern');
      });
      
      this.modernServer.listen(this.modernPort, () => {
        console.log(`🚀 Modern theme preview server running on port ${this.modernPort}`);
        resolve();
      });
      
      this.modernServer.on('error', (error) => {
        console.error(`❌ Modern server error:`, error.message);
        reject(error);
      });
    });
  }

  handleRequest(req, res, theme) {
    const url = req.url;
    
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(this.generateHTML(theme));
    } else if (url === '/styles.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(this.generateCSS(theme));
    } else if (url === '/script.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(this.generateJavaScript(theme));
    } else if (url === '/api/theme') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.themes[theme]));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  generateHTML(theme) {
    const themeData = this.themes[theme];
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${themeData.name} - NeetLogIQ Design Preview</title>
    <link rel="stylesheet" href="/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="theme-${theme}">
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">
                <h1>🎨 ${themeData.name}</h1>
                <p>${themeData.description}</p>
            </div>
            <div class="nav-actions">
                <button class="btn btn-primary" onclick="showColorPalette()">Color Palette</button>
                <button class="btn btn-secondary" onclick="showComponents()">Components</button>
                <button class="btn btn-accent" onclick="showTypography()">Typography</button>
            </div>
        </nav>
    </header>

    <main class="main">
        <section class="hero">
            <div class="hero-content">
                <h2 class="hero-title">Welcome to ${themeData.name}</h2>
                <p class="hero-subtitle">Experience the power of intelligent design automation</p>
                <div class="hero-actions">
                    <button class="btn btn-primary btn-large">Get Started</button>
                    <button class="btn btn-secondary btn-large">Learn More</button>
                </div>
            </div>
            <div class="hero-visual">
                <div class="design-preview">
                    <div class="preview-card">
                        <div class="preview-header"></div>
                        <div class="preview-content">
                            <div class="preview-line"></div>
                            <div class="preview-line short"></div>
                            <div class="preview-line"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="features">
            <h3 class="section-title">Design Features</h3>
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <h4>Color System</h4>
                    <p>Professional color palette with primary, secondary, and accent colors</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📝</div>
                    <h4>Typography</h4>
                    <p>Carefully crafted typography scale for optimal readability</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📏</div>
                    <h4>Spacing</h4>
                    <p>Consistent spacing system for harmonious layouts</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">✨</div>
                    <h4>Shadows</h4>
                    <p>Subtle shadow system for depth and hierarchy</p>
                </div>
            </div>
        </section>

        <section class="components">
            <h3 class="section-title">Component Showcase</h3>
            <div class="component-grid">
                <div class="component-section">
                    <h4>Buttons</h4>
                    <div class="button-showcase">
                        <button class="btn btn-primary">Primary Button</button>
                        <button class="btn btn-secondary">Secondary Button</button>
                        <button class="btn btn-accent">Accent Button</button>
                        <button class="btn btn-outline">Outline Button</button>
                    </div>
                </div>
                
                <div class="component-section">
                    <h4>Cards</h4>
                    <div class="card-showcase">
                        <div class="card card-elevated">
                            <h5>Elevated Card</h5>
                            <p>This card has a subtle elevation with shadows</p>
                        </div>
                        <div class="card card-outlined">
                            <h5>Outlined Card</h5>
                            <p>This card uses borders for definition</p>
                        </div>
                    </div>
                </div>

                <div class="component-section">
                    <h4>Forms</h4>
                    <div class="form-showcase">
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" placeholder="Enter your email">
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" placeholder="Enter your password">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="color-palette" id="colorPalette" style="display: none;">
            <h3 class="section-title">Color Palette</h3>
            <div class="color-grid">
                <div class="color-item">
                    <div class="color-swatch primary"></div>
                    <div class="color-info">
                        <h5>Primary</h5>
                        <p class="color-hex">${themeData.colors.primary}</p>
                    </div>
                </div>
                <div class="color-item">
                    <div class="color-swatch secondary"></div>
                    <div class="color-info">
                        <h5>Secondary</h5>
                        <p class="color-hex">${themeData.colors.secondary}</p>
                    </div>
                </div>
                <div class="color-item">
                    <div class="color-swatch accent"></div>
                    <div class="color-info">
                        <h5>Accent</h5>
                        <p class="color-hex">${themeData.colors.accent}</p>
                    </div>
                </div>
                <div class="color-item">
                    <div class="color-swatch neutral"></div>
                    <div class="color-info">
                        <h5>Neutral</h5>
                        <p class="color-hex">${themeData.colors.neutral}</p>
                    </div>
                </div>
                <div class="color-item">
                    <div class="color-swatch dark"></div>
                    <div class="color-info">
                        <h5>Dark</h5>
                        <p class="color-hex">${themeData.colors.dark}</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2025 NeetLogIQ - Intelligent Design Automation</p>
        <p>Theme: ${themeData.name}</p>
    </footer>

    <script src="/script.js"></script>
</body>
</html>`;
  }

  generateCSS(theme) {
    const colors = this.themes[theme].colors;
    const typography = this.themes[theme].typography;
    
    return `
/* NeetLogIQ ${theme} Theme CSS */
:root {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    --accent: ${colors.accent};
    --neutral: ${colors.neutral};
    --dark: ${colors.dark};
    --font-family: ${typography.fontFamily};
    --font-size: ${typography.fontSize};
    --font-weight: ${typography.fontWeight};
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family);
    font-size: var(--font-size);
    font-weight: var(--font-weight);
    line-height: 1.6;
    color: var(--dark);
    background-color: var(--neutral);
}

/* Header & Navigation */
.header {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    padding: 1rem 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.nav-brand p {
    opacity: 0.9;
    font-size: 1.1rem;
}

.nav-actions {
    display: flex;
    gap: 1rem;
}

/* Buttons */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
}

.btn-primary {
    background-color: var(--primary);
    color: white;
}

.btn-primary:hover {
    background-color: ${this.darkenColor(colors.primary, 10)};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
    background-color: var(--secondary);
    color: white;
}

.btn-secondary:hover {
    background-color: ${this.darkenColor(colors.secondary, 10)};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-accent {
    background-color: var(--accent);
    color: white;
}

.btn-accent:hover {
    background-color: ${this.darkenColor(colors.accent, 10)};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-outline {
    background-color: transparent;
    color: var(--primary);
    border: 2px solid var(--primary);
}

.btn-outline:hover {
    background-color: var(--primary);
    color: white;
}

.btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
}

/* Main Content */
.main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Hero Section */
.hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    padding: 4rem 0;
    margin-bottom: 4rem;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.3rem;
    color: var(--dark);
    margin-bottom: 2rem;
    opacity: 0.8;
}

.hero-actions {
    display: flex;
    gap: 1rem;
}

.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.design-preview {
    width: 300px;
    height: 200px;
    perspective: 1000px;
}

.preview-card {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transform: rotateY(-15deg) rotateX(10deg);
    transition: transform 0.3s ease;
}

.preview-card:hover {
    transform: rotateY(-5deg) rotateX(5deg);
}

.preview-header {
    width: 60%;
    height: 1rem;
    background: var(--primary);
    border-radius: 0.5rem;
    margin-bottom: 1rem;
}

.preview-line {
    width: 100%;
    height: 0.5rem;
    background: var(--neutral);
    border-radius: 0.25rem;
    margin-bottom: 0.75rem;
}

.preview-line.short {
    width: 80%;
}

/* Sections */
.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--dark);
}

/* Features */
.features {
    margin-bottom: 4rem;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h4 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--dark);
}

.feature-card p {
    color: var(--dark);
    opacity: 0.8;
}

/* Components */
.components {
    margin-bottom: 4rem;
}

.component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.component-section {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.component-section h4 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--dark);
}

.button-showcase {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.card-showcase {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.card {
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--neutral);
}

.card-elevated {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-outlined {
    border: 2px solid var(--primary);
}

.card h5 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--dark);
}

.card p {
    color: var(--dark);
    opacity: 0.8;
}

.form-showcase {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    color: var(--dark);
}

.form-group input {
    padding: 0.75rem;
    border: 2px solid var(--neutral);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px ${this.hexToRgba(colors.primary, 0.1)};
}

/* Color Palette */
.color-palette {
    margin-bottom: 4rem;
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
}

.color-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.color-swatch {
    width: 60px;
    height: 60px;
    border-radius: 0.75rem;
    border: 2px solid white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.color-swatch.primary { background-color: var(--primary); }
.color-swatch.secondary { background-color: var(--secondary); }
.color-swatch.accent { background-color: var(--accent); }
.color-swatch.neutral { background-color: var(--neutral); }
.color-swatch.dark { background-color: var(--dark); }

.color-info h5 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: var(--dark);
}

.color-hex {
    font-family: monospace;
    font-size: 0.9rem;
    color: var(--dark);
    opacity: 0.7;
}

/* Footer */
.footer {
    background: var(--dark);
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 4rem;
}

.footer p {
    margin-bottom: 0.5rem;
    opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .hero {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-actions {
        justify-content: center;
    }
    
    .main {
        padding: 1rem;
    }
    
    .feature-grid,
    .component-grid,
    .color-grid {
        grid-template-columns: 1fr;
    }
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.feature-card,
.component-section,
.color-item {
    animation: fadeIn 0.6s ease-out;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }
`;
  }

  generateJavaScript(theme) {
    return `
// NeetLogIQ ${theme} Theme JavaScript

// Show/Hide sections
function showColorPalette() {
    const colorPalette = document.getElementById('colorPalette');
    const components = document.querySelector('.components');
    
    if (colorPalette.style.display === 'none') {
        colorPalette.style.display = 'block';
        components.style.display = 'none';
    } else {
        colorPalette.style.display = 'none';
        components.style.display = 'block';
    }
}

function showComponents() {
    const colorPalette = document.getElementById('colorPalette');
    const components = document.querySelector('.components');
    
    colorPalette.style.display = 'none';
    components.style.display = 'block';
}

function showTypography() {
    alert('Typography showcase coming soon!');
}

// Interactive color picker
function createColorPicker() {
    const colors = ${JSON.stringify(this.themes[theme].colors)};
    
    // Create color picker interface
    const picker = document.createElement('div');
    picker.className = 'color-picker';
    picker.innerHTML = \`
        <h4>Customize Colors</h4>
        <div class="picker-controls">
            <label>Primary: <input type="color" value="\${colors.primary}" onchange="updateColor('primary', this.value)"></label>
            <label>Secondary: <input type="color" value="\${colors.secondary}" onchange="updateColor('secondary', this.value)"></label>
            <label>Accent: <input type="color" value="\${colors.accent}" onchange="updateColor('accent', this.value)"></label>
        </div>
    \`;
    
    document.querySelector('.main').appendChild(picker);
}

function updateColor(type, value) {
    document.documentElement.style.setProperty(\`--\${type}\`, value);
}

// Add interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects
    const cards = document.querySelectorAll('.card, .feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.feature-card, .component-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Theme switcher (for demo purposes)
function switchTheme(newTheme) {
    // This would normally switch between different theme files
    console.log(\`Switching to \${newTheme} theme\`);
    alert(\`Theme switching functionality would be implemented here!\`);
}

// Export theme data
window.themeData = ${JSON.stringify(this.themes[theme])};
`;
  }

  darkenColor(hex, percent) {
    // Simple color darkening - in production, use a proper color library
    return hex;
  }

  hexToRgba(hex, alpha) {
    // Convert hex to rgba
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  async stop() {
    console.log('🛑 Stopping design preview servers...');
    
    if (this.medicalServer) {
      this.medicalServer.close();
      console.log('✅ Medical theme server stopped');
    }
    
    if (this.modernServer) {
      this.modernServer.close();
      console.log('✅ Modern theme server stopped');
    }
  }

  async status() {
    console.log('📊 NeetLogIQ Design Preview Server Status');
    console.log('==========================================');
    
    console.log(`\n🏥 Medical Theme Server:`);
    console.log(`  Port: ${this.medicalPort}`);
    console.log(`  Status: ${this.medicalServer ? 'Running' : 'Stopped'}`);
    console.log(`  URL: http://localhost:${this.medicalPort}`);
    
    console.log(`\n🚀 Modern Theme Server:`);
    console.log(`  Port: ${this.modernPort}`);
    console.log(`  Status: ${this.modernServer ? 'Running' : 'Stopped'}`);
    console.log(`  URL: http://localhost:${this.modernPort}`);
    
    console.log(`\n🎨 Available Themes:`);
    for (const [themeName, themeData] of Object.entries(this.themes)) {
      console.log(`  ${themeName}: ${themeData.description}`);
      console.log(`    Primary: ${themeData.colors.primary}`);
      console.log(`    Secondary: ${themeData.colors.secondary}`);
      console.log(`    Accent: ${themeData.colors.accent}`);
    }
  }
}

// CLI interface
async function main() {
  const server = new DesignPreviewServer();
  const command = process.argv[2] || 'start';
  
  try {
    switch (command) {
      case 'start':
        await server.start();
        
        // Keep the process running
        process.on('SIGINT', async () => {
          console.log('\n🛑 Shutting down design preview servers...');
          await server.stop();
          process.exit(0);
        });
        
        break;
      case 'stop':
        await server.stop();
        break;
      case 'status':
        await server.status();
        break;
      default:
        console.log('Usage: node design-preview-server.js [start|stop|status]');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Design preview server error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DesignPreviewServer;
