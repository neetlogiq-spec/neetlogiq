# Medical College Management System - Architecture Documentation

## 🏗️ **System Architecture Overview**

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (SQLite3)     │
│   Port: 4001    │    │   Port: 4000    │    │   Multiple DBs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Advanced Search │    │   API Gateway   │    │ Data Migration │
│   Engine        │    │   & Auth        │    │   & Staging    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Technology Stack**

### **Frontend Layer**
- **Framework**: React.js 18+ with Vite build tool
- **UI Library**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Hooks (useState, useEffect, useCallback, useMemo)
- **Routing**: React Router DOM for navigation
- **Build Tool**: Vite for fast development and optimized builds

### **Backend Layer**
- **Runtime**: Node.js with Express.js framework
- **Authentication**: Basic Authentication middleware
- **CORS**: Configured for frontend-backend communication
- **Middleware**: Compression, body parsing, error handling
- **Port Management**: Dynamic port allocation with conflict resolution

### **Database Layer**
- **Primary Database**: `clean-unified.db` (4.2MB) - Main operational data
- **Staging Database**: `staging_cutoffs.db` (16MB) - Cutoff import workflow
- **Error Correction**: `error_corrections.db` (12KB) - Data cleaning rules
- **Engine**: SQLite3 for lightweight, file-based storage

## 🗄️ **Database Architecture**

### **Database Schema Overview**
```sql
-- Main Database: clean-unified.db
colleges (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  college_type TEXT,
  management_type TEXT,
  city TEXT,
  state TEXT,
  district TEXT,
  establishment_year INTEGER
);

programs (
  id INTEGER PRIMARY KEY,
  college_id INTEGER,
  name TEXT NOT NULL,
  course_type TEXT,
  specialization TEXT,
  seats INTEGER,
  FOREIGN KEY (college_id) REFERENCES colleges(id)
);

-- Staging Database: staging_cutoffs.db
raw_cutoffs (
  id INTEGER PRIMARY KEY,
  college_name TEXT,
  course_name TEXT,
  category TEXT,
  rank INTEGER,
  year INTEGER,
  status TEXT
);

-- Error Correction Database: error_corrections.db
error_corrections (
  id INTEGER PRIMARY KEY,
  pattern TEXT,
  replacement TEXT,
  field_type TEXT,
  priority INTEGER
);
```

### **Database Relationships**
- **One-to-Many**: College → Programs
- **Many-to-One**: Programs → College
- **Independent**: Cutoffs, Error Corrections

## 🔍 **Advanced Search Architecture**

### **Search Algorithm Pipeline**
```
User Input → Query Preprocessing → Multi-Algorithm Search → Result Scoring → Filtered Results
     │              │                    │                    │              │
     ▼              ▼                    ▼                    ▼              ▼
Search Term → Normalization → Fuzzy/Phonetic/Wildcard → Relevance → Display
```

### **Search Algorithms Implementation**
1. **Fuzzy Search**: Levenshtein distance with configurable thresholds
2. **Phonetic Search**: Soundex and Metaphone algorithms
3. **Wildcard Search**: Pattern matching with * and ? support
4. **Regex Search**: Regular expression pattern matching
5. **Synonym Search**: Medical domain knowledge integration
6. **Location Search**: Geographic variations and abbreviations
7. **Semantic Search**: Word overlap and similarity scoring

### **Search Field Configuration**
```javascript
const searchFields = [
  { text: 'name', weight: 10, type: 'college' },
  { text: 'location', weight: 8, type: 'city' },
  { text: 'state', weight: 6, type: 'state' },
  { text: 'type', weight: 4, type: 'type' },
  { text: 'management_type', weight: 3, type: 'management' },
  { text: 'district', weight: 5, type: 'district' }
];
```

## 🚀 **API Architecture**

### **RESTful Endpoint Structure**
```
/api/sector_xp_12/
├── colleges/                    # College management
│   ├── GET /                   # List all colleges
│   ├── GET /:id               # Get specific college
│   └── GET /:id/courses      # Get college programs
├── programs/                   # Program management
│   ├── GET /                  # List all programs
│   └── GET /:id              # Get specific program
├── admin/                     # Administrative functions
│   ├── cutoffs/              # Cutoff import workflow
│   │   ├── sessions/         # Import session management
│   │   ├── import/           # Data import
│   │   └── migrate/          # Staging to production
│   └── error-corrections/    # Error correction management
└── health/                    # System health check
```

