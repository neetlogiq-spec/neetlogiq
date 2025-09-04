/**
 * ALIASES MANAGER COMPONENT
 * 
 * Admin interface for managing the aliases system
 * Provides CRUD operations, statistics, and bulk operations
 */

import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AliasesManager = () => {
  const [aliases, setAliases] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlias, setSelectedAlias] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Form states
  const [formData, setFormData] = useState({
    entityType: 'college',
    entityId: '',
    aliasText: '',
    aliasType: 'alternative',
    confidenceScore: 1.0,
    isPrimary: false,
    context: '',
    notes: ''
  });

  const [bulkData, setBulkData] = useState('');

  useEffect(() => {
    loadAliases();
    loadStatistics();
  }, [currentPage, filterType, searchQuery]);

  const loadAliases = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });

      if (filterType !== 'all') {
        params.append('entityType', filterType);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await apiService.apiCall(`/aliases?${params}`);
      
      if (response.success) {
        setAliases(response.aliases || []);
      } else {
        setError(response.error || 'Failed to load aliases');
      }
    } catch (err) {
      setError('Failed to load aliases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await apiService.apiCall('/aliases/statistics');
      if (response.success) {
        setStatistics(response.statistics);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleCreateAlias = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.apiCall('/aliases', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (response.success) {
        setShowCreateForm(false);
        setFormData({
          entityType: 'college',
          entityId: '',
          aliasText: '',
          aliasType: 'alternative',
          confidenceScore: 1.0,
          isPrimary: false,
          context: '',
          notes: ''
        });
        loadAliases();
        loadStatistics();
      } else {
        setError(response.error || 'Failed to create alias');
      }
    } catch (err) {
      setError('Failed to create alias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlias = async (aliasId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.apiCall(`/aliases/${aliasId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      if (response.success) {
        loadAliases();
        setSelectedAlias(null);
      } else {
        setError(response.error || 'Failed to update alias');
      }
    } catch (err) {
      setError('Failed to update alias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlias = async (aliasId) => {
    if (!window.confirm('Are you sure you want to delete this alias?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.apiCall(`/aliases/${aliasId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        loadAliases();
        loadStatistics();
      } else {
        setError(response.error || 'Failed to delete alias');
      }
    } catch (err) {
      setError('Failed to delete alias: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Parse bulk data (CSV format)
      const lines = bulkData.trim().split('\n');
      const aliases = lines.map(line => {
        const [entityType, entityId, aliasText, aliasType, confidenceScore, isPrimary, context, notes] = line.split(',');
        return {
          entityType: entityType?.trim() || 'college',
          entityId: parseInt(entityId?.trim()) || 0,
          aliasText: aliasText?.trim() || '',
          aliasType: aliasType?.trim() || 'alternative',
          confidenceScore: parseFloat(confidenceScore?.trim()) || 1.0,
          isPrimary: isPrimary?.trim() === 'true',
          context: context?.trim() || '',
          notes: notes?.trim() || ''
        };
      }).filter(alias => alias.entityId > 0 && alias.aliasText);

      const response = await apiService.apiCall('/aliases/bulk/create', {
        method: 'POST',
        body: JSON.stringify({ aliases })
      });
      
      if (response.success) {
        setShowBulkForm(false);
        setBulkData('');
        loadAliases();
        loadStatistics();
        alert(`Successfully created ${response.successCount} aliases`);
      } else {
        setError(response.error || 'Failed to create aliases');
      }
    } catch (err) {
      setError('Failed to create aliases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAliasesForAllColleges = async () => {
    if (!window.confirm('This will generate aliases for all colleges. This may take a while. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.apiCall('/aliases/generate/all-colleges', {
        method: 'POST'
      });
      
      if (response.success) {
        loadAliases();
        loadStatistics();
        alert(`Generated aliases for ${response.results.length} colleges. Total: ${response.totalGenerated} aliases`);
      } else {
        setError(response.error || 'Failed to generate aliases');
      }
    } catch (err) {
      setError('Failed to generate aliases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportAliases = async () => {
    try {
      const response = await apiService.apiCall('/aliases/export?format=csv');
      
      if (response.success) {
        // Create and download CSV file
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aliases_export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to export aliases: ' + err.message);
    }
  };

  return (
    <div className="aliases-manager">
      <div className="aliases-header">
        <h1>🔍 Aliases Manager</h1>
        <p>Manage college aliases, abbreviations, and alternative names</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <h3>Total Aliases</h3>
            <div className="stat-value">{statistics.total?.total_aliases || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Unique Entities</h3>
            <div className="stat-value">{statistics.total?.unique_entities || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Auto Generated</h3>
            <div className="stat-value">{statistics.total?.auto_generated_count || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Manual</h3>
            <div className="stat-value">{statistics.total?.manual_count || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Avg Confidence</h3>
            <div className="stat-value">{(statistics.total?.avg_confidence || 0).toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h3>Total Usage</h3>
            <div className="stat-value">{statistics.total?.total_usage || 0}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="aliases-controls">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search aliases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="college">Colleges</option>
            <option value="program">Programs</option>
            <option value="city">Cities</option>
            <option value="state">States</option>
          </select>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            ➕ Create Alias
          </button>
          <button
            onClick={() => setShowBulkForm(true)}
            className="btn btn-secondary"
          >
            📦 Bulk Create
          </button>
          <button
            onClick={generateAliasesForAllColleges}
            className="btn btn-warning"
            disabled={loading}
          >
            🤖 Generate All
          </button>
          <button
            onClick={exportAliases}
            className="btn btn-info"
          >
            📤 Export
          </button>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Alias</h2>
            <form onSubmit={handleCreateAlias}>
              <div className="form-group">
                <label>Entity Type:</label>
                <select
                  value={formData.entityType}
                  onChange={(e) => setFormData({...formData, entityType: e.target.value})}
                  required
                >
                  <option value="college">College</option>
                  <option value="program">Program</option>
                  <option value="city">City</option>
                  <option value="state">State</option>
                </select>
              </div>

              <div className="form-group">
                <label>Entity ID:</label>
                <input
                  type="number"
                  value={formData.entityId}
                  onChange={(e) => setFormData({...formData, entityId: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Alias Text:</label>
                <input
                  type="text"
                  value={formData.aliasText}
                  onChange={(e) => setFormData({...formData, aliasText: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Alias Type:</label>
                <select
                  value={formData.aliasType}
                  onChange={(e) => setFormData({...formData, aliasType: e.target.value})}
                >
                  <option value="alternative">Alternative</option>
                  <option value="abbreviation">Abbreviation</option>
                  <option value="acronym">Acronym</option>
                  <option value="nickname">Nickname</option>
                  <option value="misspelling">Misspelling</option>
                  <option value="short_form">Short Form</option>
                  <option value="common_name">Common Name</option>
                </select>
              </div>

              <div className="form-group">
                <label>Confidence Score:</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.confidenceScore}
                  onChange={(e) => setFormData({...formData, confidenceScore: parseFloat(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
                  />
                  Is Primary Alias
                </label>
              </div>

              <div className="form-group">
                <label>Context:</label>
                <input
                  type="text"
                  value={formData.context}
                  onChange={(e) => setFormData({...formData, context: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Alias'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Bulk Create Aliases</h2>
            <p>Enter aliases in CSV format: entityType, entityId, aliasText, aliasType, confidenceScore, isPrimary, context, notes</p>
            <form onSubmit={handleBulkCreate}>
              <div className="form-group">
                <label>CSV Data:</label>
                <textarea
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  rows="10"
                  placeholder="college,1,A J INSTITUTE,abbreviation,0.9,false,search,Common abbreviation"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Aliases'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Aliases Table */}
      <div className="aliases-table-container">
        {loading && <div className="loading">Loading aliases...</div>}
        
        <table className="aliases-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Entity</th>
              <th>Alias Text</th>
              <th>Type</th>
              <th>Confidence</th>
              <th>Usage</th>
              <th>Primary</th>
              <th>Auto Gen</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {aliases.map(alias => (
              <tr key={alias.id}>
                <td>{alias.id}</td>
                <td>
                  <div className="entity-info">
                    <strong>{alias.entityName}</strong>
                    <small>{alias.entityType} #{alias.entityId}</small>
                  </div>
                </td>
                <td>
                  <div className="alias-text">
                    <strong>{alias.aliasText}</strong>
                    {alias.context && <small>Context: {alias.context}</small>}
                  </div>
                </td>
                <td>
                  <span className={`alias-type ${alias.aliasType}`}>
                    {alias.aliasType}
                  </span>
                </td>
                <td>
                  <div className="confidence-score">
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{width: `${alias.confidenceScore * 100}%`}}
                      />
                    </div>
                    <span>{alias.confidenceScore.toFixed(2)}</span>
                  </div>
                </td>
                <td>{alias.usageFrequency}</td>
                <td>
                  {alias.isPrimary && <span className="badge primary">Primary</span>}
                </td>
                <td>
                  {alias.isAutoGenerated && <span className="badge auto">Auto</span>}
                </td>
                <td>
                  <span className={`status ${alias.status}`}>
                    {alias.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => setSelectedAlias(alias)}
                      className="btn btn-sm btn-info"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAlias(alias.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {aliases.length === 0 && !loading && (
          <div className="no-data">
            No aliases found. Create your first alias to get started.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedAlias && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Alias</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateAlias(selectedAlias.id, {
                aliasText: selectedAlias.aliasText,
                aliasType: selectedAlias.aliasType,
                confidenceScore: selectedAlias.confidenceScore,
                isPrimary: selectedAlias.isPrimary,
                context: selectedAlias.context,
                notes: selectedAlias.notes,
                status: selectedAlias.status
              });
            }}>
              <div className="form-group">
                <label>Alias Text:</label>
                <input
                  type="text"
                  value={selectedAlias.aliasText}
                  onChange={(e) => setSelectedAlias({...selectedAlias, aliasText: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Alias Type:</label>
                <select
                  value={selectedAlias.aliasType}
                  onChange={(e) => setSelectedAlias({...selectedAlias, aliasType: e.target.value})}
                >
                  <option value="alternative">Alternative</option>
                  <option value="abbreviation">Abbreviation</option>
                  <option value="acronym">Acronym</option>
                  <option value="nickname">Nickname</option>
                  <option value="misspelling">Misspelling</option>
                  <option value="short_form">Short Form</option>
                  <option value="common_name">Common Name</option>
                </select>
              </div>

              <div className="form-group">
                <label>Confidence Score:</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedAlias.confidenceScore}
                  onChange={(e) => setSelectedAlias({...selectedAlias, confidenceScore: parseFloat(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAlias.isPrimary}
                    onChange={(e) => setSelectedAlias({...selectedAlias, isPrimary: e.target.checked})}
                  />
                  Is Primary Alias
                </label>
              </div>

              <div className="form-group">
                <label>Context:</label>
                <input
                  type="text"
                  value={selectedAlias.context || ''}
                  onChange={(e) => setSelectedAlias({...selectedAlias, context: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  value={selectedAlias.notes || ''}
                  onChange={(e) => setSelectedAlias({...selectedAlias, notes: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select
                  value={selectedAlias.status}
                  onChange={(e) => setSelectedAlias({...selectedAlias, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Alias'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAlias(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AliasesManager;
