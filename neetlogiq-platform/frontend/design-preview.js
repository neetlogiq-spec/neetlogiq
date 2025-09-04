#!/usr/bin/env node

/**
 * 🎨 NeetLogIQ Design Preview Server
 * Shows Medical Theme at port 7001 and Modern Theme at port 7002
 */

import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themes = {
  medical: {
    name: 'Medical Theme',
    colors: {
      primary: '#2563eb',
      secondary: '#059669',
      accent: '#dc2626',
      neutral: '#f8fafc',
      dark: '#1e293b'
    }
  },
  modern: {
    name: 'Modern Theme',
    colors: {
      primary: '#7c3aed',
      secondary: '#10b981',
      accent: '#f59e0b',
      neutral: '#f9fafb',
      dark: '#111827'
    }
  },
  professional: {
    name: 'Professional Theme',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#3b82f6',
      neutral: '#f9fafb',
      dark: '#111827'
    }
  },
  accessible: {
    name: 'Accessible Theme',
    colors: {
      primary: '#1e40af',
      secondary: '#059669',
      accent: '#dc2626',
      neutral: '#ffffff',
      dark: '#000000'
    }
  },
  darkMode: {
    name: 'Dark Mode Theme',
    colors: {
      primary: '#60a5fa',
      secondary: '#34d399',
      accent: '#fbbf24',
      neutral: '#1f2937',
      dark: '#111827'
    }
  }
};

