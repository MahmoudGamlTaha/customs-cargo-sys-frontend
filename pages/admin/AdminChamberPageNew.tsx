import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getBranches, createBranch, Branch, ApiListResult } from '../../services/branchService';

// CSS classes for styling without Material UI
import './AdminChamberPage.css';

const AdminChamberPage: React.FC = () => {
  const { t } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [newBranch, setNewBranch] = useState<Omit<Branch, 'id'>>({
    name: '',
    address: '',
    city: '',
    region: '',
    country: '',
  });
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const result = await getBranches();
      if (result.success && result.data) {
        setBranches(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.message || t('adminPages.chambers.loadError', 'Failed to load chambers'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    try {
      const result = await createBranch(newBranch);
      if (result.success) {
        setOpenDialog(false);
        fetchBranches();
        // Reset form
        setNewBranch({
          name: '',
          address: '',
          city: '',
          region: '',
          country: '',
        });
      } else {
        setError(result.message || t('adminPages.chambers.createError', 'Failed to create chamber'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Calculate displayed branches based on pagination
  const displayedBranches = branches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="chamber-page-container">
      <div className="page-header">
        <h1 className="page-title">{t('adminPages.chambers.title')}</h1>
        <button className="create-button" onClick={() => setOpenDialog(true)}>
          + {t('adminPages.chambers.create')}
        </button>
      </div>

      <div className="chambers-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : branches?.length === 0 ? (
          <div className="empty-message">{t('adminPages.chambers.noChambers')}</div>
        ) : (
          <>
            <table className="chambers-table">
              <thead>
                <tr>
                  <th>{t('adminPages.chambers.table.id')}</th>
                  <th>{t('adminPages.chambers.table.name')}</th>
                  <th>{t('adminPages.chambers.table.city')}</th>
                  <th>{t('adminPages.chambers.table.region')}</th>
                  <th>{t('adminPages.chambers.table.address')}</th>
                  <th>{t('adminPages.chambers.table.status')}</th>
                  <th>{t('adminPages.chambers.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {displayedBranches?.map((branch) => (
                  <tr key={branch.id}>
                    <td>{branch.id}</td>
                    <td>{branch.name}</td>
                    <td>{branch.city || '-'}</td>
                    <td>{branch.region || '-'}</td>
                    <td>{branch.address || '-'}</td>
                    <td>
                      <span className={`status-badge ${branch.isActive ? 'status-active' : 'status-inactive'}`}>
                        {branch.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-button edit-icon" aria-label="Edit">
                          ✏️
                        </button>
                        <button className="icon-button delete-icon" aria-label="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <div className="pagination-info">
                {t('common.showing', 'Showing')} {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, branches?.length)} {t('common.of', 'of')} {branches?.length}
              </div>
              <div className="pagination-controls">
                <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="rows-per-page-select">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <button
                  className="pagination-button"
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                >
                  ◀
                </button>
                <span className="page-number">{page + 1}</span>
                <button
                  className="pagination-button"
                  disabled={(page + 1) * rowsPerPage >= branches?.length}
                  onClick={() => handlePageChange(page + 1)}
                >
                  ▶
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Branch Dialog */}
      {openDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-title">{t('adminPages.chambers.createTitle')}</div>
            <div className="dialog-content">
              <div className="form-group">
                <label className="form-label">{t('adminPages.chambers.form.name')}</label>
                <input
                  type="text"
                  name="name"
                  value={newBranch.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('adminPages.chambers.form.address')}</label>
                <input
                  type="text"
                  name="address"
                  value={newBranch.address || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('adminPages.chambers.form.city')}</label>
                <input
                  type="text"
                  name="city"
                  value={newBranch.city || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('adminPages.chambers.form.region')}</label>
                <input
                  type="text"
                  name="region"
                  value={newBranch.region || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('adminPages.chambers.form.country')}</label>
                <input
                  type="text"
                  name="country"
                  value={newBranch.country || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
            <div className="dialog-actions">
              <button className="button-secondary" onClick={() => setOpenDialog(false)}>
                {t('staffPages.common.cancel', 'Cancel')}
              </button>
              <button className="button-primary" onClick={handleCreateBranch}>
                {t('staffPages.common.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChamberPage;
