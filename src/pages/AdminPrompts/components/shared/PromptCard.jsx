import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Edit, Trash2, Star } from 'lucide-react';

const PromptCard = ({ 
  prompt, 
  onEdit, 
  onDelete, 
  onSetDefault, 
  showActions = true,
  showContent = true 
}) => {
  return (
    <Card className="bg-white border-[#C8C8C8] hover:border-[#4242EA] hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-proxima-bold text-[#1E1E1E] text-lg flex items-center gap-2 flex-wrap">
              <span className="truncate">{prompt.display_name || prompt.name}</span>
              {prompt.is_default && (
                <Badge className="bg-[#4242EA] text-white hover:bg-[#3535D1] shrink-0">
                  Default
                </Badge>
              )}
            </CardTitle>
            {prompt.description && (
              <CardDescription className="font-proxima text-[#666] mt-1">
                {prompt.description}
              </CardDescription>
            )}
          </div>
          
          {showActions && (
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSetDefault?.(prompt)}
                disabled={prompt.is_default}
                className={`h-8 w-8 ${
                  prompt.is_default 
                    ? 'text-[#4242EA]' 
                    : 'text-[#666] hover:text-[#4242EA]'
                }`}
                title={prompt.is_default ? 'This is the default' : 'Set as default'}
              >
                <Star className={`h-4 w-4 ${prompt.is_default ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(prompt)}
                className="h-8 w-8 text-[#666] hover:text-[#4242EA]"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(prompt)}
                disabled={prompt.is_default}
                className="h-8 w-8 text-[#666] hover:text-red-600 disabled:opacity-30"
                title={prompt.is_default ? 'Cannot delete default prompt' : 'Delete'}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      {showContent && prompt.content && (
        <CardContent className="space-y-3">
          <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4 max-h-[200px] overflow-y-auto">
            <pre className="font-mono text-sm text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
              {prompt.content}
            </pre>
          </div>
          
          <div className="text-xs text-[#666] font-proxima">
            Last updated: {new Date(prompt.updated_at).toLocaleString()}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PromptCard;