### **Authentication & Security**
- **Basic Authentication**: Username/password for admin access
- **CORS Configuration**: Restricted to frontend origin
- **Rate Limiting**: Request throttling for API protection
- **Input Validation**: Sanitization and validation middleware

## 🧩 **Component Architecture**

### **Frontend Component Hierarchy**
```
App.jsx
├── Router
│   ├── Public Routes
│   │   ├── Dashboard
│   │   ├── Colleges
│   │   └── Cutoffs
│   └── Admin Routes
│       ├── CollegesManagement
│       ├── Programs
│       ├── CutoffImportManager
│       └── ErrorCorrectionManager
└── Shared Components
    ├── AdvancedSearch
    ├── ModernLayout
    └── AdminLayout
```

### **AdvancedSearch Component Architecture**
```javascript
AdvancedSearch
├── Props Interface
│   ├── data: Array          # Searchable data
│   ├── searchFields: Array  # Field configuration
│   ├── onSearch: Function   # Search callback
│   └── options: Object      # Search preferences
├── State Management
│   ├── searchTerm: String   # Current search input
│   ├── suggestions: Array   # Search suggestions
│   └── searchOptions: Object # Algorithm settings
└── Search Engine
    ├── Query Processing     # Input normalization
    ├── Algorithm Execution  # Multi-algorithm search
    ├── Result Scoring       # Relevance calculation
    └── Suggestion Generation # Smart suggestions
```

## 🔄 **Data Flow Architecture**

### **Search Flow**
1. **User Input**: Search term entered in AdvancedSearch component
2. **Query Processing**: Input normalized and validated
3. **Algorithm Execution**: Multiple search algorithms run in parallel
4. **Result Aggregation**: Results combined and scored
5. **Filtering**: Results filtered by relevance and user preferences
6. **Display**: Filtered results shown with search metadata

### **Data Import Flow**
1. **File Upload**: Excel/CSV files uploaded to staging
2. **Data Validation**: Automated validation with error detection
3. **Error Correction**: Rule-based and manual corrections
4. **Staging Review**: Data reviewed in staging environment
5. **Production Migration**: Validated data moved to production
6. **Audit Trail**: Complete history of data changes

## 📊 **Performance Architecture**

### **Optimization Strategies**
- **Database Indexing**: Strategic indexes on search fields
- **Query Optimization**: Efficient SQL queries with proper joins
- **Caching Strategy**: Redis integration for search results
- **Lazy Loading**: Progressive data loading for large datasets
- **Debouncing**: Search input throttling for performance

### **Scalability Considerations**
- **Horizontal Scaling**: Multiple backend instances
- **Load Balancing**: Distribution of incoming requests
- **Database Sharding**: Partitioning by geographic regions
- **CDN Integration**: Static asset optimization
- **Microservices**: Potential service decomposition

## 🧪 **Testing Architecture**

### **Testing Strategy**
- **Unit Testing**: Individual component testing
- **Integration Testing**: API endpoint testing
- **End-to-End Testing**: Complete user workflow testing
- **Performance Testing**: Load and stress testing
- **Search Accuracy Testing**: Algorithm validation

### **BMAD-METHOD Integration**
- **AI Agent Testing**: Automated testing with AI agents
- **Workflow Validation**: AI-powered workflow validation
- **Quality Assurance**: Automated quality checks
- **Performance Monitoring**: AI-driven performance analysis

## 🔒 **Security Architecture**

### **Security Layers**
1. **Authentication**: Basic auth with secure credential storage
2. **Authorization**: Role-based access control
3. **Input Validation**: Comprehensive input sanitization
4. **SQL Injection Prevention**: Parameterized queries
5. **Rate Limiting**: API abuse prevention
6. **Audit Logging**: Complete action tracking

### **Data Protection**
- **Encryption**: Sensitive data encryption at rest
- **Backup Strategy**: Automated backup and recovery
- **Access Control**: Principle of least privilege
- **Monitoring**: Real-time security monitoring

## 📈 **Monitoring & Observability**

### **System Monitoring**
- **Health Checks**: API endpoint health monitoring
- **Performance Metrics**: Response time and throughput
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Search behavior and usage patterns

### **BMAD-METHOD Monitoring**
- **AI Agent Health**: Agent performance and availability
- **Workflow Metrics**: Automated workflow success rates
- **Quality Metrics**: AI-driven quality assessments
- **Predictive Analytics**: Proactive issue detection

---

**Architecture Version**: v2.1  
**Last Updated**: August 26, 2025  
**BMAD-METHOD™ Version**: v4.41.0  
**Status**: Implementation Complete
