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
const PersonasTab = ({
  showNotification,
  reloadPrompts
}) => {
  if (stryMutAct_9fa48("5327")) {
    {}
  } else {
    stryCov_9fa48("5327");
    const [personas, setPersonas] = useState(stryMutAct_9fa48("5328") ? ["Stryker was here"] : (stryCov_9fa48("5328"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("5329") ? false : (stryCov_9fa48("5329"), true));
    const [selectedPersonaTab, setSelectedPersonaTab] = useState(0);
    useEffect(() => {
      if (stryMutAct_9fa48("5330")) {
        {}
      } else {
        stryCov_9fa48("5330");
        fetchPersonas();
      }
    }, stryMutAct_9fa48("5331") ? ["Stryker was here"] : (stryCov_9fa48("5331"), []));
    const fetchPersonas = async () => {
      if (stryMutAct_9fa48("5332")) {
        {}
      } else {
        stryCov_9fa48("5332");
        try {
          if (stryMutAct_9fa48("5333")) {
            {}
          } else {
            stryCov_9fa48("5333");
            setLoading(stryMutAct_9fa48("5334") ? false : (stryCov_9fa48("5334"), true));
            const token = localStorage.getItem(stryMutAct_9fa48("5335") ? "" : (stryCov_9fa48("5335"), 'token'));
            const response = await fetch(stryMutAct_9fa48("5336") ? `` : (stryCov_9fa48("5336"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/personas`), stryMutAct_9fa48("5337") ? {} : (stryCov_9fa48("5337"), {
              headers: stryMutAct_9fa48("5338") ? {} : (stryCov_9fa48("5338"), {
                'Authorization': stryMutAct_9fa48("5339") ? `` : (stryCov_9fa48("5339"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("5341") ? false : stryMutAct_9fa48("5340") ? true : (stryCov_9fa48("5340", "5341"), response.ok)) {
              if (stryMutAct_9fa48("5342")) {
                {}
              } else {
                stryCov_9fa48("5342");
                const data = await response.json();
                setPersonas(stryMutAct_9fa48("5345") ? data.personas && [] : stryMutAct_9fa48("5344") ? false : stryMutAct_9fa48("5343") ? true : (stryCov_9fa48("5343", "5344", "5345"), data.personas || (stryMutAct_9fa48("5346") ? ["Stryker was here"] : (stryCov_9fa48("5346"), []))));
              }
            } else {
              if (stryMutAct_9fa48("5347")) {
                {}
              } else {
                stryCov_9fa48("5347");
                throw new Error(stryMutAct_9fa48("5348") ? "" : (stryCov_9fa48("5348"), 'Failed to fetch personas'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5349")) {
            {}
          } else {
            stryCov_9fa48("5349");
            console.error(stryMutAct_9fa48("5350") ? "" : (stryCov_9fa48("5350"), 'Error fetching personas:'), error);
            showNotification(stryMutAct_9fa48("5351") ? "" : (stryCov_9fa48("5351"), 'Failed to load personas'), stryMutAct_9fa48("5352") ? "" : (stryCov_9fa48("5352"), 'error'));
          }
        } finally {
          if (stryMutAct_9fa48("5353")) {
            {}
          } else {
            stryCov_9fa48("5353");
            setLoading(stryMutAct_9fa48("5354") ? true : (stryCov_9fa48("5354"), false));
          }
        }
      }
    };
    const handleCreate = async () => {
      if (stryMutAct_9fa48("5355")) {
        {}
      } else {
        stryCov_9fa48("5355");
        const {
          value: formData
        } = await Swal.fire(stryMutAct_9fa48("5356") ? {} : (stryCov_9fa48("5356"), {
          title: stryMutAct_9fa48("5357") ? "" : (stryCov_9fa48("5357"), 'Create New Persona'),
          html: stryMutAct_9fa48("5358") ? `` : (stryCov_9fa48("5358"), `
        <div style="text-align: left;">
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Name (ID) *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., mentor, expert, critic" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Unique identifier used in code (lowercase, no spaces)</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Display Name</label>
            <input id="swal-display-name" class="swal2-input" placeholder="e.g., The Mentor, The Expert"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Human-readable name for the persona</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Brief description of the persona's role"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Brief description of the persona's role and approach</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Content *</label>
            <textarea id="swal-content" placeholder="Enter the persona definition..." rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer; font-size: 0.85rem;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default persona
            </label>
          </div>
        </div>
      `),
          background: stryMutAct_9fa48("5359") ? "" : (stryCov_9fa48("5359"), '#2a2d3e'),
          color: stryMutAct_9fa48("5360") ? "" : (stryCov_9fa48("5360"), '#fff'),
          showCancelButton: stryMutAct_9fa48("5361") ? false : (stryCov_9fa48("5361"), true),
          confirmButtonText: stryMutAct_9fa48("5362") ? "" : (stryCov_9fa48("5362"), 'Create Persona'),
          cancelButtonText: stryMutAct_9fa48("5363") ? "" : (stryCov_9fa48("5363"), 'Cancel'),
          confirmButtonColor: stryMutAct_9fa48("5364") ? "" : (stryCov_9fa48("5364"), '#4242ea'),
          cancelButtonColor: stryMutAct_9fa48("5365") ? "" : (stryCov_9fa48("5365"), '#666'),
          width: stryMutAct_9fa48("5366") ? "" : (stryCov_9fa48("5366"), '600px'),
          preConfirm: () => {
            if (stryMutAct_9fa48("5367")) {
              {}
            } else {
              stryCov_9fa48("5367");
              const name = document.getElementById(stryMutAct_9fa48("5368") ? "" : (stryCov_9fa48("5368"), 'swal-name')).value;
              const displayName = document.getElementById(stryMutAct_9fa48("5369") ? "" : (stryCov_9fa48("5369"), 'swal-display-name')).value;
              const description = document.getElementById(stryMutAct_9fa48("5370") ? "" : (stryCov_9fa48("5370"), 'swal-description')).value;
              const content = document.getElementById(stryMutAct_9fa48("5371") ? "" : (stryCov_9fa48("5371"), 'swal-content')).value;
              const isDefault = document.getElementById(stryMutAct_9fa48("5372") ? "" : (stryCov_9fa48("5372"), 'swal-default')).checked;
              if (stryMutAct_9fa48("5375") ? false : stryMutAct_9fa48("5374") ? true : stryMutAct_9fa48("5373") ? name.trim() : (stryCov_9fa48("5373", "5374", "5375"), !(stryMutAct_9fa48("5376") ? name : (stryCov_9fa48("5376"), name.trim())))) {
                if (stryMutAct_9fa48("5377")) {
                  {}
                } else {
                  stryCov_9fa48("5377");
                  Swal.showValidationMessage(stryMutAct_9fa48("5378") ? "" : (stryCov_9fa48("5378"), 'Name is required'));
                  return stryMutAct_9fa48("5379") ? true : (stryCov_9fa48("5379"), false);
                }
              }
              if (stryMutAct_9fa48("5382") ? false : stryMutAct_9fa48("5381") ? true : stryMutAct_9fa48("5380") ? content.trim() : (stryCov_9fa48("5380", "5381", "5382"), !(stryMutAct_9fa48("5383") ? content : (stryCov_9fa48("5383"), content.trim())))) {
                if (stryMutAct_9fa48("5384")) {
                  {}
                } else {
                  stryCov_9fa48("5384");
                  Swal.showValidationMessage(stryMutAct_9fa48("5385") ? "" : (stryCov_9fa48("5385"), 'Content is required'));
                  return stryMutAct_9fa48("5386") ? true : (stryCov_9fa48("5386"), false);
                }
              }
              return stryMutAct_9fa48("5387") ? {} : (stryCov_9fa48("5387"), {
                name: stryMutAct_9fa48("5388") ? name : (stryCov_9fa48("5388"), name.trim()),
                display_name: stryMutAct_9fa48("5391") ? displayName.trim() && undefined : stryMutAct_9fa48("5390") ? false : stryMutAct_9fa48("5389") ? true : (stryCov_9fa48("5389", "5390", "5391"), (stryMutAct_9fa48("5392") ? displayName : (stryCov_9fa48("5392"), displayName.trim())) || undefined),
                description: stryMutAct_9fa48("5395") ? description.trim() && undefined : stryMutAct_9fa48("5394") ? false : stryMutAct_9fa48("5393") ? true : (stryCov_9fa48("5393", "5394", "5395"), (stryMutAct_9fa48("5396") ? description : (stryCov_9fa48("5396"), description.trim())) || undefined),
                content: stryMutAct_9fa48("5397") ? content : (stryCov_9fa48("5397"), content.trim()),
                is_default: isDefault
              });
            }
          }
        }));
        if (stryMutAct_9fa48("5399") ? false : stryMutAct_9fa48("5398") ? true : (stryCov_9fa48("5398", "5399"), formData)) {
          if (stryMutAct_9fa48("5400")) {
            {}
          } else {
            stryCov_9fa48("5400");
            try {
              if (stryMutAct_9fa48("5401")) {
                {}
              } else {
                stryCov_9fa48("5401");
                const token = localStorage.getItem(stryMutAct_9fa48("5402") ? "" : (stryCov_9fa48("5402"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5403") ? `` : (stryCov_9fa48("5403"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/personas`), stryMutAct_9fa48("5404") ? {} : (stryCov_9fa48("5404"), {
                  method: stryMutAct_9fa48("5405") ? "" : (stryCov_9fa48("5405"), 'POST'),
                  headers: stryMutAct_9fa48("5406") ? {} : (stryCov_9fa48("5406"), {
                    'Authorization': stryMutAct_9fa48("5407") ? `` : (stryCov_9fa48("5407"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("5408") ? "" : (stryCov_9fa48("5408"), 'application/json')
                  }),
                  body: JSON.stringify(formData)
                }));
                if (stryMutAct_9fa48("5410") ? false : stryMutAct_9fa48("5409") ? true : (stryCov_9fa48("5409", "5410"), response.ok)) {
                  if (stryMutAct_9fa48("5411")) {
                    {}
                  } else {
                    stryCov_9fa48("5411");
                    showNotification(stryMutAct_9fa48("5412") ? "" : (stryCov_9fa48("5412"), 'Persona created successfully'));
                    fetchPersonas();
                  }
                } else {
                  if (stryMutAct_9fa48("5413")) {
                    {}
                  } else {
                    stryCov_9fa48("5413");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("5416") ? error.error && 'Failed to create persona' : stryMutAct_9fa48("5415") ? false : stryMutAct_9fa48("5414") ? true : (stryCov_9fa48("5414", "5415", "5416"), error.error || (stryMutAct_9fa48("5417") ? "" : (stryCov_9fa48("5417"), 'Failed to create persona'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5418")) {
                {}
              } else {
                stryCov_9fa48("5418");
                console.error(stryMutAct_9fa48("5419") ? "" : (stryCov_9fa48("5419"), 'Error creating persona:'), error);
                showNotification(error.message, stryMutAct_9fa48("5420") ? "" : (stryCov_9fa48("5420"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleDelete = async persona => {
      if (stryMutAct_9fa48("5421")) {
        {}
      } else {
        stryCov_9fa48("5421");
        const result = await Swal.fire(stryMutAct_9fa48("5422") ? {} : (stryCov_9fa48("5422"), {
          title: stryMutAct_9fa48("5423") ? "" : (stryCov_9fa48("5423"), 'Delete Persona?'),
          text: stryMutAct_9fa48("5424") ? `` : (stryCov_9fa48("5424"), `Are you sure you want to delete "${stryMutAct_9fa48("5427") ? persona.display_name && persona.name : stryMutAct_9fa48("5426") ? false : stryMutAct_9fa48("5425") ? true : (stryCov_9fa48("5425", "5426", "5427"), persona.display_name || persona.name)}"? This action cannot be undone.`),
          icon: stryMutAct_9fa48("5428") ? "" : (stryCov_9fa48("5428"), 'warning'),
          showCancelButton: stryMutAct_9fa48("5429") ? false : (stryCov_9fa48("5429"), true),
          confirmButtonColor: stryMutAct_9fa48("5430") ? "" : (stryCov_9fa48("5430"), '#d33'),
          cancelButtonColor: stryMutAct_9fa48("5431") ? "" : (stryCov_9fa48("5431"), '#666'),
          confirmButtonText: stryMutAct_9fa48("5432") ? "" : (stryCov_9fa48("5432"), 'Delete'),
          cancelButtonText: stryMutAct_9fa48("5433") ? "" : (stryCov_9fa48("5433"), 'Cancel'),
          background: stryMutAct_9fa48("5434") ? "" : (stryCov_9fa48("5434"), '#2a2d3e'),
          color: stryMutAct_9fa48("5435") ? "" : (stryCov_9fa48("5435"), '#fff')
        }));
        if (stryMutAct_9fa48("5437") ? false : stryMutAct_9fa48("5436") ? true : (stryCov_9fa48("5436", "5437"), result.isConfirmed)) {
          if (stryMutAct_9fa48("5438")) {
            {}
          } else {
            stryCov_9fa48("5438");
            try {
              if (stryMutAct_9fa48("5439")) {
                {}
              } else {
                stryCov_9fa48("5439");
                const token = localStorage.getItem(stryMutAct_9fa48("5440") ? "" : (stryCov_9fa48("5440"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5441") ? `` : (stryCov_9fa48("5441"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/personas/${persona.id}`), stryMutAct_9fa48("5442") ? {} : (stryCov_9fa48("5442"), {
                  method: stryMutAct_9fa48("5443") ? "" : (stryCov_9fa48("5443"), 'DELETE'),
                  headers: stryMutAct_9fa48("5444") ? {} : (stryCov_9fa48("5444"), {
                    'Authorization': stryMutAct_9fa48("5445") ? `` : (stryCov_9fa48("5445"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("5447") ? false : stryMutAct_9fa48("5446") ? true : (stryCov_9fa48("5446", "5447"), response.ok)) {
                  if (stryMutAct_9fa48("5448")) {
                    {}
                  } else {
                    stryCov_9fa48("5448");
                    showNotification(stryMutAct_9fa48("5449") ? "" : (stryCov_9fa48("5449"), 'Persona deleted successfully'));
                    fetchPersonas();
                  }
                } else {
                  if (stryMutAct_9fa48("5450")) {
                    {}
                  } else {
                    stryCov_9fa48("5450");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("5453") ? error.error && 'Failed to delete persona' : stryMutAct_9fa48("5452") ? false : stryMutAct_9fa48("5451") ? true : (stryCov_9fa48("5451", "5452", "5453"), error.error || (stryMutAct_9fa48("5454") ? "" : (stryCov_9fa48("5454"), 'Failed to delete persona'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5455")) {
                {}
              } else {
                stryCov_9fa48("5455");
                console.error(stryMutAct_9fa48("5456") ? "" : (stryCov_9fa48("5456"), 'Error deleting persona:'), error);
                showNotification(error.message, stryMutAct_9fa48("5457") ? "" : (stryCov_9fa48("5457"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleSetDefault = async persona => {
      if (stryMutAct_9fa48("5458")) {
        {}
      } else {
        stryCov_9fa48("5458");
        try {
          if (stryMutAct_9fa48("5459")) {
            {}
          } else {
            stryCov_9fa48("5459");
            const token = localStorage.getItem(stryMutAct_9fa48("5460") ? "" : (stryCov_9fa48("5460"), 'token'));
            const response = await fetch(stryMutAct_9fa48("5461") ? `` : (stryCov_9fa48("5461"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/personas/${persona.id}/set-default`), stryMutAct_9fa48("5462") ? {} : (stryCov_9fa48("5462"), {
              method: stryMutAct_9fa48("5463") ? "" : (stryCov_9fa48("5463"), 'POST'),
              headers: stryMutAct_9fa48("5464") ? {} : (stryCov_9fa48("5464"), {
                'Authorization': stryMutAct_9fa48("5465") ? `` : (stryCov_9fa48("5465"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("5467") ? false : stryMutAct_9fa48("5466") ? true : (stryCov_9fa48("5466", "5467"), response.ok)) {
              if (stryMutAct_9fa48("5468")) {
                {}
              } else {
                stryCov_9fa48("5468");
                showNotification(stryMutAct_9fa48("5469") ? `` : (stryCov_9fa48("5469"), `"${stryMutAct_9fa48("5472") ? persona.display_name && persona.name : stryMutAct_9fa48("5471") ? false : stryMutAct_9fa48("5470") ? true : (stryCov_9fa48("5470", "5471", "5472"), persona.display_name || persona.name)}" set as default persona`));
                fetchPersonas();
              }
            } else {
              if (stryMutAct_9fa48("5473")) {
                {}
              } else {
                stryCov_9fa48("5473");
                const error = await response.json();
                throw new Error(stryMutAct_9fa48("5476") ? error.error && 'Failed to set default' : stryMutAct_9fa48("5475") ? false : stryMutAct_9fa48("5474") ? true : (stryCov_9fa48("5474", "5475", "5476"), error.error || (stryMutAct_9fa48("5477") ? "" : (stryCov_9fa48("5477"), 'Failed to set default'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5478")) {
            {}
          } else {
            stryCov_9fa48("5478");
            console.error(stryMutAct_9fa48("5479") ? "" : (stryCov_9fa48("5479"), 'Error setting default:'), error);
            showNotification(error.message, stryMutAct_9fa48("5480") ? "" : (stryCov_9fa48("5480"), 'error'));
          }
        }
      }
    };
    const handlePersonaTabChange = (event, newValue) => {
      if (stryMutAct_9fa48("5481")) {
        {}
      } else {
        stryCov_9fa48("5481");
        setSelectedPersonaTab(newValue);
      }
    };
    const handleEdit = async persona => {
      if (stryMutAct_9fa48("5482")) {
        {}
      } else {
        stryCov_9fa48("5482");
        const {
          value: formData
        } = await Swal.fire(stryMutAct_9fa48("5483") ? {} : (stryCov_9fa48("5483"), {
          title: stryMutAct_9fa48("5484") ? "" : (stryCov_9fa48("5484"), 'Edit Persona'),
          html: stryMutAct_9fa48("5485") ? `` : (stryCov_9fa48("5485"), `
        <div style="text-align: left;">
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Name (ID) *</label>
            <input id="swal-name" class="swal2-input" value="${persona.name}" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Unique identifier used in code (lowercase, no spaces)</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Display Name</label>
            <input id="swal-display-name" class="swal2-input" value="${stryMutAct_9fa48("5488") ? persona.display_name && '' : stryMutAct_9fa48("5487") ? false : stryMutAct_9fa48("5486") ? true : (stryCov_9fa48("5486", "5487", "5488"), persona.display_name || (stryMutAct_9fa48("5489") ? "Stryker was here!" : (stryCov_9fa48("5489"), '')))}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Human-readable name for the persona</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Description</label>
            <input id="swal-description" class="swal2-input" value="${stryMutAct_9fa48("5492") ? persona.description && '' : stryMutAct_9fa48("5491") ? false : stryMutAct_9fa48("5490") ? true : (stryCov_9fa48("5490", "5491", "5492"), persona.description || (stryMutAct_9fa48("5493") ? "Stryker was here!" : (stryCov_9fa48("5493"), '')))}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; height: 32px; font-size: 0.85rem; padding: 0.25rem 0.5rem;">
            <small style="color: #888; font-size: 0.75rem;">Brief description of the persona's role and approach</small>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <label style="display: block; margin-bottom: 0.25rem; color: #fff; font-weight: 500; font-size: 0.85rem;">Content *</label>
            <textarea id="swal-content" rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${persona.content}</textarea>
          </div>
          <div style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer; font-size: 0.85rem;">
              <input type="checkbox" id="swal-default" ${persona.is_default ? stryMutAct_9fa48("5494") ? "" : (stryCov_9fa48("5494"), 'checked') : stryMutAct_9fa48("5495") ? "Stryker was here!" : (stryCov_9fa48("5495"), '')} style="margin-right: 0.5rem;">
              Set as default persona
            </label>
          </div>
        </div>
      `),
          background: stryMutAct_9fa48("5496") ? "" : (stryCov_9fa48("5496"), '#2a2d3e'),
          color: stryMutAct_9fa48("5497") ? "" : (stryCov_9fa48("5497"), '#fff'),
          showCancelButton: stryMutAct_9fa48("5498") ? false : (stryCov_9fa48("5498"), true),
          confirmButtonText: stryMutAct_9fa48("5499") ? "" : (stryCov_9fa48("5499"), 'Update Persona'),
          cancelButtonText: stryMutAct_9fa48("5500") ? "" : (stryCov_9fa48("5500"), 'Cancel'),
          confirmButtonColor: stryMutAct_9fa48("5501") ? "" : (stryCov_9fa48("5501"), '#4242ea'),
          cancelButtonColor: stryMutAct_9fa48("5502") ? "" : (stryCov_9fa48("5502"), '#666'),
          width: stryMutAct_9fa48("5503") ? "" : (stryCov_9fa48("5503"), '700px'),
          preConfirm: () => {
            if (stryMutAct_9fa48("5504")) {
              {}
            } else {
              stryCov_9fa48("5504");
              const name = document.getElementById(stryMutAct_9fa48("5505") ? "" : (stryCov_9fa48("5505"), 'swal-name')).value;
              const displayName = document.getElementById(stryMutAct_9fa48("5506") ? "" : (stryCov_9fa48("5506"), 'swal-display-name')).value;
              const description = document.getElementById(stryMutAct_9fa48("5507") ? "" : (stryCov_9fa48("5507"), 'swal-description')).value;
              const content = document.getElementById(stryMutAct_9fa48("5508") ? "" : (stryCov_9fa48("5508"), 'swal-content')).value;
              const isDefault = document.getElementById(stryMutAct_9fa48("5509") ? "" : (stryCov_9fa48("5509"), 'swal-default')).checked;
              if (stryMutAct_9fa48("5512") ? false : stryMutAct_9fa48("5511") ? true : stryMutAct_9fa48("5510") ? name.trim() : (stryCov_9fa48("5510", "5511", "5512"), !(stryMutAct_9fa48("5513") ? name : (stryCov_9fa48("5513"), name.trim())))) {
                if (stryMutAct_9fa48("5514")) {
                  {}
                } else {
                  stryCov_9fa48("5514");
                  Swal.showValidationMessage(stryMutAct_9fa48("5515") ? "" : (stryCov_9fa48("5515"), 'Name is required'));
                  return stryMutAct_9fa48("5516") ? true : (stryCov_9fa48("5516"), false);
                }
              }
              if (stryMutAct_9fa48("5519") ? false : stryMutAct_9fa48("5518") ? true : stryMutAct_9fa48("5517") ? content.trim() : (stryCov_9fa48("5517", "5518", "5519"), !(stryMutAct_9fa48("5520") ? content : (stryCov_9fa48("5520"), content.trim())))) {
                if (stryMutAct_9fa48("5521")) {
                  {}
                } else {
                  stryCov_9fa48("5521");
                  Swal.showValidationMessage(stryMutAct_9fa48("5522") ? "" : (stryCov_9fa48("5522"), 'Content is required'));
                  return stryMutAct_9fa48("5523") ? true : (stryCov_9fa48("5523"), false);
                }
              }
              return stryMutAct_9fa48("5524") ? {} : (stryCov_9fa48("5524"), {
                name: stryMutAct_9fa48("5525") ? name : (stryCov_9fa48("5525"), name.trim()),
                display_name: stryMutAct_9fa48("5528") ? displayName.trim() && undefined : stryMutAct_9fa48("5527") ? false : stryMutAct_9fa48("5526") ? true : (stryCov_9fa48("5526", "5527", "5528"), (stryMutAct_9fa48("5529") ? displayName : (stryCov_9fa48("5529"), displayName.trim())) || undefined),
                description: stryMutAct_9fa48("5532") ? description.trim() && undefined : stryMutAct_9fa48("5531") ? false : stryMutAct_9fa48("5530") ? true : (stryCov_9fa48("5530", "5531", "5532"), (stryMutAct_9fa48("5533") ? description : (stryCov_9fa48("5533"), description.trim())) || undefined),
                content: stryMutAct_9fa48("5534") ? content : (stryCov_9fa48("5534"), content.trim()),
                is_default: isDefault
              });
            }
          }
        }));
        if (stryMutAct_9fa48("5536") ? false : stryMutAct_9fa48("5535") ? true : (stryCov_9fa48("5535", "5536"), formData)) {
          if (stryMutAct_9fa48("5537")) {
            {}
          } else {
            stryCov_9fa48("5537");
            try {
              if (stryMutAct_9fa48("5538")) {
                {}
              } else {
                stryCov_9fa48("5538");
                const token = localStorage.getItem(stryMutAct_9fa48("5539") ? "" : (stryCov_9fa48("5539"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5540") ? `` : (stryCov_9fa48("5540"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/personas/${persona.id}`), stryMutAct_9fa48("5541") ? {} : (stryCov_9fa48("5541"), {
                  method: stryMutAct_9fa48("5542") ? "" : (stryCov_9fa48("5542"), 'PUT'),
                  headers: stryMutAct_9fa48("5543") ? {} : (stryCov_9fa48("5543"), {
                    'Authorization': stryMutAct_9fa48("5544") ? `` : (stryCov_9fa48("5544"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("5545") ? "" : (stryCov_9fa48("5545"), 'application/json')
                  }),
                  body: JSON.stringify(formData)
                }));
                if (stryMutAct_9fa48("5547") ? false : stryMutAct_9fa48("5546") ? true : (stryCov_9fa48("5546", "5547"), response.ok)) {
                  if (stryMutAct_9fa48("5548")) {
                    {}
                  } else {
                    stryCov_9fa48("5548");
                    showNotification(stryMutAct_9fa48("5549") ? "" : (stryCov_9fa48("5549"), 'Persona updated successfully'));
                    fetchPersonas();
                  }
                } else {
                  if (stryMutAct_9fa48("5550")) {
                    {}
                  } else {
                    stryCov_9fa48("5550");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("5553") ? error.error && 'Failed to update persona' : stryMutAct_9fa48("5552") ? false : stryMutAct_9fa48("5551") ? true : (stryCov_9fa48("5551", "5552", "5553"), error.error || (stryMutAct_9fa48("5554") ? "" : (stryCov_9fa48("5554"), 'Failed to update persona'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5555")) {
                {}
              } else {
                stryCov_9fa48("5555");
                console.error(stryMutAct_9fa48("5556") ? "" : (stryCov_9fa48("5556"), 'Error updating persona:'), error);
                showNotification(error.message, stryMutAct_9fa48("5557") ? "" : (stryCov_9fa48("5557"), 'error'));
              }
            }
          }
        }
      }
    };
    if (stryMutAct_9fa48("5559") ? false : stryMutAct_9fa48("5558") ? true : (stryCov_9fa48("5558", "5559"), loading)) {
      if (stryMutAct_9fa48("5560")) {
        {}
      } else {
        stryCov_9fa48("5560");
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>;
      }
    }
    const currentPersona = personas[selectedPersonaTab];
    return <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom>
            AI Personas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Different AI personalities that determine interaction style and approach with users.
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Persona
          </Button>
        </div>
      </div>

      {(stryMutAct_9fa48("5563") ? personas.length !== 0 : stryMutAct_9fa48("5562") ? false : stryMutAct_9fa48("5561") ? true : (stryCov_9fa48("5561", "5562", "5563"), personas.length === 0)) ? <div className="empty-state">
          <div className="empty-state__icon">🎭</div>
          <Typography variant="h6" gutterBottom>
            No personas found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first AI persona to get started.
          </Typography>
        </div> : <div className="personas-tab-container">
          {/* Sub-navigation tabs */}
          <div className="personas-sub-tabs">
            <Tabs value={selectedPersonaTab} onChange={handlePersonaTabChange} variant="scrollable" scrollButtons="auto" className="personas-sub-tabs__tabs">
              {personas.map(stryMutAct_9fa48("5564") ? () => undefined : (stryCov_9fa48("5564"), (persona, index) => <Tab key={persona.id} label={<div className="persona-tab-label">
                      <span>{stryMutAct_9fa48("5567") ? persona.display_name && persona.name : stryMutAct_9fa48("5566") ? false : stryMutAct_9fa48("5565") ? true : (stryCov_9fa48("5565", "5566", "5567"), persona.display_name || persona.name)}</span>
                      {stryMutAct_9fa48("5570") ? persona.is_default || <Chip label="Default" size="small" color="primary" sx={{
                ml: 0.5,
                fontSize: '0.65rem',
                height: '16px'
              }} /> : stryMutAct_9fa48("5569") ? false : stryMutAct_9fa48("5568") ? true : (stryCov_9fa48("5568", "5569", "5570"), persona.is_default && <Chip label="Default" size="small" color="primary" sx={stryMutAct_9fa48("5571") ? {} : (stryCov_9fa48("5571"), {
                ml: 0.5,
                fontSize: stryMutAct_9fa48("5572") ? "" : (stryCov_9fa48("5572"), '0.65rem'),
                height: stryMutAct_9fa48("5573") ? "" : (stryCov_9fa48("5573"), '16px')
              })} />)}
                    </div>} />))}
            </Tabs>
          </div>

          {/* Current persona content */}
          {stryMutAct_9fa48("5576") ? currentPersona || <div className="persona-content">
              <div className="persona-content__header">
                <div className="persona-content__title">
                  <Typography variant="h6" component="h3">
                    {currentPersona.display_name || currentPersona.name}
                    {currentPersona.is_default && <Chip label="Default" size="small" color="primary" sx={{
                  ml: 1
                }} />}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {currentPersona.name}
                  </Typography>
                  {currentPersona.description && <Typography variant="body2" color="textSecondary">
                      {currentPersona.description}
                    </Typography>}
                </div>
                <div className="persona-content__actions">
                  <IconButton size="small" onClick={() => handleSetDefault(currentPersona)} disabled={currentPersona.is_default} title={currentPersona.is_default ? 'This is the default' : 'Set as default'}>
                    {currentPersona.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEdit(currentPersona)} title="Edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(currentPersona)} disabled={currentPersona.is_default} title={currentPersona.is_default ? 'Cannot delete default persona' : 'Delete'} color="error">
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>

              <div className="persona-content__body">
                <div className="persona-content__text">
                  {currentPersona.content}
                </div>
                
                <div className="persona-content__meta">
                  <span>Last updated: {new Date(currentPersona.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div> : stryMutAct_9fa48("5575") ? false : stryMutAct_9fa48("5574") ? true : (stryCov_9fa48("5574", "5575", "5576"), currentPersona && <div className="persona-content">
              <div className="persona-content__header">
                <div className="persona-content__title">
                  <Typography variant="h6" component="h3">
                    {stryMutAct_9fa48("5579") ? currentPersona.display_name && currentPersona.name : stryMutAct_9fa48("5578") ? false : stryMutAct_9fa48("5577") ? true : (stryCov_9fa48("5577", "5578", "5579"), currentPersona.display_name || currentPersona.name)}
                    {stryMutAct_9fa48("5582") ? currentPersona.is_default || <Chip label="Default" size="small" color="primary" sx={{
                  ml: 1
                }} /> : stryMutAct_9fa48("5581") ? false : stryMutAct_9fa48("5580") ? true : (stryCov_9fa48("5580", "5581", "5582"), currentPersona.is_default && <Chip label="Default" size="small" color="primary" sx={stryMutAct_9fa48("5583") ? {} : (stryCov_9fa48("5583"), {
                  ml: 1
                })} />)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {currentPersona.name}
                  </Typography>
                  {stryMutAct_9fa48("5586") ? currentPersona.description || <Typography variant="body2" color="textSecondary">
                      {currentPersona.description}
                    </Typography> : stryMutAct_9fa48("5585") ? false : stryMutAct_9fa48("5584") ? true : (stryCov_9fa48("5584", "5585", "5586"), currentPersona.description && <Typography variant="body2" color="textSecondary">
                      {currentPersona.description}
                    </Typography>)}
                </div>
                <div className="persona-content__actions">
                  <IconButton size="small" onClick={stryMutAct_9fa48("5587") ? () => undefined : (stryCov_9fa48("5587"), () => handleSetDefault(currentPersona))} disabled={currentPersona.is_default} title={currentPersona.is_default ? stryMutAct_9fa48("5588") ? "" : (stryCov_9fa48("5588"), 'This is the default') : stryMutAct_9fa48("5589") ? "" : (stryCov_9fa48("5589"), 'Set as default')}>
                    {currentPersona.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton size="small" onClick={stryMutAct_9fa48("5590") ? () => undefined : (stryCov_9fa48("5590"), () => handleEdit(currentPersona))} title="Edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={stryMutAct_9fa48("5591") ? () => undefined : (stryCov_9fa48("5591"), () => handleDelete(currentPersona))} disabled={currentPersona.is_default} title={currentPersona.is_default ? stryMutAct_9fa48("5592") ? "" : (stryCov_9fa48("5592"), 'Cannot delete default persona') : stryMutAct_9fa48("5593") ? "" : (stryCov_9fa48("5593"), 'Delete')} color="error">
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>

              <div className="persona-content__body">
                <div className="persona-content__text">
                  {currentPersona.content}
                </div>
                
                <div className="persona-content__meta">
                  <span>Last updated: {new Date(currentPersona.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
  }
};
export default PersonasTab;