const csv = require('csv-parser');
const fs = require('fs');
const logger = require('./logger');

class CutoffCsvParser {
  constructor() {
    this.categoryMappings = {
      'GMPH': 'GMPH',
      '2AG': '2AG',
      'GM': 'GM',
      'GMP': 'GMP',
      'MU': 'MU',
      'OPN': 'OPN',
      'SC': 'SC',
      'ST': 'ST',
      'OBC': 'OBC',
      'EWS': 'EWS',
      'PWD': 'PWD'
    };
  }

  /**
   * Parse the complex rank format from CSV
   * Example: "GMPH:44483, 2AG:24096, GM:15958"
   */
  parseRankString(rankString) {
    if (!rankString || typeof rankString !== 'string') {
      return [];
    }

    const ranks = [];
    const rankPairs = rankString.split(',').map(pair => pair.trim());

    for (const pair of rankPairs) {
      const [category, rank] = pair.split(':').map(part => part.trim());
      
      if (category && rank) {
        const normalizedCategory = this.normalizeCategory(category);
        const rankValue = parseInt(rank);
        
        if (!isNaN(rankValue) && normalizedCategory) {
          ranks.push({
            category: normalizedCategory,
            rank: rankValue,
            original: pair.trim()
          });
        }
      }
    }

    return ranks;
  }

  /**
   * Normalize category codes to standard format
   */
  normalizeCategory(category) {
    const upperCategory = category.toUpperCase();
    return this.categoryMappings[upperCategory] || upperCategory;
  }

  /**
   * Extract college information from the complex college name field
   */
  parseCollegeInfo(collegeName, collegeLocation) {
    let college = {
      name: '',
      address: '',
      city: '',
      state: ''
    };

    if (collegeName) {
      // Split by comma to separate name and address
      const parts = collegeName.split(',').map(part => part.trim());
      
      if (parts.length >= 2) {
        college.name = parts[0];
        college.address = parts.slice(1).join(', ');
      } else {
        college.name = collegeName;
      }
    }

    if (collegeLocation) {
      // Parse "Mangalore, Karnataka" format
      const locationParts = collegeLocation.split(',').map(part => part.trim());
      if (locationParts.length >= 2) {
        college.city = locationParts[0];
        college.state = locationParts[1];
      } else {
        college.city = collegeLocation;
      }
    }

    return college;
  }

  /**
   * Parse course information and determine level
   */
  parseCourseInfo(courseName) {
    const course = {
      name: courseName,
      level: '',
      type: '',
      specialization: ''
    };

    if (courseName) {
      const upperCourse = courseName.toUpperCase();
      
      // Determine course level
      if (upperCourse.includes('MBBS') || upperCourse.includes('BDS')) {
        course.level = 'UG';
        course.type = 'UNDERGRADUATE';
      } else if (upperCourse.includes('MD') || upperCourse.includes('MS') || upperCourse.includes('MDS')) {
        course.level = 'PG';
        course.type = 'POSTGRADUATE';
      } else if (upperCourse.includes('DIPLOMA')) {
        course.level = 'DIPLOMA';
        course.type = 'DIPLOMA';
      } else if (upperCourse.includes('DNB')) {
        course.level = 'DNB';
        course.type = 'DNB';
      } else if (upperCourse.includes('FELLOWSHIP')) {
        course.level = 'FELLOWSHIP';
        course.type = 'FELLOWSHIP';
      }

      // Extract specialization
      if (upperCourse.includes('IN')) {
        const inIndex = upperCourse.indexOf('IN');
        course.specialization = courseName.substring(inIndex + 2).trim();
      }
    }

    return course;
  }

