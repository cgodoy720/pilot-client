/**
 * Custom edit-cell components for the Opportunities DataGrid.
 *
 * These provide Autocomplete-based lookup for Account and Owner fields
 * when editing a row inline.
 */
import React from 'react';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { apiService } from '../../services/api';

export function AccountEditCell(props: GridRenderEditCellParams) {
  const { id, value, field, hasFocus } = props;
  const apiRef = useGridApiContext();
  const [options, setOptions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await apiService.getAccounts();
        setOptions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };
    fetchAccounts();
  }, []);

  const handleChange = (_event: any, newValue: any) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue?.Id || '' });
  };

  const selectedAccount = options.find((acc) => acc.Id === value);

  return (
    <Autocomplete
      value={selectedAccount || null}
      onChange={handleChange}
      options={options}
      getOptionLabel={(option) => option.Name || ''}
      isOptionEqualToValue={(option, val) => option.Id === val?.Id}
      autoFocus={hasFocus}
      fullWidth
      sx={{ width: '100%' }}
      renderInput={(params) => (
        <TextField {...params} placeholder="Search accounts..." variant="standard" />
      )}
    />
  );
}

export function OwnerEditCell(props: GridRenderEditCellParams) {
  const { id, value, field, hasFocus } = props;
  const apiRef = useGridApiContext();
  const [options, setOptions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiService.getUsers({ limit: 1000 });
        setOptions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (_event: any, newValue: any) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue?.Id || '' });
  };

  const selectedUser = options.find((user) => user.Id === value);

  const sortedOptions = React.useMemo(() =>
    [...options].sort((a, b) => {
      const aActive = a.IsActive !== false ? 0 : 1;
      const bActive = b.IsActive !== false ? 0 : 1;
      return aActive !== bActive ? aActive - bActive : (a.Name || '').localeCompare(b.Name || '');
    }),
    [options],
  );

  return (
    <Tooltip title="Changing the owner may affect who can edit this opportunity" placement="top">
      <Autocomplete
        value={selectedUser || null}
        onChange={handleChange}
        options={sortedOptions}
        groupBy={(option) => option.IsActive === false ? 'Inactive' : 'Active'}
        getOptionLabel={(option) => option.Name || ''}
        isOptionEqualToValue={(option, val) => option.Id === val?.Id}
        autoFocus={hasFocus}
        fullWidth
        sx={{ width: '100%' }}
        renderInput={(params) => (
          <TextField {...params} placeholder="Search users..." variant="standard" />
        )}
      />
    </Tooltip>
  );
}
