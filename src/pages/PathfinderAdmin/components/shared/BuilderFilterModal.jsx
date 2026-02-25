import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Label } from '../../../../components/ui/label';

const BuilderFilterModal = ({ 
  open, 
  onOpenChange, 
  builders, 
  selectedBuilder, 
  onSelectBuilder 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter by Builder</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label 
              className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectBuilder(null)}
            >
              <Checkbox
                checked={selectedBuilder === null}
                onCheckedChange={() => onSelectBuilder(null)}
              />
              <span className="text-sm">All Builders</span>
            </Label>
            
            {builders.map(builder => (
              <Label
                key={builder.builder_id}
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onSelectBuilder(builder);
                  onOpenChange(false);
                }}
              >
                <Checkbox
                  checked={selectedBuilder?.builder_id === builder.builder_id}
                  onCheckedChange={() => {
                    onSelectBuilder(builder);
                    onOpenChange(false);
                  }}
                />
                <span className="text-sm">{builder.full_name}</span>
              </Label>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuilderFilterModal;

