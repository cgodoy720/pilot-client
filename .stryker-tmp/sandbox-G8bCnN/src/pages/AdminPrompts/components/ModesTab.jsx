// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Chip, CircularProgress, Tabs, Tab } from '@mui/material';
import Swal from 'sweetalert2';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
const ModesTab = ({
  showNotification,
  reloadPrompts
}) => {
  if (stryMutAct_9fa48("5069")) {
    {}
  } else {
    stryCov_9fa48("5069");
    const [modes, setModes] = useState(stryMutAct_9fa48("5070") ? ["Stryker was here"] : (stryCov_9fa48("5070"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("5071") ? false : (stryCov_9fa48("5071"), true));
    const [selectedModeTab, setSelectedModeTab] = useState(0);
    useEffect(() => {
      if (stryMutAct_9fa48("5072")) {
        {}
      } else {
        stryCov_9fa48("5072");
        fetchModes();
      }
    }, stryMutAct_9fa48("5073") ? ["Stryker was here"] : (stryCov_9fa48("5073"), []));
    const fetchModes = async () => {
      if (stryMutAct_9fa48("5074")) {
        {}
      } else {
        stryCov_9fa48("5074");
        try {
          if (stryMutAct_9fa48("5075")) {
            {}
          } else {
            stryCov_9fa48("5075");
            setLoading(stryMutAct_9fa48("5076") ? false : (stryCov_9fa48("5076"), true));
            const token = localStorage.getItem(stryMutAct_9fa48("5077") ? "" : (stryCov_9fa48("5077"), 'token'));
            const response = await fetch(stryMutAct_9fa48("5078") ? `` : (stryCov_9fa48("5078"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/modes`), stryMutAct_9fa48("5079") ? {} : (stryCov_9fa48("5079"), {
              headers: stryMutAct_9fa48("5080") ? {} : (stryCov_9fa48("5080"), {
                'Authorization': stryMutAct_9fa48("5081") ? `` : (stryCov_9fa48("5081"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("5083") ? false : stryMutAct_9fa48("5082") ? true : (stryCov_9fa48("5082", "5083"), response.ok)) {
              if (stryMutAct_9fa48("5084")) {
                {}
              } else {
                stryCov_9fa48("5084");
                const data = await response.json();
                setModes(stryMutAct_9fa48("5087") ? data.modes && [] : stryMutAct_9fa48("5086") ? false : stryMutAct_9fa48("5085") ? true : (stryCov_9fa48("5085", "5086", "5087"), data.modes || (stryMutAct_9fa48("5088") ? ["Stryker was here"] : (stryCov_9fa48("5088"), []))));
              }
            } else {
              if (stryMutAct_9fa48("5089")) {
                {}
              } else {
                stryCov_9fa48("5089");
                throw new Error(stryMutAct_9fa48("5090") ? "" : (stryCov_9fa48("5090"), 'Failed to fetch modes'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5091")) {
            {}
          } else {
            stryCov_9fa48("5091");
            console.error(stryMutAct_9fa48("5092") ? "" : (stryCov_9fa48("5092"), 'Error fetching modes:'), error);
            showNotification(stryMutAct_9fa48("5093") ? "" : (stryCov_9fa48("5093"), 'Failed to load modes'), stryMutAct_9fa48("5094") ? "" : (stryCov_9fa48("5094"), 'error'));
          }
        } finally {
          if (stryMutAct_9fa48("5095")) {
            {}
          } else {
            stryCov_9fa48("5095");
            setLoading(stryMutAct_9fa48("5096") ? true : (stryCov_9fa48("5096"), false));
          }
        }
      }
    };
    const handleCreate = async () => {
      if (stryMutAct_9fa48("5097")) {
        {}
      } else {
        stryCov_9fa48("5097");
        const {
          value: formData
        } = await Swal.fire(stryMutAct_9fa48("5098") ? {} : (stryCov_9fa48("5098"), {
          title: stryMutAct_9fa48("5099") ? "" : (stryCov_9fa48("5099"), 'Create New Mode'),
          html: stryMutAct_9fa48("5100") ? `` : (stryCov_9fa48("5100"), `
        <div style="text-align: left;">
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Name (ID) *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., coach_only, technical_assistant" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Unique identifier used in code (lowercase, underscores)</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Display Name</label>
            <input id="swal-display-name" class="swal2-input" placeholder="e.g., Coach Only, Technical Assistant"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Human-readable name for the mode</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Brief description of when to use this mode"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Brief description of the mode's behavior and when to use it</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Content *</label>
            <textarea id="swal-content" placeholder="Enter the mode behavioral instructions..." rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer; font-size: 0.85rem;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default mode
            </label>
          </div>
        </div>
      `),
          background: stryMutAct_9fa48("5101") ? "" : (stryCov_9fa48("5101"), '#2a2d3e'),
          color: stryMutAct_9fa48("5102") ? "" : (stryCov_9fa48("5102"), '#fff'),
          showCancelButton: stryMutAct_9fa48("5103") ? false : (stryCov_9fa48("5103"), true),
          confirmButtonText: stryMutAct_9fa48("5104") ? "" : (stryCov_9fa48("5104"), 'Create Mode'),
          cancelButtonText: stryMutAct_9fa48("5105") ? "" : (stryCov_9fa48("5105"), 'Cancel'),
          confirmButtonColor: stryMutAct_9fa48("5106") ? "" : (stryCov_9fa48("5106"), '#4242ea'),
          cancelButtonColor: stryMutAct_9fa48("5107") ? "" : (stryCov_9fa48("5107"), '#666'),
          width: stryMutAct_9fa48("5108") ? "" : (stryCov_9fa48("5108"), '600px'),
          preConfirm: () => {
            if (stryMutAct_9fa48("5109")) {
              {}
            } else {
              stryCov_9fa48("5109");
              const name = document.getElementById(stryMutAct_9fa48("5110") ? "" : (stryCov_9fa48("5110"), 'swal-name')).value;
              const displayName = document.getElementById(stryMutAct_9fa48("5111") ? "" : (stryCov_9fa48("5111"), 'swal-display-name')).value;
              const description = document.getElementById(stryMutAct_9fa48("5112") ? "" : (stryCov_9fa48("5112"), 'swal-description')).value;
              const content = document.getElementById(stryMutAct_9fa48("5113") ? "" : (stryCov_9fa48("5113"), 'swal-content')).value;
              const isDefault = document.getElementById(stryMutAct_9fa48("5114") ? "" : (stryCov_9fa48("5114"), 'swal-default')).checked;
              if (stryMutAct_9fa48("5117") ? false : stryMutAct_9fa48("5116") ? true : stryMutAct_9fa48("5115") ? name.trim() : (stryCov_9fa48("5115", "5116", "5117"), !(stryMutAct_9fa48("5118") ? name : (stryCov_9fa48("5118"), name.trim())))) {
                if (stryMutAct_9fa48("5119")) {
                  {}
                } else {
                  stryCov_9fa48("5119");
                  Swal.showValidationMessage(stryMutAct_9fa48("5120") ? "" : (stryCov_9fa48("5120"), 'Name is required'));
                  return stryMutAct_9fa48("5121") ? true : (stryCov_9fa48("5121"), false);
                }
              }
              if (stryMutAct_9fa48("5124") ? false : stryMutAct_9fa48("5123") ? true : stryMutAct_9fa48("5122") ? content.trim() : (stryCov_9fa48("5122", "5123", "5124"), !(stryMutAct_9fa48("5125") ? content : (stryCov_9fa48("5125"), content.trim())))) {
                if (stryMutAct_9fa48("5126")) {
                  {}
                } else {
                  stryCov_9fa48("5126");
                  Swal.showValidationMessage(stryMutAct_9fa48("5127") ? "" : (stryCov_9fa48("5127"), 'Content is required'));
                  return stryMutAct_9fa48("5128") ? true : (stryCov_9fa48("5128"), false);
                }
              }
              return stryMutAct_9fa48("5129") ? {} : (stryCov_9fa48("5129"), {
                name: stryMutAct_9fa48("5130") ? name : (stryCov_9fa48("5130"), name.trim()),
                display_name: stryMutAct_9fa48("5131") ? displayName : (stryCov_9fa48("5131"), displayName.trim()),
                description: stryMutAct_9fa48("5132") ? description : (stryCov_9fa48("5132"), description.trim()),
                content: stryMutAct_9fa48("5133") ? content : (stryCov_9fa48("5133"), content.trim()),
                is_default: isDefault
              });
            }
          }
        }));
        if (stryMutAct_9fa48("5135") ? false : stryMutAct_9fa48("5134") ? true : (stryCov_9fa48("5134", "5135"), formData)) {
          if (stryMutAct_9fa48("5136")) {
            {}
          } else {
            stryCov_9fa48("5136");
            try {
              if (stryMutAct_9fa48("5137")) {
                {}
              } else {
                stryCov_9fa48("5137");
                const token = localStorage.getItem(stryMutAct_9fa48("5138") ? "" : (stryCov_9fa48("5138"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5139") ? `` : (stryCov_9fa48("5139"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/modes`), stryMutAct_9fa48("5140") ? {} : (stryCov_9fa48("5140"), {
                  method: stryMutAct_9fa48("5141") ? "" : (stryCov_9fa48("5141"), 'POST'),
                  headers: stryMutAct_9fa48("5142") ? {} : (stryCov_9fa48("5142"), {
                    'Authorization': stryMutAct_9fa48("5143") ? `` : (stryCov_9fa48("5143"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("5144") ? "" : (stryCov_9fa48("5144"), 'application/json')
                  }),
                  body: JSON.stringify(formData)
                }));
                if (stryMutAct_9fa48("5146") ? false : stryMutAct_9fa48("5145") ? true : (stryCov_9fa48("5145", "5146"), response.ok)) {
                  if (stryMutAct_9fa48("5147")) {
                    {}
                  } else {
                    stryCov_9fa48("5147");
                    showNotification(stryMutAct_9fa48("5148") ? "" : (stryCov_9fa48("5148"), 'Mode created successfully'));
                    await fetchModes();
                    await reloadPrompts();
                  }
                } else {
                  if (stryMutAct_9fa48("5149")) {
                    {}
                  } else {
                    stryCov_9fa48("5149");
                    const errorData = await response.json();
                    throw new Error(stryMutAct_9fa48("5152") ? errorData.error && 'Failed to create mode' : stryMutAct_9fa48("5151") ? false : stryMutAct_9fa48("5150") ? true : (stryCov_9fa48("5150", "5151", "5152"), errorData.error || (stryMutAct_9fa48("5153") ? "" : (stryCov_9fa48("5153"), 'Failed to create mode'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5154")) {
                {}
              } else {
                stryCov_9fa48("5154");
                console.error(stryMutAct_9fa48("5155") ? "" : (stryCov_9fa48("5155"), 'Error creating mode:'), error);
                showNotification(stryMutAct_9fa48("5156") ? `` : (stryCov_9fa48("5156"), `Failed to create mode: ${error.message}`), stryMutAct_9fa48("5157") ? "" : (stryCov_9fa48("5157"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleEdit = async mode => {
      if (stryMutAct_9fa48("5158")) {
        {}
      } else {
        stryCov_9fa48("5158");
        const {
          value: formData
        } = await Swal.fire(stryMutAct_9fa48("5159") ? {} : (stryCov_9fa48("5159"), {
          title: stryMutAct_9fa48("5160") ? "" : (stryCov_9fa48("5160"), 'Edit Mode'),
          html: stryMutAct_9fa48("5161") ? `` : (stryCov_9fa48("5161"), `
        <div style="text-align: left;">
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Name (ID) *</label>
            <input id="swal-name" class="swal2-input" value="${mode.name}" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Unique identifier used in code (lowercase, underscores)</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Display Name</label>
            <input id="swal-display-name" class="swal2-input" value="${stryMutAct_9fa48("5164") ? mode.display_name && '' : stryMutAct_9fa48("5163") ? false : stryMutAct_9fa48("5162") ? true : (stryCov_9fa48("5162", "5163", "5164"), mode.display_name || (stryMutAct_9fa48("5165") ? "Stryker was here!" : (stryCov_9fa48("5165"), '')))}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Human-readable name for the mode</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Description</label>
            <input id="swal-description" class="swal2-input" value="${stryMutAct_9fa48("5168") ? mode.description && '' : stryMutAct_9fa48("5167") ? false : stryMutAct_9fa48("5166") ? true : (stryCov_9fa48("5166", "5167", "5168"), mode.description || (stryMutAct_9fa48("5169") ? "Stryker was here!" : (stryCov_9fa48("5169"), '')))}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Brief description of the mode's behavior and when to use it</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Content *</label>
            <textarea id="swal-content" rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${mode.content}</textarea>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer; font-size: 0.85rem;">
              <input type="checkbox" id="swal-default" ${mode.is_default ? stryMutAct_9fa48("5170") ? "" : (stryCov_9fa48("5170"), 'checked') : stryMutAct_9fa48("5171") ? "Stryker was here!" : (stryCov_9fa48("5171"), '')} style="margin-right: 0.5rem;">
              Set as default mode
            </label>
          </div>
        </div>
      `),
          background: stryMutAct_9fa48("5172") ? "" : (stryCov_9fa48("5172"), '#2a2d3e'),
          color: stryMutAct_9fa48("5173") ? "" : (stryCov_9fa48("5173"), '#fff'),
          showCancelButton: stryMutAct_9fa48("5174") ? false : (stryCov_9fa48("5174"), true),
          confirmButtonText: stryMutAct_9fa48("5175") ? "" : (stryCov_9fa48("5175"), 'Update Mode'),
          cancelButtonText: stryMutAct_9fa48("5176") ? "" : (stryCov_9fa48("5176"), 'Cancel'),
          confirmButtonColor: stryMutAct_9fa48("5177") ? "" : (stryCov_9fa48("5177"), '#4242ea'),
          cancelButtonColor: stryMutAct_9fa48("5178") ? "" : (stryCov_9fa48("5178"), '#666'),
          width: stryMutAct_9fa48("5179") ? "" : (stryCov_9fa48("5179"), '600px'),
          preConfirm: () => {
            if (stryMutAct_9fa48("5180")) {
              {}
            } else {
              stryCov_9fa48("5180");
              const name = document.getElementById(stryMutAct_9fa48("5181") ? "" : (stryCov_9fa48("5181"), 'swal-name')).value;
              const displayName = document.getElementById(stryMutAct_9fa48("5182") ? "" : (stryCov_9fa48("5182"), 'swal-display-name')).value;
              const description = document.getElementById(stryMutAct_9fa48("5183") ? "" : (stryCov_9fa48("5183"), 'swal-description')).value;
              const content = document.getElementById(stryMutAct_9fa48("5184") ? "" : (stryCov_9fa48("5184"), 'swal-content')).value;
              const isDefault = document.getElementById(stryMutAct_9fa48("5185") ? "" : (stryCov_9fa48("5185"), 'swal-default')).checked;
              if (stryMutAct_9fa48("5188") ? false : stryMutAct_9fa48("5187") ? true : stryMutAct_9fa48("5186") ? name.trim() : (stryCov_9fa48("5186", "5187", "5188"), !(stryMutAct_9fa48("5189") ? name : (stryCov_9fa48("5189"), name.trim())))) {
                if (stryMutAct_9fa48("5190")) {
                  {}
                } else {
                  stryCov_9fa48("5190");
                  Swal.showValidationMessage(stryMutAct_9fa48("5191") ? "" : (stryCov_9fa48("5191"), 'Name is required'));
                  return stryMutAct_9fa48("5192") ? true : (stryCov_9fa48("5192"), false);
                }
              }
              if (stryMutAct_9fa48("5195") ? false : stryMutAct_9fa48("5194") ? true : stryMutAct_9fa48("5193") ? content.trim() : (stryCov_9fa48("5193", "5194", "5195"), !(stryMutAct_9fa48("5196") ? content : (stryCov_9fa48("5196"), content.trim())))) {
                if (stryMutAct_9fa48("5197")) {
                  {}
                } else {
                  stryCov_9fa48("5197");
                  Swal.showValidationMessage(stryMutAct_9fa48("5198") ? "" : (stryCov_9fa48("5198"), 'Content is required'));
                  return stryMutAct_9fa48("5199") ? true : (stryCov_9fa48("5199"), false);
                }
              }
              return stryMutAct_9fa48("5200") ? {} : (stryCov_9fa48("5200"), {
                name: stryMutAct_9fa48("5201") ? name : (stryCov_9fa48("5201"), name.trim()),
                display_name: stryMutAct_9fa48("5202") ? displayName : (stryCov_9fa48("5202"), displayName.trim()),
                description: stryMutAct_9fa48("5203") ? description : (stryCov_9fa48("5203"), description.trim()),
                content: stryMutAct_9fa48("5204") ? content : (stryCov_9fa48("5204"), content.trim()),
                is_default: isDefault
              });
            }
          }
        }));
        if (stryMutAct_9fa48("5206") ? false : stryMutAct_9fa48("5205") ? true : (stryCov_9fa48("5205", "5206"), formData)) {
          if (stryMutAct_9fa48("5207")) {
            {}
          } else {
            stryCov_9fa48("5207");
            try {
              if (stryMutAct_9fa48("5208")) {
                {}
              } else {
                stryCov_9fa48("5208");
                const token = localStorage.getItem(stryMutAct_9fa48("5209") ? "" : (stryCov_9fa48("5209"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5210") ? `` : (stryCov_9fa48("5210"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/modes/${mode.id}`), stryMutAct_9fa48("5211") ? {} : (stryCov_9fa48("5211"), {
                  method: stryMutAct_9fa48("5212") ? "" : (stryCov_9fa48("5212"), 'PUT'),
                  headers: stryMutAct_9fa48("5213") ? {} : (stryCov_9fa48("5213"), {
                    'Authorization': stryMutAct_9fa48("5214") ? `` : (stryCov_9fa48("5214"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("5215") ? "" : (stryCov_9fa48("5215"), 'application/json')
                  }),
                  body: JSON.stringify(formData)
                }));
                if (stryMutAct_9fa48("5217") ? false : stryMutAct_9fa48("5216") ? true : (stryCov_9fa48("5216", "5217"), response.ok)) {
                  if (stryMutAct_9fa48("5218")) {
                    {}
                  } else {
                    stryCov_9fa48("5218");
                    showNotification(stryMutAct_9fa48("5219") ? "" : (stryCov_9fa48("5219"), 'Mode updated successfully'));
                    await fetchModes();
                    await reloadPrompts();
                  }
                } else {
                  if (stryMutAct_9fa48("5220")) {
                    {}
                  } else {
                    stryCov_9fa48("5220");
                    const errorData = await response.json();
                    throw new Error(stryMutAct_9fa48("5223") ? errorData.error && 'Failed to update mode' : stryMutAct_9fa48("5222") ? false : stryMutAct_9fa48("5221") ? true : (stryCov_9fa48("5221", "5222", "5223"), errorData.error || (stryMutAct_9fa48("5224") ? "" : (stryCov_9fa48("5224"), 'Failed to update mode'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5225")) {
                {}
              } else {
                stryCov_9fa48("5225");
                console.error(stryMutAct_9fa48("5226") ? "" : (stryCov_9fa48("5226"), 'Error updating mode:'), error);
                showNotification(stryMutAct_9fa48("5227") ? `` : (stryCov_9fa48("5227"), `Failed to update mode: ${error.message}`), stryMutAct_9fa48("5228") ? "" : (stryCov_9fa48("5228"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleDelete = async mode => {
      if (stryMutAct_9fa48("5229")) {
        {}
      } else {
        stryCov_9fa48("5229");
        const result = await Swal.fire(stryMutAct_9fa48("5230") ? {} : (stryCov_9fa48("5230"), {
          title: stryMutAct_9fa48("5231") ? "" : (stryCov_9fa48("5231"), 'Delete Mode'),
          text: stryMutAct_9fa48("5232") ? `` : (stryCov_9fa48("5232"), `Are you sure you want to delete the "${stryMutAct_9fa48("5235") ? mode.display_name && mode.name : stryMutAct_9fa48("5234") ? false : stryMutAct_9fa48("5233") ? true : (stryCov_9fa48("5233", "5234", "5235"), mode.display_name || mode.name)}" mode? This action cannot be undone.`),
          icon: stryMutAct_9fa48("5236") ? "" : (stryCov_9fa48("5236"), 'warning'),
          showCancelButton: stryMutAct_9fa48("5237") ? false : (stryCov_9fa48("5237"), true),
          confirmButtonColor: stryMutAct_9fa48("5238") ? "" : (stryCov_9fa48("5238"), '#d33'),
          cancelButtonColor: stryMutAct_9fa48("5239") ? "" : (stryCov_9fa48("5239"), '#666'),
          confirmButtonText: stryMutAct_9fa48("5240") ? "" : (stryCov_9fa48("5240"), 'Yes, delete it!'),
          background: stryMutAct_9fa48("5241") ? "" : (stryCov_9fa48("5241"), '#2a2d3e'),
          color: stryMutAct_9fa48("5242") ? "" : (stryCov_9fa48("5242"), '#fff')
        }));
        if (stryMutAct_9fa48("5244") ? false : stryMutAct_9fa48("5243") ? true : (stryCov_9fa48("5243", "5244"), result.isConfirmed)) {
          if (stryMutAct_9fa48("5245")) {
            {}
          } else {
            stryCov_9fa48("5245");
            try {
              if (stryMutAct_9fa48("5246")) {
                {}
              } else {
                stryCov_9fa48("5246");
                const token = localStorage.getItem(stryMutAct_9fa48("5247") ? "" : (stryCov_9fa48("5247"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5248") ? `` : (stryCov_9fa48("5248"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/modes/${mode.id}`), stryMutAct_9fa48("5249") ? {} : (stryCov_9fa48("5249"), {
                  method: stryMutAct_9fa48("5250") ? "" : (stryCov_9fa48("5250"), 'DELETE'),
                  headers: stryMutAct_9fa48("5251") ? {} : (stryCov_9fa48("5251"), {
                    'Authorization': stryMutAct_9fa48("5252") ? `` : (stryCov_9fa48("5252"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("5254") ? false : stryMutAct_9fa48("5253") ? true : (stryCov_9fa48("5253", "5254"), response.ok)) {
                  if (stryMutAct_9fa48("5255")) {
                    {}
                  } else {
                    stryCov_9fa48("5255");
                    showNotification(stryMutAct_9fa48("5256") ? "" : (stryCov_9fa48("5256"), 'Mode deleted successfully'));
                    await fetchModes();
                    await reloadPrompts();
                  }
                } else {
                  if (stryMutAct_9fa48("5257")) {
                    {}
                  } else {
                    stryCov_9fa48("5257");
                    const errorData = await response.json();
                    throw new Error(stryMutAct_9fa48("5260") ? errorData.error && 'Failed to delete mode' : stryMutAct_9fa48("5259") ? false : stryMutAct_9fa48("5258") ? true : (stryCov_9fa48("5258", "5259", "5260"), errorData.error || (stryMutAct_9fa48("5261") ? "" : (stryCov_9fa48("5261"), 'Failed to delete mode'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5262")) {
                {}
              } else {
                stryCov_9fa48("5262");
                console.error(stryMutAct_9fa48("5263") ? "" : (stryCov_9fa48("5263"), 'Error deleting mode:'), error);
                showNotification(stryMutAct_9fa48("5264") ? `` : (stryCov_9fa48("5264"), `Failed to delete mode: ${error.message}`), stryMutAct_9fa48("5265") ? "" : (stryCov_9fa48("5265"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleSetDefault = async mode => {
      if (stryMutAct_9fa48("5266")) {
        {}
      } else {
        stryCov_9fa48("5266");
        try {
          if (stryMutAct_9fa48("5267")) {
            {}
          } else {
            stryCov_9fa48("5267");
            const token = localStorage.getItem(stryMutAct_9fa48("5268") ? "" : (stryCov_9fa48("5268"), 'token'));
            const response = await fetch(stryMutAct_9fa48("5269") ? `` : (stryCov_9fa48("5269"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/modes/${mode.id}/set-default`), stryMutAct_9fa48("5270") ? {} : (stryCov_9fa48("5270"), {
              method: stryMutAct_9fa48("5271") ? "" : (stryCov_9fa48("5271"), 'POST'),
              headers: stryMutAct_9fa48("5272") ? {} : (stryCov_9fa48("5272"), {
                'Authorization': stryMutAct_9fa48("5273") ? `` : (stryCov_9fa48("5273"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("5275") ? false : stryMutAct_9fa48("5274") ? true : (stryCov_9fa48("5274", "5275"), response.ok)) {
              if (stryMutAct_9fa48("5276")) {
                {}
              } else {
                stryCov_9fa48("5276");
                showNotification(stryMutAct_9fa48("5277") ? `` : (stryCov_9fa48("5277"), `"${stryMutAct_9fa48("5280") ? mode.display_name && mode.name : stryMutAct_9fa48("5279") ? false : stryMutAct_9fa48("5278") ? true : (stryCov_9fa48("5278", "5279", "5280"), mode.display_name || mode.name)}" set as default mode`));
                await fetchModes();
                await reloadPrompts();
              }
            } else {
              if (stryMutAct_9fa48("5281")) {
                {}
              } else {
                stryCov_9fa48("5281");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("5284") ? errorData.error && 'Failed to set default mode' : stryMutAct_9fa48("5283") ? false : stryMutAct_9fa48("5282") ? true : (stryCov_9fa48("5282", "5283", "5284"), errorData.error || (stryMutAct_9fa48("5285") ? "" : (stryCov_9fa48("5285"), 'Failed to set default mode'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5286")) {
            {}
          } else {
            stryCov_9fa48("5286");
            console.error(stryMutAct_9fa48("5287") ? "" : (stryCov_9fa48("5287"), 'Error setting default mode:'), error);
            showNotification(stryMutAct_9fa48("5288") ? `` : (stryCov_9fa48("5288"), `Failed to set default mode: ${error.message}`), stryMutAct_9fa48("5289") ? "" : (stryCov_9fa48("5289"), 'error'));
          }
        }
      }
    };
    const handleModeTabChange = (event, newValue) => {
      if (stryMutAct_9fa48("5290")) {
        {}
      } else {
        stryCov_9fa48("5290");
        setSelectedModeTab(newValue);
      }
    };
    if (stryMutAct_9fa48("5292") ? false : stryMutAct_9fa48("5291") ? true : (stryCov_9fa48("5291", "5292"), loading)) {
      if (stryMutAct_9fa48("5293")) {
        {}
      } else {
        stryCov_9fa48("5293");
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>;
      }
    }
    const currentMode = modes[selectedModeTab];
    return <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom>
            AI Helper Modes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage AI behavior modes that determine how the AI responds to students (coach_only, technical_assistant, research_partner).
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Mode
          </Button>
        </div>
      </div>

      {(stryMutAct_9fa48("5296") ? modes.length !== 0 : stryMutAct_9fa48("5295") ? false : stryMutAct_9fa48("5294") ? true : (stryCov_9fa48("5294", "5295", "5296"), modes.length === 0)) ? <div className="empty-state">
          <div className="empty-state__icon">🎯</div>
          <Typography variant="h6" gutterBottom>
            No modes found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first AI mode to get started.
          </Typography>
        </div> : <div className="modes-tab-container">
          {/* Sub-navigation tabs */}
          <div className="modes-sub-tabs">
            <Tabs value={selectedModeTab} onChange={handleModeTabChange} variant="scrollable" scrollButtons="auto" className="modes-sub-tabs__tabs">
              {modes.map(stryMutAct_9fa48("5297") ? () => undefined : (stryCov_9fa48("5297"), (mode, index) => <Tab key={mode.id} label={<div className="mode-tab-label">
                      <span>{stryMutAct_9fa48("5300") ? mode.display_name && mode.name : stryMutAct_9fa48("5299") ? false : stryMutAct_9fa48("5298") ? true : (stryCov_9fa48("5298", "5299", "5300"), mode.display_name || mode.name)}</span>
                      {stryMutAct_9fa48("5303") ? mode.is_default || <Chip label="Default" size="small" color="primary" sx={{
                ml: 0.5,
                fontSize: '0.65rem',
                height: '16px'
              }} /> : stryMutAct_9fa48("5302") ? false : stryMutAct_9fa48("5301") ? true : (stryCov_9fa48("5301", "5302", "5303"), mode.is_default && <Chip label="Default" size="small" color="primary" sx={stryMutAct_9fa48("5304") ? {} : (stryCov_9fa48("5304"), {
                ml: 0.5,
                fontSize: stryMutAct_9fa48("5305") ? "" : (stryCov_9fa48("5305"), '0.65rem'),
                height: stryMutAct_9fa48("5306") ? "" : (stryCov_9fa48("5306"), '16px')
              })} />)}
                    </div>} />))}
            </Tabs>
          </div>

          {/* Current mode content */}
          {stryMutAct_9fa48("5309") ? currentMode || <div className="mode-content">
              <div className="mode-content__header">
                <div className="mode-content__title">
                  <Typography variant="h6" component="h3">
                    {currentMode.display_name || currentMode.name}
                    {currentMode.is_default && <Chip label="Default" size="small" color="primary" sx={{
                  ml: 1
                }} />}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {currentMode.name}
                  </Typography>
                  {currentMode.description && <Typography variant="body2" color="textSecondary">
                      {currentMode.description}
                    </Typography>}
                </div>
                <div className="mode-content__actions">
                  <IconButton size="small" onClick={() => handleSetDefault(currentMode)} disabled={currentMode.is_default} title={currentMode.is_default ? 'This is the default' : 'Set as default'}>
                    {currentMode.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEdit(currentMode)} title="Edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(currentMode)} disabled={currentMode.is_default} title={currentMode.is_default ? 'Cannot delete default mode' : 'Delete'} color="error">
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>

              <div className="mode-content__body">
                <div className="mode-content__text">
                  {currentMode.content}
                </div>
                
                <div className="mode-content__meta">
                  <span>Last updated: {new Date(currentMode.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div> : stryMutAct_9fa48("5308") ? false : stryMutAct_9fa48("5307") ? true : (stryCov_9fa48("5307", "5308", "5309"), currentMode && <div className="mode-content">
              <div className="mode-content__header">
                <div className="mode-content__title">
                  <Typography variant="h6" component="h3">
                    {stryMutAct_9fa48("5312") ? currentMode.display_name && currentMode.name : stryMutAct_9fa48("5311") ? false : stryMutAct_9fa48("5310") ? true : (stryCov_9fa48("5310", "5311", "5312"), currentMode.display_name || currentMode.name)}
                    {stryMutAct_9fa48("5315") ? currentMode.is_default || <Chip label="Default" size="small" color="primary" sx={{
                  ml: 1
                }} /> : stryMutAct_9fa48("5314") ? false : stryMutAct_9fa48("5313") ? true : (stryCov_9fa48("5313", "5314", "5315"), currentMode.is_default && <Chip label="Default" size="small" color="primary" sx={stryMutAct_9fa48("5316") ? {} : (stryCov_9fa48("5316"), {
                  ml: 1
                })} />)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {currentMode.name}
                  </Typography>
                  {stryMutAct_9fa48("5319") ? currentMode.description || <Typography variant="body2" color="textSecondary">
                      {currentMode.description}
                    </Typography> : stryMutAct_9fa48("5318") ? false : stryMutAct_9fa48("5317") ? true : (stryCov_9fa48("5317", "5318", "5319"), currentMode.description && <Typography variant="body2" color="textSecondary">
                      {currentMode.description}
                    </Typography>)}
                </div>
                <div className="mode-content__actions">
                  <IconButton size="small" onClick={stryMutAct_9fa48("5320") ? () => undefined : (stryCov_9fa48("5320"), () => handleSetDefault(currentMode))} disabled={currentMode.is_default} title={currentMode.is_default ? stryMutAct_9fa48("5321") ? "" : (stryCov_9fa48("5321"), 'This is the default') : stryMutAct_9fa48("5322") ? "" : (stryCov_9fa48("5322"), 'Set as default')}>
                    {currentMode.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton size="small" onClick={stryMutAct_9fa48("5323") ? () => undefined : (stryCov_9fa48("5323"), () => handleEdit(currentMode))} title="Edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={stryMutAct_9fa48("5324") ? () => undefined : (stryCov_9fa48("5324"), () => handleDelete(currentMode))} disabled={currentMode.is_default} title={currentMode.is_default ? stryMutAct_9fa48("5325") ? "" : (stryCov_9fa48("5325"), 'Cannot delete default mode') : stryMutAct_9fa48("5326") ? "" : (stryCov_9fa48("5326"), 'Delete')} color="error">
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>

              <div className="mode-content__body">
                <div className="mode-content__text">
                  {currentMode.content}
                </div>
                
                <div className="mode-content__meta">
                  <span>Last updated: {new Date(currentMode.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
  }
};
export default ModesTab;