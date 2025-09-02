#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class AICodeGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.outputDir = process.cwd();
  }

  // Load template content
  loadTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, `${templateName}.js`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${templateName} not found`);
    }
    return fs.readFileSync(templatePath, 'utf8');
  }

  // Replace template variables
  replaceVariables(template, variables) {
    let result = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key]);
    });
    return result;
  }

  // Generate React component
  generateComponent(name, options = {}) {
    const template = this.loadTemplate('react-component');
    const variables = {
      componentName: name,
      templateType: options.template || 'default',
      generatedDate: new Date().toISOString().split('T')[0]
    };

    const generatedCode = this.replaceVariables(template, variables);
    const outputPath = path.join(this.outputDir, 'frontend/src/components', `${name}.jsx`);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, generatedCode);
    return outputPath;
  }

  // Generate React page
  generatePage(name, options = {}) {
    const template = this.loadTemplate('react-page');
    const variables = {
      pageName: name,
      templateType: options.template || 'default',
      generatedDate: new Date().toISOString().split('T')[0]
    };

    const generatedCode = this.replaceVariables(template, variables);
    const outputPath = path.join(this.outputDir, 'frontend/src/pages', `${name}.jsx`);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, generatedCode);
    return outputPath;
  }

  // Generate API endpoint
  generateAPIEndpoint(name, options = {}) {
    const template = this.loadTemplate('api-endpoint');
    const variables = {
      endpointName: name,
      templateType: options.template || 'default',
      generatedDate: new Date().toISOString().split('T')[0]
    };

    const generatedCode = this.replaceVariables(template, variables);
    const outputPath = path.join(this.outputDir, 'backend/routes', `${name}.js`);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, generatedCode);
    return outputPath;
  }

  // Generate test file
  generateTest(name, options = {}) {
    const template = this.loadTemplate('test-file');
    const variables = {
      testName: name,
      templateType: options.template || 'default',
      generatedDate: new Date().toISOString().split('T')[0]
    };

    const generatedCode = this.replaceVariables(template, variables);
    const outputPath = path.join(this.outputDir, 'frontend/src/__tests__', `${name}.test.jsx`);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, generatedCode);
    return outputPath;
  }

  // Generate multiple files for a feature
  generateFeature(featureName, options = {}) {
    const results = [];
    
    try {
      // Generate component
      const componentPath = this.generateComponent(featureName, options);
      results.push({ type: 'component', path: componentPath });
      
      // Generate page
      const pagePath = this.generatePage(featureName, options);
      results.push({ type: 'page', path: pagePath });
      
      // Generate API endpoint
      const apiPath = this.generateAPIEndpoint(featureName, options);
      results.push({ type: 'api', path: apiPath });
      
      // Generate test
      const testPath = this.generateTest(featureName, options);
      results.push({ type: 'test', path: testPath });
      
      return results;
    } catch (error) {
      throw new Error(`Failed to generate feature: ${error.message}`);
    }
  }

  // List available templates
  listTemplates() {
    const templates = fs.readdirSync(this.templatesDir);
    return templates.map(template => template.replace('.js', ''));
  }

  // Show template preview
  previewTemplate(templateName, variables = {}) {
    const template = this.loadTemplate(templateName);
    const preview = this.replaceVariables(template, variables);
    return preview;
  }
}

module.exports = AICodeGenerator;