function createThemeServer(theme, port) {
  const colors = themes[theme].colors;
  
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${themes[theme].name} - NeetLogIQ Design Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', system-ui, sans-serif; 
            background: ${colors.neutral};
            color: ${colors.dark};
            line-height: 1.6;
        }
        .header { 
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white; 
            padding: 2rem; 
            text-align: center;
        }
        .main { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .section { margin-bottom: 3rem; }
        .section h2 { 
            font-size: 2rem; 
            margin-bottom: 1rem; 
            color: ${colors.primary};
        }
        .color-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 1rem; 
            margin-bottom: 2rem;
        }
        .color-item { 
            background: white; 
            padding: 1.5rem; 
            border-radius: 0.5rem; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
        }
        .color-swatch { 
            width: 80px; 
            height: 80px; 
            border-radius: 50%; 
            margin: 0 auto 1rem; 
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .btn { 
            padding: 0.75rem 1.5rem; 
            border: none; 
            border-radius: 0.5rem; 
            font-size: 1rem; 
            font-weight: 600; 
            cursor: pointer; 
            margin: 0.5rem;
            transition: all 0.3s ease;
        }
        .btn-primary { background: ${colors.primary}; color: white; }
        .btn-secondary { background: ${colors.secondary}; color: white; }
        .btn-accent { background: ${colors.accent}; color: white; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
        .card { 
            background: white; 
            padding: 1.5rem; 
            border-radius: 0.75rem; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
        }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
        .form-group input { 
            width: 100%; 
            padding: 0.75rem; 
            border: 2px solid ${colors.neutral}; 
            border-radius: 0.5rem; 
            font-size: 1rem;
        }
        .form-group input:focus { 
            outline: none; 
            border-color: ${colors.primary}; 
            box-shadow: 0 0 0 3px ${colors.primary}20;
        }
        .footer { 
            background: ${colors.dark}; 
            color: white; 
            text-align: center; 
            padding: 2rem; 
            margin-top: 3rem;
        }
    </style>
</head>
<body>
    <header class="header">
        <h1>🎨 ${themes[theme].name}</h1>
        <p>NeetLogIQ Design Preview - Port ${port}</p>
    </header>

    <main class="main">
        <section class="section">
            <h2>Color Palette</h2>
            <div class="color-grid">
                <div class="color-item">
                    <div class="color-swatch" style="background: ${colors.primary}"></div>
                    <h3>Primary</h3>
                    <p>${colors.primary}</p>
                </div>
                <div class="color-item">
                    <div class="color-swatch" style="background: ${colors.secondary}"></div>
                    <h3>Secondary</h3>
                    <p>${colors.secondary}</p>
                </div>
                <div class="color-item">
                    <div class="color-swatch" style="background: ${colors.accent}"></div>
                    <h3>Accent</h3>
                    <p>${colors.accent}</p>
                </div>
                <div class="color-item">
                    <div class="color-swatch" style="background: ${colors.neutral}"></div>
                    <h3>Neutral</h3>
                    <p>${colors.neutral}</p>
                </div>
                <div class="color-item">
                    <div class="color-swatch" style="background: ${colors.dark}"></div>
                    <h3>Dark</h3>
                    <p>${colors.dark}</p>
                </div>
            </div>
        </section>

        <section class="section">
            <h2>Component Showcase</h2>
            
            <div class="card">
                <h3>Buttons</h3>
                <button class="btn btn-primary">Primary Button</button>
                <button class="btn btn-secondary">Secondary Button</button>
                <button class="btn btn-accent">Accent Button</button>
            </div>

            <div class="card">
                <h3>Form Elements</h3>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="Enter your password">
                </div>
            </div>

            <div class="card">
                <h3>Cards</h3>
                <p>This is a sample card component with the ${theme} theme styling.</p>
            </div>
        </section>

        <section class="section">
            <h2>Theme Information</h2>
            <div class="card">
                <h3>${themes[theme].name}</h3>
                <p><strong>Primary Color:</strong> ${colors.primary} - Used for main actions and branding</p>
                <p><strong>Secondary Color:</strong> ${colors.secondary} - Used for supporting elements</p>
                <p><strong>Accent Color:</strong> ${colors.accent} - Used for highlights and alerts</p>
                <p><strong>Neutral Color:</strong> ${colors.neutral} - Used for backgrounds and subtle elements</p>
                <p><strong>Dark Color:</strong> ${colors.dark} - Used for text and dark elements</p>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2025 NeetLogIQ - Intelligent Design Automation</p>
        <p>Current Theme: ${themes[theme].name} | Port: ${port}</p>
    </footer>
</body>
</html>`;
    
    res.end(html);
  });
  
  return server;
}

async function startServers() {
  console.log('🎨 Starting NeetLogIQ Design Preview Servers...');
  
  try {
    const servers = [];
    
    // Start Medical Theme Server (Port 7001)
    const medicalServer = createThemeServer('medical', 7001);
    medicalServer.listen(7001, () => {
      console.log('🏥 Medical Theme Preview: http://localhost:7001');
    });
    servers.push(medicalServer);
    
    // Start Modern Theme Server (Port 7002)
    const modernServer = createThemeServer('modern', 7002);
    modernServer.listen(7002, () => {
      console.log('🚀 Modern Theme Preview: http://localhost:7002');
    });
    servers.push(modernServer);
    
    // Start Professional Theme Server (Port 7003)
    const professionalServer = createThemeServer('professional', 7003);
    professionalServer.listen(7003, () => {
      console.log('💼 Professional Theme Preview: http://localhost:7003');
    });
    servers.push(professionalServer);
    
    // Start Accessible Theme Server (Port 7004)
    const accessibleServer = createThemeServer('accessible', 7004);
    accessibleServer.listen(7004, () => {
      console.log('♿ Accessible Theme Preview: http://localhost:7004');
    });
    servers.push(accessibleServer);
    
    // Start Dark Mode Theme Server (Port 7005)
    const darkModeServer = createThemeServer('darkMode', 7005);
    darkModeServer.listen(7005, () => {
      console.log('🌙 Dark Mode Theme Preview: http://localhost:7005');
    });
    servers.push(darkModeServer);
    
    console.log('\n✅ All 5 design theme preview servers started successfully!');
    console.log('🌐 Open the URLs in your browser to compare themes');
    console.log('🛑 Press Ctrl+C to stop all servers');
    
    // Handle shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down all design preview servers...');
      servers.forEach(server => server.close());
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start design preview servers:', error.message);
    process.exit(1);
  }
}

// Start servers if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServers();
}

export { startServers, createThemeServer };
