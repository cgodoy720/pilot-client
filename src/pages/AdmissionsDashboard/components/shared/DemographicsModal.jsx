import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';

const DemographicsModal = ({
  isOpen,
  onClose,
  title,
  data,
  activeView,
  setActiveView
}) => {
  if (!isOpen) return null;

  const { race = [], gender = [], education = [] } = data || {};

  // Calculate total for percentages
  const getTotal = (arr) => arr.reduce((sum, item) => sum + (item.count || 0), 0);

  // Render demographic list
  const renderList = (items) => {
    const total = getTotal(items);
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400 font-proxima">
          No data available
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item, idx) => {
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
          return (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium text-[#1a1a1a] font-proxima truncate flex-1 mr-4">
                {item.label || 'Unknown'}
              </span>
              <div className="flex items-center gap-4">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4242ea] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 font-proxima w-16 text-right">
                  {item.count} ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col font-proxima">
        <DialogHeader>
          <DialogTitle className="text-xl font-proxima-bold text-[#1a1a1a]">
            {title || 'Demographics'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="race" className="font-proxima">
              Race/Ethnicity ({race.length})
            </TabsTrigger>
            <TabsTrigger value="gender" className="font-proxima">
              Gender ({gender.length})
            </TabsTrigger>
            <TabsTrigger value="education" className="font-proxima">
              Education ({education.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
            <TabsContent value="race" className="mt-0">
              {renderList(race)}
            </TabsContent>

            <TabsContent value="gender" className="mt-0">
              {renderList(gender)}
            </TabsContent>

            <TabsContent value="education" className="mt-0">
              {renderList(education)}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="font-proxima">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DemographicsModal;

