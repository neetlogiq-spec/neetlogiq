// Typesense Integration for NeetLogIQ
// Provides advanced search capabilities with natural language processing

class TypesenseIntegration {
  constructor(env) {
    this.env = env;
    this.typesenseUrl = env.TYPESENSE_URL || 'http://localhost:8108';
    this.apiKey = env.TYPESENSE_API_KEY || 'xyz';
    this.collections = {
      colleges: 'colleges',
      courses: 'courses'
    };
    this.isAvailable = false;
    this.checkAvailability();
  }
  
  // Check if Typesense is available
  async checkAvailability() {
    try {
      const response = await fetch(`${this.typesenseUrl}/health`, {
        method: 'GET',
        headers: {
          'X-TYPESENSE-API-KEY': this.apiKey
        }
      });
      this.isAvailable = response.ok;
      console.log(`Typesense availability: ${this.isAvailable ? 'Available' : 'Not available'}`);
    } catch (error) {
      this.isAvailable = false;
      console.log('Typesense is not available:', error.message);
    }
    return this.isAvailable;
  }

  // Initialize Typesense collections
  async initializeCollections() {
    try {
      // Create colleges collection
      await this.createCollection('colleges', {
        name: 'colleges',
        fields: [
          { name: 'id', type: 'int32', facet: false },
          { name: 'name', type: 'string', facet: false },
          { name: 'city', type: 'string', facet: true },
          { name: 'state', type: 'string', facet: true },
          { name: 'college_type', type: 'string', facet: true },
          { name: 'management_type', type: 'string', facet: true },
          { name: 'establishment_year', type: 'int32', facet: true, optional: true },
          { name: 'description', type: 'string', facet: false, optional: true }
        ],
        default_sorting_field: 'name'
      });

      // Create courses collection
      await this.createCollection('courses', {
        name: 'courses',
        fields: [
          { name: 'id', type: 'int32', facet: false },
          { name: 'course_name', type: 'string', facet: false },
          { name: 'stream', type: 'string', facet: true },
          { name: 'program', type: 'string', facet: true },
          { name: 'duration_years', type: 'int32', facet: true, optional: true },
          { name: 'entrance_exam', type: 'string', facet: true },
          { name: 'total_seats', type: 'int32', facet: true, optional: true },
          { name: 'college_id', type: 'int32', facet: true },
          { name: 'college_name', type: 'string', facet: false },
          { name: 'college_city', type: 'string', facet: true },
          { name: 'college_state', type: 'string', facet: true },
          { name: 'college_type', type: 'string', facet: true },
          { name: 'management_type', type: 'string', facet: true },
          { name: 'description', type: 'string', facet: false, optional: true }
        ],
        default_sorting_field: 'course_name'
      });

      console.log('✅ Typesense collections initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Typesense collections:', error);
      return false;
    }
  }

  // Create a collection
  async createCollection(collectionName, schema) {
    try {
      const response = await fetch(`${this.typesenseUrl}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TYPESENSE-API-KEY': this.apiKey
        },
        body: JSON.stringify(schema)
      });

      if (response.status === 201) {
        console.log(`✅ Collection ${collectionName} created successfully`);
        return true;
      } else if (response.status === 409) {
        console.log(`ℹ️ Collection ${collectionName} already exists`);
        return true;
      } else {
        const error = await response.text();
        console.error(`❌ Error creating collection ${collectionName}:`, error);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error creating collection ${collectionName}:`, error);
      return false;
    }
  }

  // Index colleges data
  async indexColleges(colleges) {
    // Check if Typesense is available
    if (!this.isAvailable) {
      console.log('Typesense is not available for indexing colleges');
      return false;
    }
    
    try {
      const documents = colleges.map(college => ({
        id: college.id,
        name: college.name,
        city: college.city,
        state: college.state,
        college_type: college.college_type,
        management_type: college.management_type,
        establishment_year: college.establishment_year,
        description: `${college.name} in ${college.city}, ${college.state} - ${college.college_type} college`
      }));

      const response = await fetch(`${this.typesenseUrl}/collections/${this.collections.colleges}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TYPESENSE-API-KEY': this.apiKey
        },
        body: JSON.stringify(documents)
      });

      if (response.ok) {
        console.log(`✅ Indexed ${documents.length} colleges in Typesense`);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Error indexing colleges:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error indexing colleges:', error);
      return false;
    }
  }

  // Index courses data
  async indexCourses(courses) {
    // Check if Typesense is available
    if (!this.isAvailable) {
      console.log('Typesense is not available for indexing courses');
      return false;
    }
    
    try {
      const documents = courses.map(course => ({
        id: course.id,
        course_name: course.course_name,
        stream: course.stream,
        program: course.program,
        duration_years: course.duration_years,
        entrance_exam: course.entrance_exam,
        total_seats: course.total_seats,
        college_id: course.college_id,
        college_name: course.college_name,
        college_city: course.college_city,
        college_state: course.college_state,
        college_type: course.college_type,
        management_type: course.management_type,
        description: `${course.course_name} in ${course.stream} stream at ${course.college_name}`
      }));

      const response = await fetch(`${this.typesenseUrl}/collections/${this.collections.courses}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TYPESENSE-API-KEY': this.apiKey
        },
        body: JSON.stringify(documents)
      });

