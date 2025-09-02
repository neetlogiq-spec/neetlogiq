const { Client } = require('@elastic/elasticsearch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class ElasticsearchService {
    constructor() {
        this.client = new Client({
            node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
            auth: {
                username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
                password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
            }
        });
        
        this.dbPath = path.join(__dirname, '../database/clean-unified.db');
        this.indexName = 'medical_colleges';
    }

    // Initialize Elasticsearch index
    async initializeIndex() {
        try {
            // Check if index exists
            const indexExists = await this.client.indices.exists({
                index: this.indexName
            });

            if (!indexExists) {
                // Create index with mapping
                await this.client.indices.create({
                    index: this.indexName,
                    body: {
                        mappings: {
                            properties: {
                                id: { type: 'integer' },
                                name: { 
                                    type: 'text',
                                    analyzer: 'english',
                                    fields: {
                                        keyword: { type: 'keyword' },
                                        phonetic: { type: 'text', analyzer: 'phonetic' }
                                    }
                                },
                                code: { type: 'keyword' },
                                city: { 
                                    type: 'text',
                                    analyzer: 'english',
                                    fields: { keyword: { type: 'keyword' } }
                                },
                                state: { 
                                    type: 'text',
                                    analyzer: 'english',
                                    fields: { keyword: { type: 'keyword' } }
                                },
                                district: { type: 'text' },
                                address: { type: 'text' },
                                pincode: { type: 'keyword' },
                                college_type: { 
                                    type: 'text',
                                    fields: { keyword: { type: 'keyword' } }
                                },
                                management_type: { 
                                    type: 'text',
                                    fields: { keyword: { type: 'keyword' } }
                                },
                                university: { type: 'text' },
                                nirf_rank: { type: 'integer' },
                                establishment_year: { type: 'integer' },
                                recognition_status: { type: 'text' },
                                bond_years: { type: 'integer' },
                                total_seats: { type: 'integer' },
                                aiq_seats: { type: 'integer' },
                                state_seats: { type: 'integer' },
                                management_seats: { type: 'integer' },
                                nri_seats: { type: 'integer' },
                                fees_range: { type: 'text' },
                                location: { type: 'geo_point' },
                                programs: {
                                    type: 'nested',
                                    properties: {
                                        name: { type: 'text' },
                                        level: { type: 'keyword' },
                                        seats: { type: 'integer' },
                                        recognition: { type: 'text' }
                                    }
                                },
                                search_score: { type: 'float' },
                                last_updated: { type: 'date' }
                            }
                        },
                        settings: {
                            analysis: {
                                analyzer: {
                                    phonetic: {
                                        type: 'custom',
                                        tokenizer: 'standard',
                                        filter: ['lowercase', 'phonetic']
                                    }
                                }
                            }
                        }
                    }
                });
                console.log('✅ Elasticsearch index created successfully');
            } else {
                console.log('✅ Elasticsearch index already exists');
            }
        } catch (error) {
            console.error('❌ Error initializing Elasticsearch index:', error);
            throw error;
        }
    }

    // Index all colleges from SQLite
    async indexAllColleges() {
        try {
            const db = new sqlite3.Database(this.dbPath);
            
            const colleges = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT 
                        c.*,
                        GROUP_CONCAT(DISTINCT p.name) as program_names,
                        GROUP_CONCAT(DISTINCT p.level) as program_levels,
                        GROUP_CONCAT(DISTINCT p.seats) as program_seats
                    FROM colleges c
                    LEFT JOIN programs p ON c.id = p.college_id
                    GROUP BY c.id
                `, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            console.log(`📊 Indexing ${colleges.length} colleges...`);

            // Process colleges in batches
            const batchSize = 100;
            for (let i = 0; i < colleges.length; i += batchSize) {
                const batch = colleges.slice(i, i + batchSize);
                
                const operations = batch.flatMap(college => [
                    { index: { _index: this.indexName, _id: college.id } },
                    this.prepareCollegeDocument(college)
                ]);

                await this.client.bulk({ body: operations });
                
                console.log(`✅ Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(colleges.length / batchSize)}`);
            }

            // Refresh index
            await this.client.indices.refresh({ index: this.indexName });
            console.log('✅ All colleges indexed successfully');
            
            db.close();
        } catch (error) {
            console.error('❌ Error indexing colleges:', error);
            throw error;
        }
    }

    // Prepare college document for indexing
    prepareCollegeDocument(college) {
        return {
            id: college.id,
            name: college.name,
            code: college.code,
            city: college.city,
            state: college.state,
            district: college.district,
            address: college.address,
            pincode: college.pincode,
            college_type: college.college_type,
            management_type: college.management_type,
            university: college.university,
            nirf_rank: college.nirf_rank,
            establishment_year: college.establishment_year,
            recognition_status: college.recognition_status,
            bond_years: college.bond_years,
            total_seats: college.total_seats || 0,
            aiq_seats: college.aiq_seats || 0,
            state_seats: college.state_seats || 0,
            management_seats: college.management_seats || 0,
            nri_seats: college.nri_seats || 0,
            fees_range: college.fees_range,
            programs: college.program_names ? college.program_names.split(',').map((name, index) => ({
                name: name.trim(),
                level: college.program_levels ? college.program_levels.split(',')[index]?.trim() : null,
                seats: college.program_seats ? parseInt(college.program_seats.split(',')[index]) : null
            })) : [],
            last_updated: new Date().toISOString()
        };
    }

    // Advanced search with multiple query types
    async advancedSearch(query, filters = {}, page = 1, size = 20) {
        try {
            const mustClauses = [];
            const filterClauses = [];
            const shouldClauses = [];

            // Text search across multiple fields
            if (query && query.trim()) {
                const searchQuery = query.trim();
                
                // Multi-field search with boosting
                mustClauses.push({
                    multi_match: {
                        query: searchQuery,
                        fields: [
                            'name^3',           // College name gets highest priority
                            'city^2',           // City gets medium priority
                            'state^2',          // State gets medium priority
                            'programs.name^2',  // Program names get medium priority
                            'code^1',           // College code gets lower priority
                            'university^1'      // University gets lower priority
                        ],
                        type: 'best_fields',
                        fuzziness: 'AUTO',
                        operator: 'or'
                    }
                });

                // Phonetic search for similar sounding names
                shouldClauses.push({
                    match: {
                        'name.phonetic': searchQuery
                    }
                });
            }

            // Apply filters
            if (filters.state) {
                filterClauses.push({ term: { 'state.keyword': filters.state } });
            }
            
            if (filters.city) {
                filterClauses.push({ term: { 'city.keyword': filters.city } });
            }
            
            if (filters.college_type) {
                filterClauses.push({ term: { 'college_type.keyword': filters.college_type } });
            }
            
            if (filters.management_type) {
                filterClauses.push({ term: { 'management_type.keyword': filters.management_type } });
            }

            if (filters.max_fees) {
                filterClauses.push({
                    range: {
                        fees_range: {
                            lte: filters.max_fees
                        }
                    }
                });
            }

            if (filters.min_seats) {
                filterClauses.push({
                    range: {
                        total_seats: {
                            gte: filters.min_seats
                        }
                    }
                });
            }

            if (filters.program) {
                filterClauses.push({
                    nested: {
                        path: 'programs',
                        query: {
                            match: {
                                'programs.name': filters.program
                            }
                        }
                    }
                });
            }

            // Build the search query
            const searchBody = {
                query: {
                    bool: {
                        must: mustClauses,
                        filter: filterClauses,
                        should: shouldClauses,
                        minimum_should_match: shouldClauses.length > 0 ? 1 : 0
                    }
                },
                sort: [
                    { _score: { order: 'desc' } },
                    { 'name.keyword': { order: 'asc' } }
                ],
                from: (page - 1) * size,
                size: size,
                highlight: {
                    fields: {
                        name: {},
                        city: {},
                        state: {},
                        'programs.name': {}
                    }
                }
            };

            const response = await this.client.search({
                index: this.indexName,
                body: searchBody
            });

            return {
                total: response.hits.total.value,
                hits: response.hits.hits.map(hit => ({
                    ...hit._source,
                    score: hit._score,
                    highlights: hit.highlight
                })),
                page,
                size,
                totalPages: Math.ceil(response.hits.total.value / size)
            };
        } catch (error) {
            console.error('❌ Error in advanced search:', error);
            throw error;
        }
    }

    // Natural language query processing
    async processNaturalLanguageQuery(query) {
        try {
            // Extract filters from natural language
            const filters = this.extractFiltersFromText(query);
            
            // Clean the query text
            const cleanQuery = this.cleanNaturalLanguageQuery(query);
            
            // Perform search with extracted filters
            return await this.advancedSearch(cleanQuery, filters);
        } catch (error) {
            console.error('❌ Error processing natural language query:', error);
            throw error;
        }
    }

    // Extract filters from natural language text
    extractFiltersFromText(text) {
        const filters = {};
        const lowerText = text.toLowerCase();

        // State detection
        const states = ['karnataka', 'maharashtra', 'tamil nadu', 'andhra pradesh', 'telangana', 'kerala'];
        states.forEach(state => {
            if (lowerText.includes(state)) {
                filters.state = state;
            }
        });

        // City detection
        const cities = ['bangalore', 'mumbai', 'chennai', 'hyderabad', 'kochi', 'pune'];
        cities.forEach(city => {
            if (lowerText.includes(city)) {
                filters.city = city;
            }
        });

        // College type detection
        if (lowerText.includes('medical') || lowerText.includes('mbbs')) {
            filters.college_type = 'MEDICAL';
        } else if (lowerText.includes('dental') || lowerText.includes('bds')) {
            filters.college_type = 'DENTAL';
        }

        // Management type detection
        if (lowerText.includes('government') || lowerText.includes('govt')) {
            filters.management_type = 'GOVERNMENT';
        } else if (lowerText.includes('private')) {
            filters.management_type = 'PRIVATE';
        }

        // Fee range detection
        const feeMatch = lowerText.match(/(\d+)k|(\d+) thousand/);
        if (feeMatch) {
            filters.max_fees = parseInt(feeMatch[1] || feeMatch[2]) * 1000;
        }

        // Seat requirement detection
        const seatMatch = lowerText.match(/(\d+) seats/);
        if (seatMatch) {
            filters.min_seats = parseInt(seatMatch[1]);
        }

        return filters;
    }

    // Clean natural language query
    cleanNaturalLanguageQuery(query) {
        // Remove filter words to get clean search text
        const filterWords = [
            'government', 'private', 'medical', 'dental', 'colleges', 'under', 'above',
            'seats', 'fees', 'thousand', 'k', 'in', 'at', 'near', 'around'
        ];
        
        let cleanQuery = query;
        filterWords.forEach(word => {
            cleanQuery = cleanQuery.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
        });
        
        return cleanQuery.trim();
    }

    // Get search suggestions
    async getSearchSuggestions(query, size = 10) {
        try {
            if (!query || query.length < 2) return [];

            const response = await this.client.search({
                index: this.indexName,
                body: {
                    query: {
                        multi_match: {
                            query: query,
                            fields: ['name^2', 'city', 'state'],
                            type: 'phrase_prefix',
                            max_expansions: 10
                        }
                    },
                    size: size,
                    _source: ['name', 'city', 'state', 'college_type']
                }
            });

            return response.hits.hits.map(hit => ({
                text: hit._source.name,
                city: hit._source.city,
                state: hit._source.state,
                type: hit._source.college_type,
                score: hit._score
            }));
        } catch (error) {
            console.error('❌ Error getting search suggestions:', error);
            return [];
        }
    }

    // Get popular searches
    async getPopularSearches() {
        try {
            const response = await this.client.search({
                index: this.indexName,
                body: {
                    aggs: {
                        popular_cities: {
                            terms: {
                                field: 'city.keyword',
                                size: 10
                            }
                        },
                        popular_states: {
                            terms: {
                                field: 'state.keyword',
                                size: 10
                            }
                        },
                        popular_types: {
                            terms: {
                                field: 'college_type.keyword',
                                size: 5
                            }
                        }
                    },
                    size: 0
                }
            });

            return {
                cities: response.aggregations.popular_cities.buckets,
                states: response.aggregations.popular_states.buckets,
                types: response.aggregations.popular_types.buckets
            };
        } catch (error) {
            console.error('❌ Error getting popular searches:', error);
            return { cities: [], states: [], types: [] };
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.client.cluster.health();
            return {
                status: response.status,
                numberOfNodes: response.number_of_nodes,
                activeShards: response.active_shards,
                relocatingShards: response.relocating_shards,
                initializingShards: response.initializing_shards,
                unassignedShards: response.unassigned_shards
            };
        } catch (error) {
            console.error('❌ Elasticsearch health check failed:', error);
            return { status: 'red', error: error.message };
        }
    }
}

module.exports = ElasticsearchService;
