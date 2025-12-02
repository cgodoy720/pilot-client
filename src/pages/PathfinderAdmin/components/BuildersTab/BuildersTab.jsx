import React, { memo, useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';

const ITEMS_PER_PAGE = 50;

const BuildersTab = ({
  builders,
  builderSortConfig,
  handleBuilderSort,
  getSortedBuilders,
  handleBuilderClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const sortedBuilders = useMemo(() => getSortedBuilders(), [getSortedBuilders]);
  const totalPages = Math.ceil(sortedBuilders.length / ITEMS_PER_PAGE);
  const paginatedBuilders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedBuilders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedBuilders, currentPage]);

  // Reset to page 1 when builders list changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [builders.length]);
  const SortableHeader = ({ sortKey, children }) => (
    <TableHead 
      className="cursor-pointer select-none hover:bg-gray-50 transition-colors"
      onClick={() => handleBuilderSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        {builderSortConfig.key === sortKey && (
          <span className="text-xs">
            {builderSortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="w-full">
      <Card className="bg-white">
        <CardContent className="p-0">
          {builders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No builders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader sortKey="name">Name</SortableHeader>
                    <SortableHeader sortKey="networking_count">Hustles</SortableHeader>
                    <SortableHeader sortKey="total_projects">Build Projects</SortableHeader>
                    <SortableHeader sortKey="application_count">Applications</SortableHeader>
                    <SortableHeader sortKey="interview_count">Interviews</SortableHeader>
                    <SortableHeader sortKey="offer_count">Offers</SortableHeader>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBuilders.map(builder => (
                    <TableRow key={builder.builder_id}>
                      <TableCell className="font-medium">
                        {builder.first_name} {builder.last_name}
                      </TableCell>
                      <TableCell>{builder.networking_count || 0}</TableCell>
                      <TableCell>
                        {builder.total_projects > 0 ? (
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="font-semibold">Total: {builder.total_projects}</div>
                            {builder.projects_ideation > 0 && (
                              <div className="text-gray-600">Ideation: {builder.projects_ideation}</div>
                            )}
                            {builder.projects_planning > 0 && (
                              <div className="text-gray-600">Planning: {builder.projects_planning}</div>
                            )}
                            {builder.projects_development > 0 && (
                              <div className="text-gray-600">Development: {builder.projects_development}</div>
                            )}
                            {builder.projects_testing > 0 && (
                              <div className="text-gray-600">Testing: {builder.projects_testing}</div>
                            )}
                            {builder.projects_launched > 0 && (
                              <div className="text-gray-600">Launched: {builder.projects_launched}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>{builder.application_count || 0}</TableCell>
                      <TableCell>{builder.interview_count || 0}</TableCell>
                      <TableCell>{builder.offer_count || 0}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBuilderClick(builder)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedBuilders.length)} of {sortedBuilders.length} builders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(BuildersTab);

