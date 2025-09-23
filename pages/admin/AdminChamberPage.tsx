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
    country: 'Libya',
    isActive: true
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await getBranches();
      if (response.success && response.data) {
        setBranches(response.data);
      } else {
        setError('Failed to fetch chambers');
      }
    } catch (err) {
      setError('Error fetching chambers: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setNewBranch({
      name: '',
      address: '',
      city: '',
      region: '',
      country: 'Libya',
      isActive: true
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await createBranch(newBranch);
      if (response.success) {
        fetchBranches();
        handleCloseDialog();
      } else {
        setError('Failed to create chamber');
      }
    } catch (err) {
      setError('Error creating chamber: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography component="h1" variant="h5">
          {t('adminPages.chambers.title', 'Chamber Management')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          {t('adminPages.chambers.create', 'Create Chamber')}
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('adminPages.chambers.table.id', 'ID')}</TableCell>
                <TableCell>{t('adminPages.chambers.table.name', 'Chamber Name')}</TableCell>
                <TableCell>{t('adminPages.chambers.table.city', 'City')}</TableCell>
                <TableCell>{t('adminPages.chambers.table.region', 'Region')}</TableCell>
                <TableCell>{t('adminPages.chambers.table.address', 'Address')}</TableCell>
                <TableCell>{t('adminPages.chambers.table.status', 'Status')}</TableCell>
                <TableCell>{t('adminPages.chambers.table.actions', 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : branches?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {t('adminPages.chambers.noChambers', 'No chambers found')}
                  </TableCell>
                </TableRow>
              ) : (
                branches
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  ?.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>{branch.id}</TableCell>
                      <TableCell>{branch.name}</TableCell>
                      <TableCell>{branch.city}</TableCell>
                      <TableCell>{branch.region}</TableCell>
                      <TableCell>{branch.address}</TableCell>
                      <TableCell>{branch.isActive ? t('status.active', 'Active') : t('status.inactive', 'Inactive')}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={branches?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Create Chamber Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('adminPages.chambers.createTitle', 'Create New Chamber')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <TextField
                label={t('adminPages.chambers.form.name', 'Chamber Name')}
                name="name"
                value={newBranch.name}
                onChange={handleInputChange}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label={t('adminPages.chambers.form.address', 'Address')}
                name="address"
                value={newBranch.address}
                onChange={handleInputChange}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label={t('adminPages.chambers.form.city', 'City')}
                name="city"
                value={newBranch.city}
                onChange={handleInputChange}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label={t('adminPages.chambers.form.region', 'Region')}
                name="region"
                value={newBranch.region}
                onChange={handleInputChange}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label={t('adminPages.chambers.form.country', 'Country')}
                name="country"
                value={newBranch.country}
                onChange={handleInputChange}
                required
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel', 'Cancel')}</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!newBranch.name || !newBranch.address || !newBranch.city || !newBranch.region || !newBranch.country}
          >
            {t('common.create', 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminChamberPage;
