const express = require('express');
const router = express.Router();
const ElasticsearchService = require('../services/elasticsearchService');
const { checkAdminAuth } = require('../middleware/auth');

const elasticsearchService = new ElasticsearchService();

// Initialize Elasticsearch (admin only)
router.post('/init', checkAdminAuth, async (req, res) => {
    try {
        console.log('🚀 Initializing Elasticsearch index...');
        await elasticsearchService.initializeIndex();
        
        console.log('📊 Indexing colleges...');
        await elasticsearchService.indexAllColleges();
        
        res.json({
            success: true,
            message: 'Elasticsearch initialized and indexed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error initializing Elasticsearch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initialize Elasticsearch',
            details: error.message
        });
    }
});

// Advanced search endpoint
router.get('/search', async (req, res) => {
    try {
        const {
            q: query,
            state,
            city,
            college_type,
            management_type,
            max_fees,
            min_seats,
            program,
            page = 1,
            size = 20
        } = req.query;

        const filters = {
            state,
            city,
            college_type,
            management_type,
            max_fees: max_fees ? parseInt(max_fees) : null,
            min_seats: min_seats ? parseInt(min_seats) : null,
            program
        };

        console.log(`🔍 Advanced search: "${query}" with filters:`, filters);

        const results = await elasticsearchService.advancedSearch(
            query,
            filters,
            parseInt(page),
            parseInt(size)
        );

        res.json({
            success: true,
            data: results,
            query,
            filters,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error in advanced search:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed',
            details: error.message
        });
    }
});

// Natural language search endpoint
router.get('/natural-language', async (req, res) => {
    try {
        const { q: query, page = 1, size = 20 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required'
            });
        }

        console.log(`🗣️ Natural language search: "${query}"`);

        const results = await elasticsearchService.processNaturalLanguageQuery(
            query,
            parseInt(page),
            parseInt(size)
        );

        res.json({
            success: true,
            data: results,
            originalQuery: query,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error in natural language search:', error);
        res.status(500).json({
            success: false,
            error: 'Natural language search failed',
            details: error.message
        });
    }
});

// Search suggestions endpoint
router.get('/suggestions', async (req, res) => {
    try {
        const { q: query, size = 10 } = req.query;

        if (!query || query.length < 2) {
            return res.json({
                success: true,
                data: [],
                query
            });
        }

        console.log(`💡 Getting suggestions for: "${query}"`);

        const suggestions = await elasticsearchService.getSearchSuggestions(
            query,
            parseInt(size)
        );

        res.json({
            success: true,
            data: suggestions,
            query,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error getting suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get suggestions',
            details: error.message
        });
    }
});

// Popular searches endpoint
router.get('/popular', async (req, res) => {
    try {
        console.log('📊 Getting popular searches...');

        const popularSearches = await elasticsearchService.getPopularSearches();

        res.json({
            success: true,
            data: popularSearches,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error getting popular searches:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get popular searches',
            details: error.message
        });
    }
});

// Search analytics endpoint (admin only)
router.get('/analytics', checkAdminAuth, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        console.log('📈 Getting search analytics...');

        // Get Elasticsearch health
        const health = await elasticsearchService.healthCheck();

        // Get popular searches
        const popularSearches = await elasticsearchService.getPopularSearches();

        // Get index stats
        const indexStats = await elasticsearchService.client.indices.stats({
            index: elasticsearchService.indexName
        });

        const analytics = {
            health,
            popularSearches,
            indexStats: {
                totalDocs: indexStats.indices[elasticsearchService.indexName]?.total?.docs?.count || 0,
                totalSize: indexStats.indices[elasticsearchService.indexName]?.total?.store?.size_in_bytes || 0,
                indexName: elasticsearchService.indexName
            },
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('❌ Error getting search analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get search analytics',
            details: error.message
        });
    }
});

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const health = await elasticsearchService.healthCheck();
        
        res.json({
            success: true,
            data: health,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error in health check:', error);
        res.status(500).json({
            success: false,
            error: 'Health check failed',
            details: error.message
        });
    }
});

// Reindex colleges endpoint (admin only)
router.post('/reindex', checkAdminAuth, async (req, res) => {
    try {
        console.log('🔄 Reindexing all colleges...');
        
        await elasticsearchService.indexAllColleges();
        
        res.json({
            success: true,
            message: 'Colleges reindexed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error reindexing colleges:', error);
        res.status(500).json({
            success: false,
            error: 'Reindexing failed',
            details: error.message
        });
    }
});

// Search performance test endpoint (admin only)
router.post('/performance-test', checkAdminAuth, async (req, res) => {
    try {
        const { queries = [] } = req.body;

        if (!Array.isArray(queries) || queries.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Queries array is required'
            });
        }

        console.log('⚡ Running search performance test...');

        const results = [];
        const startTime = Date.now();

        for (const query of queries) {
            const queryStartTime = Date.now();
            
            try {
                const searchResult = await elasticsearchService.advancedSearch(query.text, query.filters || {});
                const queryTime = Date.now() - queryStartTime;
                
                results.push({
                    query: query.text,
                    filters: query.filters || {},
                    responseTime: queryTime,
                    resultsCount: searchResult.total,
                    success: true
                });
            } catch (error) {
                const queryTime = Date.now() - queryStartTime;
                
                results.push({
                    query: query.text,
                    filters: query.filters || {},
                    responseTime: queryTime,
                    error: error.message,
                    success: false
                });
            }
        }

        const totalTime = Date.now() - startTime;
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

        res.json({
            success: true,
            data: {
                totalQueries: queries.length,
                totalTime,
                averageResponseTime: avgResponseTime,
                results,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Error in performance test:', error);
        res.status(500).json({
            success: false,
            error: 'Performance test failed',
            details: error.message
        });
    }
});

module.exports = router;
