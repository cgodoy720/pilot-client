import React, { memo, useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';

const ITEMS_PER_PAGE = 50;

const CompaniesTab = ({
  companies,
  companiesViewMode,
  setCompaniesViewMode,
  handleCompanyClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return companies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [companies, currentPage]);

  // Reset to page 1 when companies list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [companies.length]);
  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?';
  };

  const getInitialColor = (companyName) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    const charCode = companyName ? companyName.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  return (
    <div className="w-full space-y-4">
      {/* View Mode Toggle */}
      <div className="flex gap-2 justify-end">
        <Tabs value={companiesViewMode} onValueChange={setCompaniesViewMode}>
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
              </svg>
              Table
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
              Cards
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table View */}
      {companiesViewMode === 'table' && (
        <Card className="bg-white">
          <CardContent className="p-0">
            {companies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No companies found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Total Applications</TableHead>
                      <TableHead>Interviews</TableHead>
                      <TableHead>Offers</TableHead>
                      <TableHead>Rejections</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCompanies.map((company, index) => (
                      <TableRow 
                        key={index}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleCompanyClick(company)}
                      >
                        <TableCell className="font-medium">{company.company_name}</TableCell>
                        <TableCell>{company.application_count || 0}</TableCell>
                        <TableCell>{company.interview_count || 0}</TableCell>
                        <TableCell>{company.offer_count || 0}</TableCell>
                        <TableCell>{company.rejected_count || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, companies.length)} of {companies.length} companies
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
      )}

      {/* Card Grid View */}
      {companiesViewMode === 'cards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No companies found</p>
              </div>
            ) : (
              paginatedCompanies.map((company, index) => (
                <Card
                  key={index}
                  className="bg-white border border-gray-200 hover:border-[#4242ea] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleCompanyClick(company)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      {company.company_logo ? (
                        <img
                          src={company.company_logo}
                          alt={company.company_name}
                          className="w-10 h-10 rounded object-contain bg-white border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = e.target.nextElementSibling;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                        style={{
                          backgroundColor: getInitialColor(company.company_name),
                          display: company.company_logo ? 'none' : 'flex'
                        }}
                      >
                        {getCompanyInitial(company.company_name)}
                      </div>
                      <h3 className="font-semibold text-base text-gray-900 flex-1 truncate">
                        {company.company_name}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {company.application_count || 0}
                        </div>
                        <div className="text-xs text-gray-600">Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {company.interview_count || 0}
                        </div>
                        <div className="text-xs text-gray-600">Interviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {company.offer_count || 0}
                        </div>
                        <div className="text-xs text-gray-600">Offers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {company.rejected_count || 0}
                        </div>
                        <div className="text-xs text-gray-600">Rejections</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, companies.length)} of {companies.length} companies
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
    </div>
  );
};

export default memo(CompaniesTab);

