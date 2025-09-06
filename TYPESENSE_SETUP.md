# Typesense Integration Setup for NeetLogIQ

## 🚀 **Overview**

Typesense provides advanced natural language search capabilities for NeetLogIQ, including:
- **Typo tolerance** - Finds results even with spelling mistakes
- **Faceted search** - Filter by city, state, college type, etc.
- **Natural language queries** - "Medical colleges in Mumbai" works perfectly
- **Fast search** - Sub-millisecond response times
- **Highlighting** - Shows matching text in results

## 📋 **Setup Instructions**

### 1. **Start Typesense**
```bash
# Run the setup script
./setup-typesense.sh

# Or manually start with Docker
docker-compose -f docker-compose.typesense.yml up -d
```

### 2. **Start Backend**
```bash
cd cloudflare-workers
npx wrangler dev
```

### 3. **Index Data**
```bash
# Index colleges
curl -X POST http://localhost:8787/api/typesense/index/colleges

# Index courses  
curl -X POST http://localhost:8787/api/typesense/index/courses
```

### 4. **Test Search**
```bash
# Search colleges
curl "http://localhost:8787/api/typesense/search/colleges?q=medical%20college%20mumbai"

# Search courses
curl "http://localhost:8787/api/typesense/search/courses?q=mbbs%20delhi"
```

## 🔧 **API Endpoints**

### **Search Endpoints**
- `GET /api/typesense/search/colleges?q=query` - Search colleges
- `GET /api/typesense/search/courses?q=query` - Search courses
- `GET /api/typesense/health` - Health check

### **Management Endpoints**
- `POST /api/typesense/index/colleges` - Index colleges data
- `POST /api/typesense/index/courses` - Index courses data

## 🎯 **Natural Language Examples**

### **College Search**
- "Medical colleges in Mumbai"
- "Government engineering colleges in Karnataka"
- "Private colleges near me"
- "AIIMS Delhi" (finds All India Institute of Medical Sciences)

### **Course Search**
- "MBBS courses in Delhi"
- "Engineering courses in Bangalore"
- "Medical courses with NEET"
- "BDS in Maharashtra"

## 🚀 **Frontend Integration**

### **Basic Usage**
```jsx
import TypesenseSearchBar from './components/TypesenseSearchBar';

<TypesenseSearchBar
  onSearchResults={(results) => console.log(results)}
  type="colleges" // or "courses" or "all"
  placeholder="Search with natural language..."
/>
```

### **Advanced Usage with Hook**
```jsx
import { useTypesenseSearch } from './hooks/useTypesenseSearch';

const { 
  query, 
  results, 
  isLoading, 
  performSearch,
  searchWithFilters 
} = useTypesenseSearch({ type: 'colleges' });
```

## 🔍 **Search Features**

### **Typo Tolerance**
- "medcal" → finds "medical"
- "mumbi" → finds "Mumbai"
- "govenment" → finds "government"

### **Faceted Search**
- Filter by city, state, college type
- Filter by course stream, program
- Filter by management type

### **Natural Language Processing**
- "Colleges in Mumbai" → filters by city
- "Government medical colleges" → filters by type and management
- "MBBS courses" → searches for MBBS specifically

## 📊 **Performance**

- **Search Speed**: < 10ms average response time
- **Typo Tolerance**: Up to 2 typos per word
- **Faceted Search**: Real-time filtering
- **Caching**: Built-in result caching

## 🛠 **Configuration**

### **Environment Variables**
```bash
TYPESENSE_URL=http://localhost:8108
TYPESENSE_API_KEY=xyz
```

### **Collection Schema**
- **Colleges**: name, city, state, college_type, management_type
- **Courses**: course_name, stream, program, college_name, college_city

## 🔧 **Troubleshooting**

### **Typesense Not Starting**
```bash
# Check logs
docker-compose -f docker-compose.typesense.yml logs

# Restart
docker-compose -f docker-compose.typesense.yml restart
```

### **Search Not Working**
```bash
# Check health
curl http://localhost:8108/health

# Check collections
curl -H "X-TYPESENSE-API-KEY: xyz" http://localhost:8108/collections
```

### **Data Not Indexed**
```bash
# Re-index data
curl -X POST http://localhost:8787/api/typesense/index/colleges
curl -X POST http://localhost:8787/api/typesense/index/courses
```

## 🎉 **Benefits**

1. **Better Search Results** - Finds relevant results even with typos
2. **Natural Language** - Users can search naturally
3. **Fast Performance** - Sub-millisecond search times
4. **Faceted Search** - Easy filtering and refinement
5. **Highlighting** - Shows matching text in results
6. **Scalable** - Handles millions of documents

## 🔄 **Migration from SQL Search**

The existing SQL-based search will continue to work alongside Typesense. You can:

1. **Gradually migrate** - Use Typesense for new search features
2. **A/B test** - Compare SQL vs Typesense results
3. **Hybrid approach** - Use both for different use cases

## 📈 **Next Steps**

1. **Start Typesense** using the setup script
2. **Index your data** using the API endpoints
3. **Integrate frontend** using the provided components
4. **Test natural language queries** to see the power of Typesense!

---

**Happy Searching! 🔍✨**