      if (response.ok) {
        console.log(`✅ Indexed ${documents.length} courses in Typesense`);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Error indexing courses:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error indexing courses:', error);
      return false;
    }
  }

  // Search colleges with natural language
  async searchColleges(query, options = {}) {
    // Check if Typesense is available
    if (!this.isAvailable) {
      console.log('Typesense is not available for college search');
      return { results: [], total: 0, error: 'Typesense service is not available' };
    }
    
    try {
      const {
        page = 1,
        limit = 20,
        filters = {},
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      const searchParams = {
        q: query,
        query_by: 'name,city,state,college_type,description',
        filter_by: this.buildFilterString(filters),
        sort_by: `${sortBy}:${sortOrder}`,
        per_page: limit,
        page: page,
        highlight_full_fields: 'name,city,state',
        snippet_threshold: 30,
        num_typos: 2,
        typo_tokens_threshold: 1,
        drop_tokens_threshold: 1,
        facet_by: 'city,state,college_type,management_type,establishment_year',
        max_facet_values: 10
      };

      const response = await fetch(`${this.typesenseUrl}/collections/${this.collections.colleges}/documents/search`, {
        method: 'GET',
        headers: {
          'X-TYPESENSE-API-KEY': this.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          results: data.hits.map(hit => ({
            ...hit.document,
            highlights: hit.highlights,
            text_match: hit.text_match
          })),
          facets: data.facet_counts,
          total: data.found,
          page: data.page,
          search_time_ms: data.search_time_ms
        };
      } else {
        const error = await response.text();
        console.error('❌ Error searching colleges:', error);
        return { results: [], total: 0, error: error };
      }
    } catch (error) {
      console.error('❌ Error searching colleges:', error);
      return { results: [], total: 0, error: error.message };
    }
  }

  // Search courses with natural language
  async searchCourses(query, options = {}) {
    // Check if Typesense is available
    if (!this.isAvailable) {
      console.log('Typesense is not available for course search');
      return { results: [], total: 0, error: 'Typesense service is not available' };
    }
    
    try {
      const {
        page = 1,
        limit = 20,
        filters = {},
        sortBy = 'course_name',
        sortOrder = 'asc'
      } = options;

      const searchParams = {
        q: query,
        query_by: 'course_name,stream,program,college_name,college_city,description',
        filter_by: this.buildFilterString(filters),
        sort_by: `${sortBy}:${sortOrder}`,
        per_page: limit,
        page: page,
        highlight_full_fields: 'course_name,stream,program,college_name',
        snippet_threshold: 30,
        num_typos: 2,
        typo_tokens_threshold: 1,
        drop_tokens_threshold: 1,
        facet_by: 'stream,program,entrance_exam,college_type,management_type,college_city,college_state',
        max_facet_values: 10
      };

      const response = await fetch(`${this.typesenseUrl}/collections/${this.collections.courses}/documents/search`, {
        method: 'GET',
        headers: {
          'X-TYPESENSE-API-KEY': this.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          results: data.hits.map(hit => ({
            ...hit.document,
            highlights: hit.highlights,
            text_match: hit.text_match
          })),
          facets: data.facet_counts,
          total: data.found,
          page: data.page,
          search_time_ms: data.search_time_ms
        };
      } else {
        const error = await response.text();
        console.error('❌ Error searching courses:', error);
        return { results: [], total: 0, error: error };
      }
    } catch (error) {
      console.error('❌ Error searching courses:', error);
      return { results: [], total: 0, error: error.message };
    }
  }

  // Build filter string for Typesense
  buildFilterString(filters) {
    const filterParts = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        if (Array.isArray(value)) {
          filterParts.push(`${key}:=(${value.join(',')})`);
        } else {
          filterParts.push(`${key}:=${value}`);
        }
      }
    });

    return filterParts.join(' && ');
  }

  // Get collection stats
  async getCollectionStats(collectionName) {
    // Check if Typesense is available
    if (!this.isAvailable) {
      console.log('Typesense is not available for getting collection stats');
      return null;
    }
    
    try {
      const response = await fetch(`${this.typesenseUrl}/collections/${collectionName}`, {
        method: 'GET',
        headers: {
          'X-TYPESENSE-API-KEY': this.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          name: data.name,
          num_documents: data.num_documents,
          created_at: data.created_at
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting stats for ${collectionName}:`, error);
      return null;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.typesenseUrl}/health`, {
        method: 'GET'
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Typesense health check failed:', error);
      return false;
    }
  }
}

export default TypesenseIntegration;
