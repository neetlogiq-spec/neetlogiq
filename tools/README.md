# 🚀 MedGuide Development Tools

## Overview
This directory contains powerful development tools and CLI utilities for the MedGuide project, designed to streamline development workflow and integrate AI-powered assistance.

## 🛠️ Available Tools

### 1. MedGuide Dev CLI (`dev-tool.js`)
A comprehensive command-line interface for development tasks.

#### Installation
```bash
npm install
npm link  # Makes the CLI globally available
```

#### Usage
```bash
# Start development environment
npm run dev-tool start

# Start only frontend
npm run dev-tool start --frontend

# Start only backend
npm run dev-tool start --backend

# Custom port
npm run dev-tool start --port 4002

# Stop all servers
npm run dev-tool stop

# Restart environment
npm run dev-tool restart

# Check status
npm run dev-tool status

# Code quality
npm run dev-tool lint
npm run dev-tool test

# Database management
npm run dev-tool db:reset
npm run dev-tool db:backup

# AI Code Generation (Coming Soon)
npm run dev-tool ai:generate component Button
npm run dev-tool ai:generate page Dashboard

# Project information
npm run dev-tool project:info

# Help and examples
npm run dev-tool help:examples
```

### 2. AI Development Libraries
- **ai**: Vercel's AI SDK for building AI-powered applications
- **openai**: Official OpenAI Node.js library
- **@anthropic-ai/sdk**: Official Anthropic Claude SDK

### 3. Quick Scripts
```bash
# Frontend only development
npm run dev:frontend-only

# Backend only development
npm run dev:backend-only

# Clean restart (stop all, wait, start fresh)
npm run dev:clean
```

## 🎯 Features

### Development Management
- ✅ **Smart Port Management**: Automatically handles port conflicts
- ✅ **Process Control**: Start, stop, restart development servers
- ✅ **Status Monitoring**: Real-time server status checking
- ✅ **Custom Ports**: Flexible port configuration

### Code Quality
- ✅ **Linting**: Automated code quality checks
- ✅ **Testing**: Test execution and reporting
- ✅ **Formatting**: Code style enforcement

### Database Tools
- ✅ **Reset**: Clean database state
- ✅ **Backup**: Automated database backups
- ✅ **Management**: Database operation utilities

### AI Integration (Coming Soon)
- 🤖 **Code Generation**: AI-powered component creation
- 🤖 **Smart Suggestions**: Intelligent code recommendations
- 🤖 **Auto-completion**: Context-aware code completion

### Project Analytics
- 📊 **File Statistics**: Component and file counting
- 📊 **Dependency Analysis**: Package and version information
- 📊 **Performance Metrics**: Development environment monitoring

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Make CLI Global** (Optional)
   ```bash
   npm link
   medguide-dev --help
   ```

3. **Start Development**
   ```bash
   npm run dev-tool start
   ```

4. **Use Quick Commands**
   ```bash
   npm run dev:clean    # Clean restart
   npm run dev:status   # Check status
   ```

## 🔧 Configuration

### Environment Variables
- `PORT`: Frontend development port (default: 4000)
- `BACKEND_PORT`: Backend port (default: 4001)

### Custom Ports
```bash
npm run dev-tool start --port 4002
npm run dev-tool start --backend --port 4003
```

## 🎨 Customization

### Adding New Commands
Edit `tools/cli/dev-tool.js` to add new CLI commands:

```javascript
program
  .command('custom:command')
  .description('Custom command description')
  .action(() => {
    // Your custom logic here
  });
```

### Extending AI Features
The AI integration is designed to be easily extensible:

```javascript
// In the ai:generate command
const generateCode = async (type, name, template) => {
  // Integrate with OpenAI/Claude APIs
  // Generate code based on templates
  // Return generated code
};
```

## 🐛 Troubleshooting

### Common Issues
1. **Port Already in Use**: Use `npm run dev-tool stop` to clear ports
2. **Permission Denied**: Ensure `tools/cli/dev-tool.js` is executable
3. **Command Not Found**: Run `npm link` to make CLI global

### Debug Mode
```bash
DEBUG=* npm run dev-tool start
```

## 🧠 Memory Bank System

### Overview
The Memory Bank is an AI-powered knowledge management system that stores, retrieves, and manages development knowledge, decisions, bugs, and insights over time.

### Features
- **Knowledge Management**: Store development decisions, bugs, and insights
- **Smart Search**: Full-text search with filtering and categorization
- **Memory Categories**: 10 predefined categories for organization
- **Tag System**: Flexible tagging for easy discovery
- **Export Options**: JSON, CSV, and Markdown export formats
- **Backup & Restore**: Automated backup and restoration system

### Usage
```bash
# Create a memory
npm run dev-tool -- memory:create bugs "Port Issue" "Description" -t "ports,development" -p high

# Search memories
npm run dev-tool -- memory:search "port conflict"

# List memories by category
npm run dev-tool -- memory:list bugs

# Show statistics
npm run dev-tool -- memory:stats
```

For detailed documentation, see [tools/memory-bank/README.md](tools/memory-bank/README.md).

## 🔮 Future Enhancements

- [ ] **AI Code Generation**: OpenAI/Claude integration
- [ ] **Smart Templates**: AI-powered component templates
- [ ] **Auto-testing**: Automated test generation
- [ ] **Performance Monitoring**: Real-time performance metrics
- [ ] **Deployment Tools**: Automated deployment workflows
- [ ] **Code Review**: AI-powered code review assistance

## 📚 Resources

- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [OpenAI Node.js](https://github.com/openai/openai-node)
- [Anthropic Claude SDK](https://github.com/anthropics/anthropic-sdk-typescript)

---

**Made with ❤️ for MedGuide Development Team**
