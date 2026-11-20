import TablePagination from '@mui/material/TablePagination';
import { memo } from 'react';
import { PAGE_SIZES } from '@dt/shared';

interface Props {
  page: number; // 1-based
  limit: number;
  total: number;
  onChange: (update: { page?: number; limit?: number }) => void;
  pageSizes?: readonly number[];
}

export const TablePaginationBar = memo(function TablePaginationBar({
  page,
  limit,
  total,
  onChange,
  pageSizes = PAGE_SIZES,
}: Props) {
  return (
    <TablePagination
      component="div"
      count={total}
      page={total === 0 ? 0 : Math.min(page - 1, Math.max(0, Math.ceil(total / limit) - 1))}
      rowsPerPage={limit}
      rowsPerPageOptions={[...pageSizes]}
      onPageChange={(_e, p) => onChange({ page: p + 1 })}
      onRowsPerPageChange={(e) => onChange({ limit: Number(e.target.value) })}
      labelRowsPerPage="Rows per page:"
      sx={{
        borderTop: (t) => `1px dashed ${t.vars.palette.divider}`,
        '& .MuiTablePagination-toolbar': { minHeight: 64, px: { xs: 1, sm: 2.5 } },
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          typography: 'body2',
        },
        '& .MuiTablePagination-select': { fontWeight: 600 },
        '& .MuiTablePagination-spacer': { display: { xs: 'none', sm: 'block' } },
      }}
    />
  );
});
