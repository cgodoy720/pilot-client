import React from 'react';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';

const LoadingState = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-white border-[#C8C8C8]">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/3 bg-[#E3E3E3]" />
                <Skeleton className="h-4 w-2/3 bg-[#E3E3E3]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md bg-[#E3E3E3]" />
                <Skeleton className="h-8 w-8 rounded-md bg-[#E3E3E3]" />
                <Skeleton className="h-8 w-8 rounded-md bg-[#E3E3E3]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[120px] w-full rounded-lg bg-[#E3E3E3]" />
            <Skeleton className="h-3 w-1/4 mt-3 bg-[#E3E3E3]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingState;

