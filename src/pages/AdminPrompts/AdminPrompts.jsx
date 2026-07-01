import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import BasePromptsTab from './components/BasePromptsTab';
import PersonasTab from './components/PersonasTab';
import ProgramContextsTab from './components/ProgramContextsTab';
import ModesTab from './components/ModesTab';
import ContentGenerationPromptsTab from './components/ContentGenerationPromptsTab';
import StatusTab from './components/StatusTab';
import V2CoachEngineTab from './components/V2CoachEngineTab';
import SkillTaxonomyTab from './components/SkillTaxonomyTab';
import { usePermissions } from '../../hooks/usePermissions';
import './AdminPrompts.css';

const AdminPrompts = () => {
  const [loading, setLoading] = useState(false);
  const { canUseFeature } = usePermissions();
  const canEditPrompts = canUseFeature('edit_prompts');

  const showNotification = (message, severity = 'success') => {
    if (severity === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const reloadPrompts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/reload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Prompts reloaded successfully');
      } else {
        throw new Error('Failed to reload prompts');
      }
    } catch (error) {
      console.error('Error reloading prompts:', error);
      showNotification('Failed to reload prompts', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
      <div className="max-w-[1400px] mx-auto">
        {/* Top-level engine selector */}
        <Tabs defaultValue="v1" className="w-full">
          <TabsList className="bg-white border border-[#C8C8C8] p-1 mb-6">
            <TabsTrigger
              value="v1"
              className="font-proxima-bold px-6 data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white"
            >
              V1 Engine
            </TabsTrigger>
            <TabsTrigger
              value="v2"
              className="font-proxima-bold px-6 data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              V2 Coach Engine
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="font-proxima-bold px-6 data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              Skill Taxonomy
            </TabsTrigger>
          </TabsList>

          {/* V1 Engine — all original tabs */}
          <TabsContent value="v1" className="m-0">
            <Tabs defaultValue="base" className="w-full">
              <TabsList className="bg-white border border-[#C8C8C8] p-1 h-auto flex-wrap justify-start">
                <TabsTrigger
                  value="base"
                  className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
                >
                  Base Prompts
                </TabsTrigger>
                <TabsTrigger
                  value="personas"
                  className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
                >
                  Personas
                </TabsTrigger>
                <TabsTrigger
                  value="contexts"
                  className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
                >
                  Program Contexts
                </TabsTrigger>
                <TabsTrigger
                  value="modes"
                  className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
                >
                  Modes
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
                >
                  Content Generation
                </TabsTrigger>
                <TabsTrigger
                  value="status"
                  className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
                >
                  Current AI Prompt
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="base" className="m-0">
                  <BasePromptsTab
                    showNotification={showNotification}
                    reloadPrompts={reloadPrompts}
                    canEdit={canEditPrompts}
                  />
                </TabsContent>

                <TabsContent value="personas" className="m-0">
                  <PersonasTab
                    showNotification={showNotification}
                    reloadPrompts={reloadPrompts}
                    canEdit={canEditPrompts}
                  />
                </TabsContent>

                <TabsContent value="contexts" className="m-0">
                  <ProgramContextsTab
                    showNotification={showNotification}
                    reloadPrompts={reloadPrompts}
                    canEdit={canEditPrompts}
                  />
                </TabsContent>

                <TabsContent value="modes" className="m-0">
                  <ModesTab
                    showNotification={showNotification}
                    reloadPrompts={reloadPrompts}
                    canEdit={canEditPrompts}
                  />
                </TabsContent>

                <TabsContent value="content" className="m-0">
                  <ContentGenerationPromptsTab
                    showNotification={showNotification}
                    reloadPrompts={reloadPrompts}
                    canEdit={canEditPrompts}
                  />
                </TabsContent>

                <TabsContent value="status" className="m-0">
                  <StatusTab
                    showNotification={showNotification}
                    reloadPrompts={reloadPrompts}
                    canEdit={canEditPrompts}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </TabsContent>

          {/* V2 Coach Engine — sub-tabs live inside V2CoachEngineTab */}
          <TabsContent value="v2" className="m-0">
            <V2CoachEngineTab
              showNotification={showNotification}
              reloadPrompts={reloadPrompts}
              canEdit={canEditPrompts}
            />
          </TabsContent>

          {/* Skill Taxonomy — flat 45-skill model + Dreyfus level definitions */}
          <TabsContent value="skills" className="m-0">
            <SkillTaxonomyTab
              showNotification={showNotification}
              reloadPrompts={reloadPrompts}
              canEdit={canEditPrompts}
            />
          </TabsContent>
        </Tabs>

        {/* Global loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4242EA]"></div>
            <p className="mt-4 font-proxima text-[#1E1E1E]">Reloading prompts...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPrompts;
