/**
 * Reusable edit icon button for DataGrid action columns.
 *
 * Also exports `editActionColumn()` — a factory that returns a complete
 * GridColDef for the action column, following the same pattern as
 * lockColumn / taskColumn / intelColumn in Opportunities/columns.tsx.
 */
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

interface EditRowButtonProps {
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

const EditRowButton: React.FC<EditRowButtonProps> = ({
  onClick,
  disabled = false,
  tooltip = 'Edit',
}) => (
  <Tooltip title={tooltip}>
    <span>{/* span wrapper allows Tooltip on disabled buttons */}
      <IconButton
        size="small"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        sx={{ p: 0.5 }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

export default EditRowButton;

/** Factory that produces a GridColDef for the edit action column. */
export function editActionColumn(
  onEditClick: (row: any) => void,
  options?: { disabled?: boolean; tooltip?: string },
): GridColDef {
  return {
    field: '__edit__',
    headerName: '',
    width: 50,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    disableExport: true,
    renderCell: (params: GridRenderCellParams) => (
      <EditRowButton
        onClick={() => onEditClick(params.row)}
        disabled={options?.disabled}
        tooltip={options?.tooltip || 'Edit'}
      />
    ),
  };
}