  /**
   * Parse CSV file and return structured data
   */
  async parseCsvFile(filePath, options = {}) {
    const results = [];
    const errors = [];
    const warnings = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const parsedRow = this.parseRow(row, options);
            if (parsedRow) {
              results.push(parsedRow);
            }
          } catch (error) {
            errors.push({
              row: row,
              error: error.message,
              line: results.length + 1
            });
            logger.error(`Error parsing row: ${error.message}`, { row });
          }
        })
        .on('end', () => {
          logger.info(`CSV parsing completed. ${results.length} rows parsed, ${errors.length} errors`);
          resolve({
            data: results,
            errors: errors,
            warnings: warnings,
            summary: {
              totalRows: results.length + errors.length,
              successRows: results.length,
              errorRows: errors.length,
              warningRows: warnings.length
            }
          });
        })
        .on('error', (error) => {
          logger.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  }

  /**
   * Parse individual row from CSV
   */
  parseRow(row, options = {}) {
    const {
      authority = 'KEA',
      year = new Date().getFullYear(),
      quota = 'state'
    } = options;

    // Parse college information
    const collegeInfo = this.parseCollegeInfo(row.college_name, row.college_location);
    
    // Parse course information
    const courseInfo = this.parseCourseInfo(row.course_name);
    
    // Parse ranks
    const ranks = this.parseRankString(row.all_ranks);
    
    if (ranks.length === 0) {
      throw new Error(`No valid ranks found in: ${row.all_ranks}`);
    }

    // Create structured data
    const parsedData = {
      college: {
        name: collegeInfo.name,
        address: collegeInfo.address,
        city: collegeInfo.city,
        state: collegeInfo.state,
        normalized_name: this.normalizeText(collegeInfo.name),
        normalized_city: this.normalizeText(collegeInfo.city),
        normalized_state: this.normalizeText(collegeInfo.state)
      },
      course: {
        name: courseInfo.name,
        level: courseInfo.level,
        type: courseInfo.type,
        specialization: courseInfo.specialization,
        normalized_name: this.normalizeText(courseInfo.name)
      },
      cutoffs: ranks.map(rank => ({
        round: row.round || 'r1',
        round_name: this.getRoundName(row.round || 'r1'),
        authority: authority,
        quota: quota,
        year: year,
        category: rank.category,
        opening_rank: rank.rank,
        closing_rank: rank.rank, // Same as opening for single rank
        score_type: 'rank',
        score_unit: 'rank',
        original_rank_string: rank.original
      }))
    };

    return parsedData;
  }

  /**
   * Get human-readable round name
   */
  getRoundName(roundCode) {
    const roundNames = {
      'r1': 'Round 1',
      'r2': 'Round 2',
      'r3': 'Round 3',
      'r4': 'Round 4',
      'r5': 'Round 5',
      'r6': 'Round 6',
      'r7': 'Round 7',
      'r8': 'Round 8'
    };
    return roundNames[roundCode] || `Round ${roundCode}`;
  }

  /**
   * Normalize text for search
   */
  normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Validate parsed data
   */
  validateData(parsedData) {
    const errors = [];

    // Validate college
    if (!parsedData.college.name) {
      errors.push('College name is required');
    }
    if (!parsedData.college.city) {
      errors.push('College city is required');
    }
    if (!parsedData.college.state) {
      errors.push('College state is required');
    }

    // Validate course
    if (!parsedData.course.name) {
      errors.push('Course name is required');
    }
    if (!parsedData.course.level) {
      errors.push('Course level could not be determined');
    }

    // Validate cutoffs
    if (!parsedData.cutoffs || parsedData.cutoffs.length === 0) {
      errors.push('At least one cutoff entry is required');
    }

    for (const cutoff of parsedData.cutoffs) {
      if (!cutoff.category) {
        errors.push('Category is required for cutoff');
      }
      if (!cutoff.opening_rank || isNaN(cutoff.opening_rank)) {
        errors.push(`Invalid opening rank: ${cutoff.opening_rank}`);
      }
    }

    return errors;
  }

  /**
   * Generate import summary
   */
  generateSummary(parsedResults) {
    const summary = {
      totalColleges: 0,
      totalCourses: 0,
      totalCutoffs: 0,
      categories: new Set(),
      rounds: new Set(),
      authorities: new Set(),
      quotas: new Set()
    };

    for (const result of parsedResults) {
      summary.totalColleges++;
      summary.totalCourses++;
      summary.totalCutoffs += result.cutoffs.length;

      for (const cutoff of result.cutoffs) {
        summary.categories.add(cutoff.category);
        summary.rounds.add(cutoff.round);
        summary.authorities.add(cutoff.authority);
        summary.quotas.add(cutoff.quota);
      }
    }

    return {
      ...summary,
      categories: Array.from(summary.categories),
      rounds: Array.from(summary.rounds),
      authorities: Array.from(summary.authorities),
      quotas: Array.from(summary.quotas)
    };
  }
}

module.exports = CutoffCsvParser;
