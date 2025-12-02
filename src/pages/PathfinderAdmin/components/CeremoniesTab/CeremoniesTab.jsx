import React, { memo } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';

const CeremoniesTab = ({
  ceremonies,
  archivedCeremonies,
  showArchiveModal,
  setShowArchiveModal,
  fetchArchivedCeremonies,
  handleArchiveCeremony
}) => {
  const getCeremonyIcon = (type) => {
    const baseClasses = "w-8 h-8 rounded cursor-pointer hover:opacity-80 transition-opacity";
    
    switch (type) {
      case 'interview':
        return `${baseClasses} bg-gray-300 rounded-full`; // White/gray ping pong balls
      case 'job':
        return `${baseClasses} bg-purple-500 rounded-full`; // Purple ping pong balls
      case 'build':
        return `${baseClasses} bg-blue-500 rounded-sm`; // Blue blocks/squares
      default:
        return `${baseClasses} bg-gray-400 rounded-full`;
    }
  };

  const getCeremonyCount = (type) => {
    return ceremonies.filter(c => c.ceremony_type === type).length;
  };

  const getCeremoniesOfType = (type) => {
    return ceremonies.filter(c => c.ceremony_type === type);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const CeremonySection = ({ type, title, ceremonies: sectionCeremonies }) => (
    <Card className="bg-white border-[#e0e0e0]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {getCeremonyCount(type)}
          </Badge>
          <CardTitle className="text-lg font-semibold text-[#1a1a1a]">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {sectionCeremonies.length === 0 ? (
          <div className="text-center py-8 text-[#666]">
            No {title.toLowerCase()} yet
          </div>
        ) : (
          <div className="grid gap-3">
            {sectionCeremonies.map((ceremony, index) => (
              <div key={`${type}-${index}`} className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg hover:bg-[#e9ecef] transition-colors">
                <div 
                  className={getCeremonyIcon(type)}
                  onClick={() => handleArchiveCeremony(ceremony)}
                  title="Click to mark as celebrated"
                />
                <div className="flex-1">
                  <div className="font-medium text-[#1a1a1a]">
                    {ceremony.builder_first_name} {ceremony.builder_last_name}
                  </div>
                  <div className="text-sm text-[#666]">
                    {type === 'build' ? (
                      ceremony.project_name
                    ) : (
                      <>
                        {ceremony.company_name && `${ceremony.company_name} - `}
                        {ceremony.role_title}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm text-[#666]">
                  {formatDate(ceremony.ceremony_date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">Builder Ceremonies</h2>
          <p className="text-[#666]">Celebrating key milestones in the builder journey</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            fetchArchivedCeremonies();
            setShowArchiveModal(true);
          }}
        >
          View Archive
        </Button>
      </div>

      {/* Ceremony Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CeremonySection
          type="interview"
          title="Interviews"
          ceremonies={getCeremoniesOfType('interview')}
        />
        
        <CeremonySection
          type="job"
          title="Jobs & Offers"
          ceremonies={getCeremoniesOfType('job')}
        />
        
        <CeremonySection
          type="build"
          title="Builds"
          ceremonies={getCeremoniesOfType('build')}
        />
      </div>

      {/* Archive Modal */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Celebrated Ceremonies Archive</DialogTitle>
          </DialogHeader>
          
          {archivedCeremonies.length === 0 ? (
            <div className="text-center py-8 text-[#666]">
              No archived ceremonies yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Title / Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Milestone Date</TableHead>
                  <TableHead>Celebrated Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedCeremonies.map((ceremony, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {ceremony.first_name} {ceremony.last_name}
                    </TableCell>
                    <TableCell>
                      {ceremony.ceremony_type === 'build' 
                        ? ceremony.project_name 
                        : `${ceremony.company_name || ''} - ${ceremony.role_title || ''}`}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          ceremony.ceremony_type === 'interview' ? 'bg-gray-100 text-gray-700' :
                          ceremony.ceremony_type === 'job' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {ceremony.ceremony_type === 'interview' ? 'Interview' : 
                         ceremony.ceremony_type === 'job' ? 'Job/Offer' : 'Build'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(ceremony.milestone_date)}
                    </TableCell>
                    <TableCell>
                      {formatDate(ceremony.celebrated_date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(CeremoniesTab);
