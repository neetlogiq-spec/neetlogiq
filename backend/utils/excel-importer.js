const XLSX = require('xlsx');
const fs = require('fs-extra');
const path = require('path');
const Joi = require('joi');
const _ = require('lodash');

class ExcelImporter {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.workbook = null;
    this.sheets = {};
    this.validationErrors = [];
    this.importStats = {
      colleges: { total: 0, imported: 0, errors: 0 },
      programs: { total: 0, imported: 0, errors: 0 },
      cutoffs: { total: 0, imported: 0, errors: 0 }
    };
  }

  // Load Excel file
  async loadExcelFile(filePath) {
    try {
      console.log(`📁 Loading Excel file: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      this.workbook = XLSX.readFile(filePath);
      this.sheets = this.workbook.SheetNames.reduce((acc, sheetName) => {
        acc[sheetName] = XLSX.utils.sheet_to_json(this.workbook.Sheets[sheetName], {
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });
        return acc;
      }, {});

      console.log(`✅ Excel file loaded successfully`);
      console.log(`📊 Sheets found: ${this.workbook.SheetNames.join(', ')}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Error loading Excel file: ${error.message}`);
      return false;
    }
  }

  // Get sheet data as JSON
  getSheetData(sheetName, options = {}) {
    if (!this.sheets[sheetName]) {
      console.warn(`⚠️  Sheet '${sheetName}' not found`);
      return [];
    }

    const sheet = this.sheets[sheetName];
    const headers = sheet[0] || [];
    
    // Convert to JSON with headers
    const jsonData = sheet.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          obj[header.trim()] = row[index];
        }
      });
      return obj;
    });

    // Filter out empty rows
    const filteredData = jsonData.filter(row => 
      Object.values(row).some(value => value && value.toString().trim() !== '')
    );

    console.log(`📋 Sheet '${sheetName}': ${filteredData.length} rows of data`);
    return filteredData;
  }

  // Validate college data
  validateCollegeData(data) {
    const collegeSchema = Joi.object({
      name: Joi.string().required().min(3).max(500),
      code: Joi.string().optional().max(50),
      city: Joi.string().required().min(2).max(100),
      state: Joi.string().required().min(2).max(100),
      district: Joi.string().optional().max(100),
      address: Joi.string().optional().max(1000),
      pincode: Joi.string().optional().pattern(/^\d{6}$/),
      college_type: Joi.string().required().valid('MEDICAL', 'DENTAL', 'DNB', 'MULTI', 'PARAMEDICAL'),
      management_type: Joi.string().required().valid('GOVERNMENT', 'PRIVATE', 'TRUST', 'DEEMED', 'AUTONOMOUS'),
      establishment_year: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
      university: Joi.string().optional().max(200),
      website: Joi.string().uri().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional().max(20),
      accreditation: Joi.string().optional().max(100)
    });

    const errors = [];
    data.forEach((row, index) => {
      const { error } = collegeSchema.validate(row);
      if (error) {
        errors.push({
          row: index + 2, // +2 because Excel is 1-indexed and we have headers
          data: row,
          errors: error.details.map(d => d.message)
        });
      }
    });

    return errors;
  }

  // Validate program data
  validateProgramData(data) {
    const programSchema = Joi.object({
      college_name: Joi.string().required().min(3).max(500),
      program_name: Joi.string().required().min(2).max(200),
      level: Joi.string().required().valid('UG', 'PG', 'DIPLOMA', 'FELLOWSHIP', 'CERTIFICATE'),
      course_type: Joi.string().required().valid('MEDICAL', 'DENTAL', 'DNB', 'PARAMEDICAL'),
      specialization: Joi.string().optional().max(200),
      duration: Joi.number().integer().min(1).max(120).optional(),
      entrance_exam: Joi.string().required().max(50),
      total_seats: Joi.number().integer().min(0).max(10000).optional(),
      fee_structure: Joi.string().optional().max(500)
    });

    const errors = [];
    data.forEach((row, index) => {
      const { error } = programSchema.validate(row);
      if (error) {
        errors.push({
          row: index + 2,
          data: row,
          errors: error.details.map(d => d.message)
        });
        console.log(`⚠️  Row ${index + 2} validation error:`, error.details.map(d => d.message));
      }
    });

    return errors;
  }

  // Clean and standardize data
  cleanData(data, type) {
    return data.map(row => {
      const cleaned = {};
      
      Object.keys(row).forEach(key => {
        let value = row[key];
        
        if (typeof value === 'string') {
          // Trim whitespace
          value = value.trim();
          
          // Handle empty strings
          if (value === '' || value === 'NA' || value === 'N/A' || value === '-') {
            value = null;
          }
          
          // Standardize case for certain fields
          if (['college_type', 'management_type', 'level', 'course_type', 'entrance_exam'].includes(key)) {
            value = value ? value.toUpperCase() : null;
          }
          
          // Standardize state names
          if (key === 'state') {
            value = this.standardizeStateName(value);
          }
        }
        
        // Convert numeric fields
        if (['establishment_year', 'duration', 'total_seats'].includes(key) && value) {
          const num = parseInt(value);
          value = isNaN(num) ? null : num;
        }
        
        cleaned[key] = value;
      });
      
      return cleaned;
    });
  }

  // Standardize state names
  standardizeStateName(stateName) {
    if (!stateName) return null;
    
    const stateMappings = {
      'AP': 'Andhra Pradesh',
      'AR': 'Arunachal Pradesh',
      'AS': 'Assam',
      'BR': 'Bihar',
      'CG': 'Chhattisgarh',
      'GA': 'Goa',
      'GJ': 'Gujarat',
      'HR': 'Haryana',
      'HP': 'Himachal Pradesh',
      'JH': 'Jharkhand',
      'KA': 'Karnataka',
      'KL': 'Kerala',
      'MP': 'Madhya Pradesh',
      'MH': 'Maharashtra',
      'MN': 'Manipur',
      'ML': 'Meghalaya',
      'MZ': 'Mizoram',
      'NL': 'Nagaland',
      'OD': 'Odisha',
      'PB': 'Punjab',
      'RJ': 'Rajasthan',
      'SK': 'Sikkim',
      'TN': 'Tamil Nadu',
      'TS': 'Telangana',
      'TR': 'Tripura',
      'UP': 'Uttar Pradesh',
      'UK': 'Uttarakhand',
      'WB': 'West Bengal',
      'DL': 'Delhi',
      'JK': 'Jammu and Kashmir',
      'LA': 'Ladakh',
      'CH': 'Chandigarh',
      'DN': 'Dadra and Nagar Haveli and Daman and Diu',
      'LD': 'Lakshadweep',
      'PY': 'Puducherry',
      'AN': 'Andaman and Nicobar Islands'
    };

    // Check if it's a code
    if (stateMappings[stateName.toUpperCase()]) {
      return stateMappings[stateName.toUpperCase()];
    }

    // Check if it's a full name
    const upperState = stateName.toUpperCase();
    for (const [code, name] of Object.entries(stateMappings)) {
      if (name.toUpperCase() === upperState) {
        return name;
      }
    }

    return stateName;
  }

  // Generate import report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.importStats,
      errors: this.validationErrors,
      recommendations: []
    };

    // Add recommendations based on errors
    if (this.validationErrors.length > 0) {
      report.recommendations.push('Review and fix validation errors before proceeding');
    }

    if (this.importStats.colleges.errors > 0) {
      report.recommendations.push('Some college data has validation issues');
    }

    if (this.importStats.programs.errors > 0) {
      report.recommendations.push('Some program data has validation issues');
    }

    return report;
  }

  // Export validation errors to CSV
  async exportValidationErrors(outputPath) {
    if (this.validationErrors.length === 0) {
      console.log('✅ No validation errors to export');
      return;
    }

    try {
      const csvData = this.validationErrors.map(error => ({
        Row: error.row,
        Field: error.errors.join('; '),
        Data: JSON.stringify(error.data)
      }));

      const csv = this.arrayToCSV(csvData);
      await fs.writeFile(outputPath, csv);
      console.log(`📄 Validation errors exported to: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error exporting validation errors: ${error.message}`);
    }
  }

  // Convert array to CSV
  arrayToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }

  // Print summary
  printSummary() {
    console.log('\n📊 Import Summary:');
    console.log('==================');
    
    Object.entries(this.importStats).forEach(([type, stats]) => {
      console.log(`${type.toUpperCase()}:`);
      console.log(`  Total: ${stats.total}`);
      console.log(`  Imported: ${stats.imported}`);
      console.log(`  Errors: ${stats.errors}`);
      console.log('');
    });

    if (this.validationErrors.length > 0) {
      console.log(`⚠️  Total validation errors: ${this.validationErrors.length}`);
      console.log('Check the validation report for details');
    }
  }
}

module.exports = ExcelImporter;
