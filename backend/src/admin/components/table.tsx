import { useMemo } from "react";
import { Table as UiTable } from "@medusajs/ui";
import { Action, ActionMenu } from "./action-menu";

export type TableProps = {
  columns: {
    key: string;
    label?: string;
    render?: (value: unknown) => React.ReactNode;
  }[];
  data: Record<string, unknown>[];
  pageSize: number;
  count: number;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  actions: Action[][];
};

export const Table = ({
  columns,
  data,
  pageSize,
  count,
  currentPage,
  setCurrentPage,
  actions,
}: TableProps) => {
  const pageCount = useMemo(() => {
    return Math.ceil(data.length / pageSize);
  }, [data, pageSize]);

  const canNextPage = useMemo(() => {
    return currentPage < pageCount - 1;
  }, [currentPage, pageCount]);
  const canPreviousPage = useMemo(() => {
    return currentPage - 1 >= 0;
  }, [currentPage]);

  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden !border-t-0">
      <UiTable>
        <UiTable.Header>
          <UiTable.Row>
            {columns.map((column, index) => (
              <UiTable.HeaderCell key={index}>
                {column.label || column.key}
              </UiTable.HeaderCell>
            ))}
          </UiTable.Row>
        </UiTable.Header>
        <UiTable.Body>
          {data.map((item, index) => {
            const rowIndex = "id" in item ? (item.id as string) : index;
            return (
              <UiTable.Row key={rowIndex}>
                {columns.map((column, index) => (
                  <UiTable.Cell key={`${rowIndex}-${index}`}>
                    <>
                      {column.render && column.render(item[column.key])}
                      {!column.render && <>{item[column.key] as string}</>}
                    </>
                  </UiTable.Cell>
                ))}
                <ActionMenu
                  groups={[
                    {
                      actions: actions[index],
                    },
                  ]}
                />
              </UiTable.Row>
            );
          })}
        </UiTable.Body>
      </UiTable>
      <UiTable.Pagination
        count={count}
        pageSize={pageSize}
        pageIndex={currentPage}
        pageCount={pageCount}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        previousPage={previousPage}
        nextPage={nextPage}
      />
    </div>
  );
};
