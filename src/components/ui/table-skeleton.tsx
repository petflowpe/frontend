import { Skeleton } from './skeleton';
import { TableCell, TableRow } from './table';

interface TableSkeletonRowsProps {
  /** Columnas de datos (sin contar la del checkbox). */
  columnsCount: number;
  rowsCount?: number;
  hasCheckbox?: boolean;
}

/** Filas de carga para tablas, equivalente al `TableSkeletonRows` de Grooflow. */
export function TableSkeletonRows({
  columnsCount,
  rowsCount = 5,
  hasCheckbox = false,
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} className="border-border/60">
          {hasCheckbox && (
            <TableCell>
              <Skeleton className="h-4 w-4 rounded" />
            </TableCell>
          )}
          {Array.from({ length: columnsCount }).map((__, colIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
              <Skeleton className="h-4 w-full max-w-[160px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
