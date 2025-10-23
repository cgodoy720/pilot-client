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
import { Box, Typography, Button, TextField, FormControlLabel, Checkbox, IconButton, Chip, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
const ProgramContextsTab = ({
  showNotification,
  reloadPrompts
}) => {
  if (stryMutAct_9fa48("5594")) {
    {}
  } else {
    stryCov_9fa48("5594");
    const [contexts, setContexts] = useState(stryMutAct_9fa48("5595") ? ["Stryker was here"] : (stryCov_9fa48("5595"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("5596") ? false : (stryCov_9fa48("5596"), true));
    const [editingContext, setEditingContext] = useState(null);
    const [formData, setFormData] = useState(stryMutAct_9fa48("5597") ? {} : (stryCov_9fa48("5597"), {
      name: stryMutAct_9fa48("5598") ? "Stryker was here!" : (stryCov_9fa48("5598"), ''),
      description: stryMutAct_9fa48("5599") ? "Stryker was here!" : (stryCov_9fa48("5599"), ''),
      content: stryMutAct_9fa48("5600") ? "Stryker was here!" : (stryCov_9fa48("5600"), ''),
      is_default: stryMutAct_9fa48("5601") ? true : (stryCov_9fa48("5601"), false)
    }));
    useEffect(() => {
      if (stryMutAct_9fa48("5602")) {
        {}
      } else {
        stryCov_9fa48("5602");
        fetchContexts();
      }
    }, stryMutAct_9fa48("5603") ? ["Stryker was here"] : (stryCov_9fa48("5603"), []));
    const fetchContexts = async () => {
      if (stryMutAct_9fa48("5604")) {
        {}
      } else {
        stryCov_9fa48("5604");
        try {
          if (stryMutAct_9fa48("5605")) {
            {}
          } else {
            stryCov_9fa48("5605");
            setLoading(stryMutAct_9fa48("5606") ? false : (stryCov_9fa48("5606"), true));
            const token = localStorage.getItem(stryMutAct_9fa48("5607") ? "" : (stryCov_9fa48("5607"), 'token'));
            const response = await fetch(stryMutAct_9fa48("5608") ? `` : (stryCov_9fa48("5608"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts`), stryMutAct_9fa48("5609") ? {} : (stryCov_9fa48("5609"), {
              headers: stryMutAct_9fa48("5610") ? {} : (stryCov_9fa48("5610"), {
                'Authorization': stryMutAct_9fa48("5611") ? `` : (stryCov_9fa48("5611"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("5613") ? false : stryMutAct_9fa48("5612") ? true : (stryCov_9fa48("5612", "5613"), response.ok)) {
              if (stryMutAct_9fa48("5614")) {
                {}
              } else {
                stryCov_9fa48("5614");
                const data = await response.json();
                setContexts(stryMutAct_9fa48("5617") ? data.program_contexts && [] : stryMutAct_9fa48("5616") ? false : stryMutAct_9fa48("5615") ? true : (stryCov_9fa48("5615", "5616", "5617"), data.program_contexts || (stryMutAct_9fa48("5618") ? ["Stryker was here"] : (stryCov_9fa48("5618"), []))));
              }
            } else {
              if (stryMutAct_9fa48("5619")) {
                {}
              } else {
                stryCov_9fa48("5619");
                throw new Error(stryMutAct_9fa48("5620") ? "" : (stryCov_9fa48("5620"), 'Failed to fetch program contexts'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5621")) {
            {}
          } else {
            stryCov_9fa48("5621");
            console.error(stryMutAct_9fa48("5622") ? "" : (stryCov_9fa48("5622"), 'Error fetching program contexts:'), error);
            showNotification(stryMutAct_9fa48("5623") ? "" : (stryCov_9fa48("5623"), 'Failed to load program contexts'), stryMutAct_9fa48("5624") ? "" : (stryCov_9fa48("5624"), 'error'));
          }
        } finally {
          if (stryMutAct_9fa48("5625")) {
            {}
          } else {
            stryCov_9fa48("5625");
            setLoading(stryMutAct_9fa48("5626") ? true : (stryCov_9fa48("5626"), false));
          }
        }
      }
    };
    const handleCreate = async () => {
      if (stryMutAct_9fa48("5627")) {
        {}
      } else {
        stryCov_9fa48("5627");
        const {
          value: formData
        } = await Swal.fire(stryMutAct_9fa48("5628") ? {} : (stryCov_9fa48("5628"), {
          title: stryMutAct_9fa48("5629") ? "" : (stryCov_9fa48("5629"), 'Create New Program Context'),
          html: stryMutAct_9fa48("5630") ? `` : (stryCov_9fa48("5630"), `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., default-program-context" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier for the program context</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Brief description of the program context"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" placeholder="Enter the program context content..." rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default program context
            </label>
          </div>
        </div>
      `),
          background: stryMutAct_9fa48("5631") ? "" : (stryCov_9fa48("5631"), '#2a2d3e'),
          color: stryMutAct_9fa48("5632") ? "" : (stryCov_9fa48("5632"), '#fff'),
          showCancelButton: stryMutAct_9fa48("5633") ? false : (stryCov_9fa48("5633"), true),
          confirmButtonText: stryMutAct_9fa48("5634") ? "" : (stryCov_9fa48("5634"), 'Create Program Context'),
          cancelButtonText: stryMutAct_9fa48("5635") ? "" : (stryCov_9fa48("5635"), 'Cancel'),
          confirmButtonColor: stryMutAct_9fa48("5636") ? "" : (stryCov_9fa48("5636"), '#4242ea'),
          cancelButtonColor: stryMutAct_9fa48("5637") ? "" : (stryCov_9fa48("5637"), '#666'),
          width: stryMutAct_9fa48("5638") ? "" : (stryCov_9fa48("5638"), '600px'),
          preConfirm: () => {
            if (stryMutAct_9fa48("5639")) {
              {}
            } else {
              stryCov_9fa48("5639");
              const name = document.getElementById(stryMutAct_9fa48("5640") ? "" : (stryCov_9fa48("5640"), 'swal-name')).value;
              const description = document.getElementById(stryMutAct_9fa48("5641") ? "" : (stryCov_9fa48("5641"), 'swal-description')).value;
              const content = document.getElementById(stryMutAct_9fa48("5642") ? "" : (stryCov_9fa48("5642"), 'swal-content')).value;
              const isDefault = document.getElementById(stryMutAct_9fa48("5643") ? "" : (stryCov_9fa48("5643"), 'swal-default')).checked;
              if (stryMutAct_9fa48("5646") ? false : stryMutAct_9fa48("5645") ? true : stryMutAct_9fa48("5644") ? name.trim() : (stryCov_9fa48("5644", "5645", "5646"), !(stryMutAct_9fa48("5647") ? name : (stryCov_9fa48("5647"), name.trim())))) {
                if (stryMutAct_9fa48("5648")) {
                  {}
                } else {
                  stryCov_9fa48("5648");
                  Swal.showValidationMessage(stryMutAct_9fa48("5649") ? "" : (stryCov_9fa48("5649"), 'Name is required'));
                  return stryMutAct_9fa48("5650") ? true : (stryCov_9fa48("5650"), false);
                }
              }
              if (stryMutAct_9fa48("5653") ? false : stryMutAct_9fa48("5652") ? true : stryMutAct_9fa48("5651") ? content.trim() : (stryCov_9fa48("5651", "5652", "5653"), !(stryMutAct_9fa48("5654") ? content : (stryCov_9fa48("5654"), content.trim())))) {
                if (stryMutAct_9fa48("5655")) {
                  {}
                } else {
                  stryCov_9fa48("5655");
                  Swal.showValidationMessage(stryMutAct_9fa48("5656") ? "" : (stryCov_9fa48("5656"), 'Content is required'));
                  return stryMutAct_9fa48("5657") ? true : (stryCov_9fa48("5657"), false);
                }
              }
              return stryMutAct_9fa48("5658") ? {} : (stryCov_9fa48("5658"), {
                name: stryMutAct_9fa48("5659") ? name : (stryCov_9fa48("5659"), name.trim()),
                description: stryMutAct_9fa48("5662") ? description.trim() && undefined : stryMutAct_9fa48("5661") ? false : stryMutAct_9fa48("5660") ? true : (stryCov_9fa48("5660", "5661", "5662"), (stryMutAct_9fa48("5663") ? description : (stryCov_9fa48("5663"), description.trim())) || undefined),
                content: stryMutAct_9fa48("5664") ? content : (stryCov_9fa48("5664"), content.trim()),
                is_default: isDefault
              });
            }
          }
        }));
        if (stryMutAct_9fa48("5666") ? false : stryMutAct_9fa48("5665") ? true : (stryCov_9fa48("5665", "5666"), formData)) {
          if (stryMutAct_9fa48("5667")) {
            {}
          } else {
            stryCov_9fa48("5667");
            try {
              if (stryMutAct_9fa48("5668")) {
                {}
              } else {
                stryCov_9fa48("5668");
                const token = localStorage.getItem(stryMutAct_9fa48("5669") ? "" : (stryCov_9fa48("5669"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5670") ? `` : (stryCov_9fa48("5670"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts`), stryMutAct_9fa48("5671") ? {} : (stryCov_9fa48("5671"), {
                  method: stryMutAct_9fa48("5672") ? "" : (stryCov_9fa48("5672"), 'POST'),
                  headers: stryMutAct_9fa48("5673") ? {} : (stryCov_9fa48("5673"), {
                    'Authorization': stryMutAct_9fa48("5674") ? `` : (stryCov_9fa48("5674"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("5675") ? "" : (stryCov_9fa48("5675"), 'application/json')
                  }),
                  body: JSON.stringify(formData)
                }));
                if (stryMutAct_9fa48("5677") ? false : stryMutAct_9fa48("5676") ? true : (stryCov_9fa48("5676", "5677"), response.ok)) {
                  if (stryMutAct_9fa48("5678")) {
                    {}
                  } else {
                    stryCov_9fa48("5678");
                    showNotification(stryMutAct_9fa48("5679") ? "" : (stryCov_9fa48("5679"), 'Program context created successfully'));
                    fetchContexts();
                  }
                } else {
                  if (stryMutAct_9fa48("5680")) {
                    {}
                  } else {
                    stryCov_9fa48("5680");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("5683") ? error.error && 'Failed to create program context' : stryMutAct_9fa48("5682") ? false : stryMutAct_9fa48("5681") ? true : (stryCov_9fa48("5681", "5682", "5683"), error.error || (stryMutAct_9fa48("5684") ? "" : (stryCov_9fa48("5684"), 'Failed to create program context'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5685")) {
                {}
              } else {
                stryCov_9fa48("5685");
                console.error(stryMutAct_9fa48("5686") ? "" : (stryCov_9fa48("5686"), 'Error creating program context:'), error);
                showNotification(error.message, stryMutAct_9fa48("5687") ? "" : (stryCov_9fa48("5687"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleEdit = async context => {
      if (stryMutAct_9fa48("5688")) {
        {}
      } else {
        stryCov_9fa48("5688");
        const {
          value: formData
        } = await Swal.fire(stryMutAct_9fa48("5689") ? {} : (stryCov_9fa48("5689"), {
          title: stryMutAct_9fa48("5690") ? "" : (stryCov_9fa48("5690"), 'Edit Program Context'),
          html: stryMutAct_9fa48("5691") ? `` : (stryCov_9fa48("5691"), `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" value="${context.name}" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier for the program context</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <input id="swal-description" class="swal2-input" value="${stryMutAct_9fa48("5694") ? context.description && '' : stryMutAct_9fa48("5693") ? false : stryMutAct_9fa48("5692") ? true : (stryCov_9fa48("5692", "5693", "5694"), context.description || (stryMutAct_9fa48("5695") ? "Stryker was here!" : (stryCov_9fa48("5695"), '')))}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${context.content}</textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" ${context.is_default ? stryMutAct_9fa48("5696") ? "" : (stryCov_9fa48("5696"), 'checked') : stryMutAct_9fa48("5697") ? "Stryker was here!" : (stryCov_9fa48("5697"), '')} style="margin-right: 0.5rem;">
              Set as default program context
            </label>
          </div>
        </div>
      `),
          background: stryMutAct_9fa48("5698") ? "" : (stryCov_9fa48("5698"), '#2a2d3e'),
          color: stryMutAct_9fa48("5699") ? "" : (stryCov_9fa48("5699"), '#fff'),
          showCancelButton: stryMutAct_9fa48("5700") ? false : (stryCov_9fa48("5700"), true),
          confirmButtonText: stryMutAct_9fa48("5701") ? "" : (stryCov_9fa48("5701"), 'Update Program Context'),
          cancelButtonText: stryMutAct_9fa48("5702") ? "" : (stryCov_9fa48("5702"), 'Cancel'),
          confirmButtonColor: stryMutAct_9fa48("5703") ? "" : (stryCov_9fa48("5703"), '#4242ea'),
          cancelButtonColor: stryMutAct_9fa48("5704") ? "" : (stryCov_9fa48("5704"), '#666'),
          width: stryMutAct_9fa48("5705") ? "" : (stryCov_9fa48("5705"), '600px'),
          preConfirm: () => {
            if (stryMutAct_9fa48("5706")) {
              {}
            } else {
              stryCov_9fa48("5706");
              const name = document.getElementById(stryMutAct_9fa48("5707") ? "" : (stryCov_9fa48("5707"), 'swal-name')).value;
              const description = document.getElementById(stryMutAct_9fa48("5708") ? "" : (stryCov_9fa48("5708"), 'swal-description')).value;
              const content = document.getElementById(stryMutAct_9fa48("5709") ? "" : (stryCov_9fa48("5709"), 'swal-content')).value;
              const isDefault = document.getElementById(stryMutAct_9fa48("5710") ? "" : (stryCov_9fa48("5710"), 'swal-default')).checked;
              if (stryMutAct_9fa48("5713") ? false : stryMutAct_9fa48("5712") ? true : stryMutAct_9fa48("5711") ? name.trim() : (stryCov_9fa48("5711", "5712", "5713"), !(stryMutAct_9fa48("5714") ? name : (stryCov_9fa48("5714"), name.trim())))) {
                if (stryMutAct_9fa48("5715")) {
                  {}
                } else {
                  stryCov_9fa48("5715");
                  Swal.showValidationMessage(stryMutAct_9fa48("5716") ? "" : (stryCov_9fa48("5716"), 'Name is required'));
                  return stryMutAct_9fa48("5717") ? true : (stryCov_9fa48("5717"), false);
                }
              }
              if (stryMutAct_9fa48("5720") ? false : stryMutAct_9fa48("5719") ? true : stryMutAct_9fa48("5718") ? content.trim() : (stryCov_9fa48("5718", "5719", "5720"), !(stryMutAct_9fa48("5721") ? content : (stryCov_9fa48("5721"), content.trim())))) {
                if (stryMutAct_9fa48("5722")) {
                  {}
                } else {
                  stryCov_9fa48("5722");
                  Swal.showValidationMessage(stryMutAct_9fa48("5723") ? "" : (stryCov_9fa48("5723"), 'Content is required'));
                  return stryMutAct_9fa48("5724") ? true : (stryCov_9fa48("5724"), false);
                }
              }
              return stryMutAct_9fa48("5725") ? {} : (stryCov_9fa48("5725"), {
                name: stryMutAct_9fa48("5726") ? name : (stryCov_9fa48("5726"), name.trim()),
                description: stryMutAct_9fa48("5729") ? description.trim() && undefined : stryMutAct_9fa48("5728") ? false : stryMutAct_9fa48("5727") ? true : (stryCov_9fa48("5727", "5728", "5729"), (stryMutAct_9fa48("5730") ? description : (stryCov_9fa48("5730"), description.trim())) || undefined),
                content: stryMutAct_9fa48("5731") ? content : (stryCov_9fa48("5731"), content.trim()),
                is_default: isDefault
              });
            }
          }
        }));
        if (stryMutAct_9fa48("5733") ? false : stryMutAct_9fa48("5732") ? true : (stryCov_9fa48("5732", "5733"), formData)) {
          if (stryMutAct_9fa48("5734")) {
            {}
          } else {
            stryCov_9fa48("5734");
            try {
              if (stryMutAct_9fa48("5735")) {
                {}
              } else {
                stryCov_9fa48("5735");
                const token = localStorage.getItem(stryMutAct_9fa48("5736") ? "" : (stryCov_9fa48("5736"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5737") ? `` : (stryCov_9fa48("5737"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts/${context.id}`), stryMutAct_9fa48("5738") ? {} : (stryCov_9fa48("5738"), {
                  method: stryMutAct_9fa48("5739") ? "" : (stryCov_9fa48("5739"), 'PUT'),
                  headers: stryMutAct_9fa48("5740") ? {} : (stryCov_9fa48("5740"), {
                    'Authorization': stryMutAct_9fa48("5741") ? `` : (stryCov_9fa48("5741"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("5742") ? "" : (stryCov_9fa48("5742"), 'application/json')
                  }),
                  body: JSON.stringify(formData)
                }));
                if (stryMutAct_9fa48("5744") ? false : stryMutAct_9fa48("5743") ? true : (stryCov_9fa48("5743", "5744"), response.ok)) {
                  if (stryMutAct_9fa48("5745")) {
                    {}
                  } else {
                    stryCov_9fa48("5745");
                    showNotification(stryMutAct_9fa48("5746") ? "" : (stryCov_9fa48("5746"), 'Program context updated successfully'));
                    fetchContexts();
                  }
                } else {
                  if (stryMutAct_9fa48("5747")) {
                    {}
                  } else {
                    stryCov_9fa48("5747");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("5750") ? error.error && 'Failed to update program context' : stryMutAct_9fa48("5749") ? false : stryMutAct_9fa48("5748") ? true : (stryCov_9fa48("5748", "5749", "5750"), error.error || (stryMutAct_9fa48("5751") ? "" : (stryCov_9fa48("5751"), 'Failed to update program context'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5752")) {
                {}
              } else {
                stryCov_9fa48("5752");
                console.error(stryMutAct_9fa48("5753") ? "" : (stryCov_9fa48("5753"), 'Error updating program context:'), error);
                showNotification(error.message, stryMutAct_9fa48("5754") ? "" : (stryCov_9fa48("5754"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleDelete = async context => {
      if (stryMutAct_9fa48("5755")) {
        {}
      } else {
        stryCov_9fa48("5755");
        const result = await Swal.fire(stryMutAct_9fa48("5756") ? {} : (stryCov_9fa48("5756"), {
          title: stryMutAct_9fa48("5757") ? "" : (stryCov_9fa48("5757"), 'Delete Program Context?'),
          text: stryMutAct_9fa48("5758") ? `` : (stryCov_9fa48("5758"), `Are you sure you want to delete "${context.name}"? This action cannot be undone.`),
          icon: stryMutAct_9fa48("5759") ? "" : (stryCov_9fa48("5759"), 'warning'),
          showCancelButton: stryMutAct_9fa48("5760") ? false : (stryCov_9fa48("5760"), true),
          confirmButtonColor: stryMutAct_9fa48("5761") ? "" : (stryCov_9fa48("5761"), '#d33'),
          cancelButtonColor: stryMutAct_9fa48("5762") ? "" : (stryCov_9fa48("5762"), '#666'),
          confirmButtonText: stryMutAct_9fa48("5763") ? "" : (stryCov_9fa48("5763"), 'Delete'),
          cancelButtonText: stryMutAct_9fa48("5764") ? "" : (stryCov_9fa48("5764"), 'Cancel'),
          background: stryMutAct_9fa48("5765") ? "" : (stryCov_9fa48("5765"), '#2a2d3e'),
          color: stryMutAct_9fa48("5766") ? "" : (stryCov_9fa48("5766"), '#fff')
        }));
        if (stryMutAct_9fa48("5768") ? false : stryMutAct_9fa48("5767") ? true : (stryCov_9fa48("5767", "5768"), result.isConfirmed)) {
          if (stryMutAct_9fa48("5769")) {
            {}
          } else {
            stryCov_9fa48("5769");
            try {
              if (stryMutAct_9fa48("5770")) {
                {}
              } else {
                stryCov_9fa48("5770");
                const token = localStorage.getItem(stryMutAct_9fa48("5771") ? "" : (stryCov_9fa48("5771"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5772") ? `` : (stryCov_9fa48("5772"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts/${context.id}`), stryMutAct_9fa48("5773") ? {} : (stryCov_9fa48("5773"), {
                  method: stryMutAct_9fa48("5774") ? "" : (stryCov_9fa48("5774"), 'DELETE'),
                  headers: stryMutAct_9fa48("5775") ? {} : (stryCov_9fa48("5775"), {
                    'Authorization': stryMutAct_9fa48("5776") ? `` : (stryCov_9fa48("5776"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("5778") ? false : stryMutAct_9fa48("5777") ? true : (stryCov_9fa48("5777", "5778"), response.ok)) {
                  if (stryMutAct_9fa48("5779")) {
                    {}
                  } else {
                    stryCov_9fa48("5779");
                    showNotification(stryMutAct_9fa48("5780") ? "" : (stryCov_9fa48("5780"), 'Program context deleted successfully'));
                    fetchContexts();
                  }
                } else {
                  if (stryMutAct_9fa48("5781")) {
                    {}
                  } else {
                    stryCov_9fa48("5781");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("5784") ? error.error && 'Failed to delete program context' : stryMutAct_9fa48("5783") ? false : stryMutAct_9fa48("5782") ? true : (stryCov_9fa48("5782", "5783", "5784"), error.error || (stryMutAct_9fa48("5785") ? "" : (stryCov_9fa48("5785"), 'Failed to delete program context'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5786")) {
                {}
              } else {
                stryCov_9fa48("5786");
                console.error(stryMutAct_9fa48("5787") ? "" : (stryCov_9fa48("5787"), 'Error deleting program context:'), error);
                showNotification(error.message, stryMutAct_9fa48("5788") ? "" : (stryCov_9fa48("5788"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleSetDefault = async context => {
      if (stryMutAct_9fa48("5789")) {
        {}
      } else {
        stryCov_9fa48("5789");
        try {
          if (stryMutAct_9fa48("5790")) {
            {}
          } else {
            stryCov_9fa48("5790");
            const token = localStorage.getItem(stryMutAct_9fa48("5791") ? "" : (stryCov_9fa48("5791"), 'token'));
            const response = await fetch(stryMutAct_9fa48("5792") ? `` : (stryCov_9fa48("5792"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/contexts/${context.id}/set-default`), stryMutAct_9fa48("5793") ? {} : (stryCov_9fa48("5793"), {
              method: stryMutAct_9fa48("5794") ? "" : (stryCov_9fa48("5794"), 'POST'),
              headers: stryMutAct_9fa48("5795") ? {} : (stryCov_9fa48("5795"), {
                'Authorization': stryMutAct_9fa48("5796") ? `` : (stryCov_9fa48("5796"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("5798") ? false : stryMutAct_9fa48("5797") ? true : (stryCov_9fa48("5797", "5798"), response.ok)) {
              if (stryMutAct_9fa48("5799")) {
                {}
              } else {
                stryCov_9fa48("5799");
                showNotification(stryMutAct_9fa48("5800") ? `` : (stryCov_9fa48("5800"), `"${context.name}" set as default program context`));
                fetchContexts();
              }
            } else {
              if (stryMutAct_9fa48("5801")) {
                {}
              } else {
                stryCov_9fa48("5801");
                const error = await response.json();
                throw new Error(stryMutAct_9fa48("5804") ? error.error && 'Failed to set default' : stryMutAct_9fa48("5803") ? false : stryMutAct_9fa48("5802") ? true : (stryCov_9fa48("5802", "5803", "5804"), error.error || (stryMutAct_9fa48("5805") ? "" : (stryCov_9fa48("5805"), 'Failed to set default'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5806")) {
            {}
          } else {
            stryCov_9fa48("5806");
            console.error(stryMutAct_9fa48("5807") ? "" : (stryCov_9fa48("5807"), 'Error setting default:'), error);
            showNotification(error.message, stryMutAct_9fa48("5808") ? "" : (stryCov_9fa48("5808"), 'error'));
          }
        }
      }
    };
    if (stryMutAct_9fa48("5810") ? false : stryMutAct_9fa48("5809") ? true : (stryCov_9fa48("5809", "5810"), loading)) {
      if (stryMutAct_9fa48("5811")) {
        {}
      } else {
        stryCov_9fa48("5811");
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>;
      }
    }
    return <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom>
            Program Contexts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Program-specific context information that provides background about the learning program.
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Program Context
          </Button>
        </div>
      </div>

      {(stryMutAct_9fa48("5814") ? contexts.length !== 0 : stryMutAct_9fa48("5813") ? false : stryMutAct_9fa48("5812") ? true : (stryCov_9fa48("5812", "5813", "5814"), contexts.length === 0)) ? <div className="empty-state">
          <div className="empty-state__icon">🎯</div>
          <Typography variant="h6" gutterBottom>
            No program contexts found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first program context to get started.
          </Typography>
        </div> : <div className="prompt-list">
          {contexts.map(stryMutAct_9fa48("5815") ? () => undefined : (stryCov_9fa48("5815"), context => <div key={context.id} className="prompt-item">
              <div className="prompt-item__header">
                <div className="prompt-item__title">
                  <Typography variant="h6" component="h3">
                    {context.name}
                    {stryMutAct_9fa48("5818") ? context.is_default || <Chip label="Default" size="small" color="primary" sx={{
                  ml: 1
                }} /> : stryMutAct_9fa48("5817") ? false : stryMutAct_9fa48("5816") ? true : (stryCov_9fa48("5816", "5817", "5818"), context.is_default && <Chip label="Default" size="small" color="primary" sx={stryMutAct_9fa48("5819") ? {} : (stryCov_9fa48("5819"), {
                  ml: 1
                })} />)}
                  </Typography>
                  {stryMutAct_9fa48("5822") ? context.description || <Typography variant="body2" color="textSecondary">
                      {context.description}
                    </Typography> : stryMutAct_9fa48("5821") ? false : stryMutAct_9fa48("5820") ? true : (stryCov_9fa48("5820", "5821", "5822"), context.description && <Typography variant="body2" color="textSecondary">
                      {context.description}
                    </Typography>)}
                </div>
                <div className="prompt-item__actions">
                  <IconButton size="small" onClick={stryMutAct_9fa48("5823") ? () => undefined : (stryCov_9fa48("5823"), () => handleSetDefault(context))} disabled={context.is_default} title={context.is_default ? stryMutAct_9fa48("5824") ? "" : (stryCov_9fa48("5824"), 'This is the default') : stryMutAct_9fa48("5825") ? "" : (stryCov_9fa48("5825"), 'Set as default')}>
                    {context.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton size="small" onClick={stryMutAct_9fa48("5826") ? () => undefined : (stryCov_9fa48("5826"), () => handleEdit(context))} title="Edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={stryMutAct_9fa48("5827") ? () => undefined : (stryCov_9fa48("5827"), () => handleDelete(context))} disabled={context.is_default} title={context.is_default ? stryMutAct_9fa48("5828") ? "" : (stryCov_9fa48("5828"), 'Cannot delete default context') : stryMutAct_9fa48("5829") ? "" : (stryCov_9fa48("5829"), 'Delete')} color="error">
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
              
              <div className="prompt-item__content">
                {context.content}
              </div>
              
              <div className="prompt-item__meta">
                <span>Last updated: {new Date(context.updated_at).toLocaleString()}</span>
              </div>
            </div>))}
        </div>}
    </div>;
  }
};
export default ProgramContextsTab;