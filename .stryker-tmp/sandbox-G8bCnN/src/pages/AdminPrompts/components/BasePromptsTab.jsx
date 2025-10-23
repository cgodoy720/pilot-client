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
const BasePromptsTab = ({
  showNotification,
  reloadPrompts
}) => {
  if (stryMutAct_9fa48("4833")) {
    {}
  } else {
    stryCov_9fa48("4833");
    const [prompts, setPrompts] = useState(stryMutAct_9fa48("4834") ? ["Stryker was here"] : (stryCov_9fa48("4834"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("4835") ? false : (stryCov_9fa48("4835"), true));
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [formData, setFormData] = useState(stryMutAct_9fa48("4836") ? {} : (stryCov_9fa48("4836"), {
      name: stryMutAct_9fa48("4837") ? "Stryker was here!" : (stryCov_9fa48("4837"), ''),
      description: stryMutAct_9fa48("4838") ? "Stryker was here!" : (stryCov_9fa48("4838"), ''),
      content: stryMutAct_9fa48("4839") ? "Stryker was here!" : (stryCov_9fa48("4839"), ''),
      is_default: stryMutAct_9fa48("4840") ? true : (stryCov_9fa48("4840"), false)
    }));
    useEffect(() => {
      if (stryMutAct_9fa48("4841")) {
        {}
      } else {
        stryCov_9fa48("4841");
        fetchPrompts();
      }
    }, stryMutAct_9fa48("4842") ? ["Stryker was here"] : (stryCov_9fa48("4842"), []));
    const fetchPrompts = async () => {
      if (stryMutAct_9fa48("4843")) {
        {}
      } else {
        stryCov_9fa48("4843");
        try {
          if (stryMutAct_9fa48("4844")) {
            {}
          } else {
            stryCov_9fa48("4844");
            setLoading(stryMutAct_9fa48("4845") ? false : (stryCov_9fa48("4845"), true));
            const token = localStorage.getItem(stryMutAct_9fa48("4846") ? "" : (stryCov_9fa48("4846"), 'token'));
            const response = await fetch(stryMutAct_9fa48("4847") ? `` : (stryCov_9fa48("4847"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/base`), stryMutAct_9fa48("4848") ? {} : (stryCov_9fa48("4848"), {
              headers: stryMutAct_9fa48("4849") ? {} : (stryCov_9fa48("4849"), {
                'Authorization': stryMutAct_9fa48("4850") ? `` : (stryCov_9fa48("4850"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("4852") ? false : stryMutAct_9fa48("4851") ? true : (stryCov_9fa48("4851", "4852"), response.ok)) {
              if (stryMutAct_9fa48("4853")) {
                {}
              } else {
                stryCov_9fa48("4853");
                const data = await response.json();
                setPrompts(stryMutAct_9fa48("4856") ? data.base_prompts && [] : stryMutAct_9fa48("4855") ? false : stryMutAct_9fa48("4854") ? true : (stryCov_9fa48("4854", "4855", "4856"), data.base_prompts || (stryMutAct_9fa48("4857") ? ["Stryker was here"] : (stryCov_9fa48("4857"), []))));
              }
            } else {
              if (stryMutAct_9fa48("4858")) {
                {}
              } else {
                stryCov_9fa48("4858");
                throw new Error(stryMutAct_9fa48("4859") ? "" : (stryCov_9fa48("4859"), 'Failed to fetch base prompts'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("4860")) {
            {}
          } else {
            stryCov_9fa48("4860");
            console.error(stryMutAct_9fa48("4861") ? "" : (stryCov_9fa48("4861"), 'Error fetching base prompts:'), error);
            showNotification(stryMutAct_9fa48("4862") ? "" : (stryCov_9fa48("4862"), 'Failed to load base prompts'), stryMutAct_9fa48("4863") ? "" : (stryCov_9fa48("4863"), 'error'));
          }
        } finally {
          if (stryMutAct_9fa48("4864")) {
            {}
          } else {
            stryCov_9fa48("4864");
            setLoading(stryMutAct_9fa48("4865") ? true : (stryCov_9fa48("4865"), false));
          }
        }
      }
    };
    const handleCreate = async () => {
      if (stryMutAct_9fa48("4866")) {
        {}
      } else {
        stryCov_9fa48("4866");
        const {
          value: formData
        } = await Swal.fire(stryMutAct_9fa48("4867") ? {} : (stryCov_9fa48("4867"), {
          title: stryMutAct_9fa48("4868") ? "" : (stryCov_9fa48("4868"), 'Create New Base Prompt'),
          html: stryMutAct_9fa48("4869") ? `` : (stryCov_9fa48("4869"), `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" placeholder="e.g., default-base-prompt" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier for the base prompt</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Brief description of the base prompt"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" placeholder="Enter the base prompt content..." rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;"></textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" style="margin-right: 0.5rem;">
              Set as default base prompt
            </label>
          </div>
        </div>
      `),
          background: stryMutAct_9fa48("4870") ? "" : (stryCov_9fa48("4870"), '#2a2d3e'),
          color: stryMutAct_9fa48("4871") ? "" : (stryCov_9fa48("4871"), '#fff'),
          showCancelButton: stryMutAct_9fa48("4872") ? false : (stryCov_9fa48("4872"), true),
          confirmButtonText: stryMutAct_9fa48("4873") ? "" : (stryCov_9fa48("4873"), 'Create Base Prompt'),
          cancelButtonText: stryMutAct_9fa48("4874") ? "" : (stryCov_9fa48("4874"), 'Cancel'),
          confirmButtonColor: stryMutAct_9fa48("4875") ? "" : (stryCov_9fa48("4875"), '#4242ea'),
          cancelButtonColor: stryMutAct_9fa48("4876") ? "" : (stryCov_9fa48("4876"), '#666'),
          width: stryMutAct_9fa48("4877") ? "" : (stryCov_9fa48("4877"), '600px'),
          preConfirm: () => {
            if (stryMutAct_9fa48("4878")) {
              {}
            } else {
              stryCov_9fa48("4878");
              const name = document.getElementById(stryMutAct_9fa48("4879") ? "" : (stryCov_9fa48("4879"), 'swal-name')).value;
              const description = document.getElementById(stryMutAct_9fa48("4880") ? "" : (stryCov_9fa48("4880"), 'swal-description')).value;
              const content = document.getElementById(stryMutAct_9fa48("4881") ? "" : (stryCov_9fa48("4881"), 'swal-content')).value;
              const isDefault = document.getElementById(stryMutAct_9fa48("4882") ? "" : (stryCov_9fa48("4882"), 'swal-default')).checked;
              if (stryMutAct_9fa48("4885") ? false : stryMutAct_9fa48("4884") ? true : stryMutAct_9fa48("4883") ? name.trim() : (stryCov_9fa48("4883", "4884", "4885"), !(stryMutAct_9fa48("4886") ? name : (stryCov_9fa48("4886"), name.trim())))) {
                if (stryMutAct_9fa48("4887")) {
                  {}
                } else {
                  stryCov_9fa48("4887");
                  Swal.showValidationMessage(stryMutAct_9fa48("4888") ? "" : (stryCov_9fa48("4888"), 'Name is required'));
                  return stryMutAct_9fa48("4889") ? true : (stryCov_9fa48("4889"), false);
                }
              }
              if (stryMutAct_9fa48("4892") ? false : stryMutAct_9fa48("4891") ? true : stryMutAct_9fa48("4890") ? content.trim() : (stryCov_9fa48("4890", "4891", "4892"), !(stryMutAct_9fa48("4893") ? content : (stryCov_9fa48("4893"), content.trim())))) {
                if (stryMutAct_9fa48("4894")) {
                  {}
                } else {
                  stryCov_9fa48("4894");
                  Swal.showValidationMessage(stryMutAct_9fa48("4895") ? "" : (stryCov_9fa48("4895"), 'Content is required'));
                  return stryMutAct_9fa48("4896") ? true : (stryCov_9fa48("4896"), false);
                }
              }
              return stryMutAct_9fa48("4897") ? {} : (stryCov_9fa48("4897"), {
                name: stryMutAct_9fa48("4898") ? name : (stryCov_9fa48("4898"), name.trim()),
                description: stryMutAct_9fa48("4901") ? description.trim() && undefined : stryMutAct_9fa48("4900") ? false : stryMutAct_9fa48("4899") ? true : (stryCov_9fa48("4899", "4900", "4901"), (stryMutAct_9fa48("4902") ? description : (stryCov_9fa48("4902"), description.trim())) || undefined),
                content: stryMutAct_9fa48("4903") ? content : (stryCov_9fa48("4903"), content.trim()),
                is_default: isDefault
              });
            }
          }
        }));
        if (stryMutAct_9fa48("4905") ? false : stryMutAct_9fa48("4904") ? true : (stryCov_9fa48("4904", "4905"), formData)) {
          if (stryMutAct_9fa48("4906")) {
            {}
          } else {
            stryCov_9fa48("4906");
            try {
              if (stryMutAct_9fa48("4907")) {
                {}
              } else {
                stryCov_9fa48("4907");
                const token = localStorage.getItem(stryMutAct_9fa48("4908") ? "" : (stryCov_9fa48("4908"), 'token'));
                const response = await fetch(stryMutAct_9fa48("4909") ? `` : (stryCov_9fa48("4909"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/base`), stryMutAct_9fa48("4910") ? {} : (stryCov_9fa48("4910"), {
                  method: stryMutAct_9fa48("4911") ? "" : (stryCov_9fa48("4911"), 'POST'),
                  headers: stryMutAct_9fa48("4912") ? {} : (stryCov_9fa48("4912"), {
                    'Authorization': stryMutAct_9fa48("4913") ? `` : (stryCov_9fa48("4913"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("4914") ? "" : (stryCov_9fa48("4914"), 'application/json')
                  }),
                  body: JSON.stringify(formData)
                }));
                if (stryMutAct_9fa48("4916") ? false : stryMutAct_9fa48("4915") ? true : (stryCov_9fa48("4915", "4916"), response.ok)) {
                  if (stryMutAct_9fa48("4917")) {
                    {}
                  } else {
                    stryCov_9fa48("4917");
                    showNotification(stryMutAct_9fa48("4918") ? "" : (stryCov_9fa48("4918"), 'Base prompt created successfully'));
                    fetchPrompts();
                  }
                } else {
                  if (stryMutAct_9fa48("4919")) {
                    {}
                  } else {
                    stryCov_9fa48("4919");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("4922") ? error.error && 'Failed to create base prompt' : stryMutAct_9fa48("4921") ? false : stryMutAct_9fa48("4920") ? true : (stryCov_9fa48("4920", "4921", "4922"), error.error || (stryMutAct_9fa48("4923") ? "" : (stryCov_9fa48("4923"), 'Failed to create base prompt'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("4924")) {
                {}
              } else {
                stryCov_9fa48("4924");
                console.error(stryMutAct_9fa48("4925") ? "" : (stryCov_9fa48("4925"), 'Error creating base prompt:'), error);
                showNotification(error.message, stryMutAct_9fa48("4926") ? "" : (stryCov_9fa48("4926"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleEdit = async prompt => {
      if (stryMutAct_9fa48("4927")) {
        {}
      } else {
        stryCov_9fa48("4927");
        const {
          value: formData
        } = await Swal.fire(stryMutAct_9fa48("4928") ? {} : (stryCov_9fa48("4928"), {
          title: stryMutAct_9fa48("4929") ? "" : (stryCov_9fa48("4929"), 'Edit Base Prompt'),
          html: stryMutAct_9fa48("4930") ? `` : (stryCov_9fa48("4930"), `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Name *</label>
            <input id="swal-name" class="swal2-input" value="${prompt.name}" 
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
            <small style="color: #888;">Unique identifier for the base prompt</small>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Description</label>
            <input id="swal-description" class="swal2-input" value="${stryMutAct_9fa48("4933") ? prompt.description && '' : stryMutAct_9fa48("4932") ? false : stryMutAct_9fa48("4931") ? true : (stryCov_9fa48("4931", "4932", "4933"), prompt.description || (stryMutAct_9fa48("4934") ? "Stryker was here!" : (stryCov_9fa48("4934"), '')))}"
                   style="margin: 0; width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 500;">Content *</label>
            <textarea id="swal-content" rows="8"
                      style="width: 100%; background: #1A1F2C; border: 1px solid #444; color: #fff; padding: 0.5rem; border-radius: 4px; font-family: Monaco, monospace; font-size: 0.9rem; resize: vertical;">${prompt.content}</textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; color: #fff; cursor: pointer;">
              <input type="checkbox" id="swal-default" ${prompt.is_default ? stryMutAct_9fa48("4935") ? "" : (stryCov_9fa48("4935"), 'checked') : stryMutAct_9fa48("4936") ? "Stryker was here!" : (stryCov_9fa48("4936"), '')} style="margin-right: 0.5rem;">
              Set as default base prompt
            </label>
          </div>
        </div>
      `),
          background: stryMutAct_9fa48("4937") ? "" : (stryCov_9fa48("4937"), '#2a2d3e'),
          color: stryMutAct_9fa48("4938") ? "" : (stryCov_9fa48("4938"), '#fff'),
          showCancelButton: stryMutAct_9fa48("4939") ? false : (stryCov_9fa48("4939"), true),
          confirmButtonText: stryMutAct_9fa48("4940") ? "" : (stryCov_9fa48("4940"), 'Update Base Prompt'),
          cancelButtonText: stryMutAct_9fa48("4941") ? "" : (stryCov_9fa48("4941"), 'Cancel'),
          confirmButtonColor: stryMutAct_9fa48("4942") ? "" : (stryCov_9fa48("4942"), '#4242ea'),
          cancelButtonColor: stryMutAct_9fa48("4943") ? "" : (stryCov_9fa48("4943"), '#666'),
          width: stryMutAct_9fa48("4944") ? "" : (stryCov_9fa48("4944"), '600px'),
          preConfirm: () => {
            if (stryMutAct_9fa48("4945")) {
              {}
            } else {
              stryCov_9fa48("4945");
              const name = document.getElementById(stryMutAct_9fa48("4946") ? "" : (stryCov_9fa48("4946"), 'swal-name')).value;
              const description = document.getElementById(stryMutAct_9fa48("4947") ? "" : (stryCov_9fa48("4947"), 'swal-description')).value;
              const content = document.getElementById(stryMutAct_9fa48("4948") ? "" : (stryCov_9fa48("4948"), 'swal-content')).value;
              const isDefault = document.getElementById(stryMutAct_9fa48("4949") ? "" : (stryCov_9fa48("4949"), 'swal-default')).checked;
              if (stryMutAct_9fa48("4952") ? false : stryMutAct_9fa48("4951") ? true : stryMutAct_9fa48("4950") ? name.trim() : (stryCov_9fa48("4950", "4951", "4952"), !(stryMutAct_9fa48("4953") ? name : (stryCov_9fa48("4953"), name.trim())))) {
                if (stryMutAct_9fa48("4954")) {
                  {}
                } else {
                  stryCov_9fa48("4954");
                  Swal.showValidationMessage(stryMutAct_9fa48("4955") ? "" : (stryCov_9fa48("4955"), 'Name is required'));
                  return stryMutAct_9fa48("4956") ? true : (stryCov_9fa48("4956"), false);
                }
              }
              if (stryMutAct_9fa48("4959") ? false : stryMutAct_9fa48("4958") ? true : stryMutAct_9fa48("4957") ? content.trim() : (stryCov_9fa48("4957", "4958", "4959"), !(stryMutAct_9fa48("4960") ? content : (stryCov_9fa48("4960"), content.trim())))) {
                if (stryMutAct_9fa48("4961")) {
                  {}
                } else {
                  stryCov_9fa48("4961");
                  Swal.showValidationMessage(stryMutAct_9fa48("4962") ? "" : (stryCov_9fa48("4962"), 'Content is required'));
                  return stryMutAct_9fa48("4963") ? true : (stryCov_9fa48("4963"), false);
                }
              }
              return stryMutAct_9fa48("4964") ? {} : (stryCov_9fa48("4964"), {
                name: stryMutAct_9fa48("4965") ? name : (stryCov_9fa48("4965"), name.trim()),
                description: stryMutAct_9fa48("4968") ? description.trim() && undefined : stryMutAct_9fa48("4967") ? false : stryMutAct_9fa48("4966") ? true : (stryCov_9fa48("4966", "4967", "4968"), (stryMutAct_9fa48("4969") ? description : (stryCov_9fa48("4969"), description.trim())) || undefined),
                content: stryMutAct_9fa48("4970") ? content : (stryCov_9fa48("4970"), content.trim()),
                is_default: isDefault
              });
            }
          }
        }));
        if (stryMutAct_9fa48("4972") ? false : stryMutAct_9fa48("4971") ? true : (stryCov_9fa48("4971", "4972"), formData)) {
          if (stryMutAct_9fa48("4973")) {
            {}
          } else {
            stryCov_9fa48("4973");
            try {
              if (stryMutAct_9fa48("4974")) {
                {}
              } else {
                stryCov_9fa48("4974");
                const token = localStorage.getItem(stryMutAct_9fa48("4975") ? "" : (stryCov_9fa48("4975"), 'token'));
                const response = await fetch(stryMutAct_9fa48("4976") ? `` : (stryCov_9fa48("4976"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/base/${prompt.id}`), stryMutAct_9fa48("4977") ? {} : (stryCov_9fa48("4977"), {
                  method: stryMutAct_9fa48("4978") ? "" : (stryCov_9fa48("4978"), 'PUT'),
                  headers: stryMutAct_9fa48("4979") ? {} : (stryCov_9fa48("4979"), {
                    'Authorization': stryMutAct_9fa48("4980") ? `` : (stryCov_9fa48("4980"), `Bearer ${token}`),
                    'Content-Type': stryMutAct_9fa48("4981") ? "" : (stryCov_9fa48("4981"), 'application/json')
                  }),
                  body: JSON.stringify(formData)
                }));
                if (stryMutAct_9fa48("4983") ? false : stryMutAct_9fa48("4982") ? true : (stryCov_9fa48("4982", "4983"), response.ok)) {
                  if (stryMutAct_9fa48("4984")) {
                    {}
                  } else {
                    stryCov_9fa48("4984");
                    showNotification(stryMutAct_9fa48("4985") ? "" : (stryCov_9fa48("4985"), 'Base prompt updated successfully'));
                    fetchPrompts();
                  }
                } else {
                  if (stryMutAct_9fa48("4986")) {
                    {}
                  } else {
                    stryCov_9fa48("4986");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("4989") ? error.error && 'Failed to update base prompt' : stryMutAct_9fa48("4988") ? false : stryMutAct_9fa48("4987") ? true : (stryCov_9fa48("4987", "4988", "4989"), error.error || (stryMutAct_9fa48("4990") ? "" : (stryCov_9fa48("4990"), 'Failed to update base prompt'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("4991")) {
                {}
              } else {
                stryCov_9fa48("4991");
                console.error(stryMutAct_9fa48("4992") ? "" : (stryCov_9fa48("4992"), 'Error updating base prompt:'), error);
                showNotification(error.message, stryMutAct_9fa48("4993") ? "" : (stryCov_9fa48("4993"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleDelete = async prompt => {
      if (stryMutAct_9fa48("4994")) {
        {}
      } else {
        stryCov_9fa48("4994");
        const result = await Swal.fire(stryMutAct_9fa48("4995") ? {} : (stryCov_9fa48("4995"), {
          title: stryMutAct_9fa48("4996") ? "" : (stryCov_9fa48("4996"), 'Delete Base Prompt?'),
          text: stryMutAct_9fa48("4997") ? `` : (stryCov_9fa48("4997"), `Are you sure you want to delete "${prompt.name}"? This action cannot be undone.`),
          icon: stryMutAct_9fa48("4998") ? "" : (stryCov_9fa48("4998"), 'warning'),
          showCancelButton: stryMutAct_9fa48("4999") ? false : (stryCov_9fa48("4999"), true),
          confirmButtonColor: stryMutAct_9fa48("5000") ? "" : (stryCov_9fa48("5000"), '#d33'),
          cancelButtonColor: stryMutAct_9fa48("5001") ? "" : (stryCov_9fa48("5001"), '#666'),
          confirmButtonText: stryMutAct_9fa48("5002") ? "" : (stryCov_9fa48("5002"), 'Delete'),
          cancelButtonText: stryMutAct_9fa48("5003") ? "" : (stryCov_9fa48("5003"), 'Cancel'),
          background: stryMutAct_9fa48("5004") ? "" : (stryCov_9fa48("5004"), '#2a2d3e'),
          color: stryMutAct_9fa48("5005") ? "" : (stryCov_9fa48("5005"), '#fff')
        }));
        if (stryMutAct_9fa48("5007") ? false : stryMutAct_9fa48("5006") ? true : (stryCov_9fa48("5006", "5007"), result.isConfirmed)) {
          if (stryMutAct_9fa48("5008")) {
            {}
          } else {
            stryCov_9fa48("5008");
            try {
              if (stryMutAct_9fa48("5009")) {
                {}
              } else {
                stryCov_9fa48("5009");
                const token = localStorage.getItem(stryMutAct_9fa48("5010") ? "" : (stryCov_9fa48("5010"), 'token'));
                const response = await fetch(stryMutAct_9fa48("5011") ? `` : (stryCov_9fa48("5011"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/base/${prompt.id}`), stryMutAct_9fa48("5012") ? {} : (stryCov_9fa48("5012"), {
                  method: stryMutAct_9fa48("5013") ? "" : (stryCov_9fa48("5013"), 'DELETE'),
                  headers: stryMutAct_9fa48("5014") ? {} : (stryCov_9fa48("5014"), {
                    'Authorization': stryMutAct_9fa48("5015") ? `` : (stryCov_9fa48("5015"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("5017") ? false : stryMutAct_9fa48("5016") ? true : (stryCov_9fa48("5016", "5017"), response.ok)) {
                  if (stryMutAct_9fa48("5018")) {
                    {}
                  } else {
                    stryCov_9fa48("5018");
                    showNotification(stryMutAct_9fa48("5019") ? "" : (stryCov_9fa48("5019"), 'Base prompt deleted successfully'));
                    fetchPrompts();
                  }
                } else {
                  if (stryMutAct_9fa48("5020")) {
                    {}
                  } else {
                    stryCov_9fa48("5020");
                    const error = await response.json();
                    throw new Error(stryMutAct_9fa48("5023") ? error.error && 'Failed to delete base prompt' : stryMutAct_9fa48("5022") ? false : stryMutAct_9fa48("5021") ? true : (stryCov_9fa48("5021", "5022", "5023"), error.error || (stryMutAct_9fa48("5024") ? "" : (stryCov_9fa48("5024"), 'Failed to delete base prompt'))));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("5025")) {
                {}
              } else {
                stryCov_9fa48("5025");
                console.error(stryMutAct_9fa48("5026") ? "" : (stryCov_9fa48("5026"), 'Error deleting base prompt:'), error);
                showNotification(error.message, stryMutAct_9fa48("5027") ? "" : (stryCov_9fa48("5027"), 'error'));
              }
            }
          }
        }
      }
    };
    const handleSetDefault = async prompt => {
      if (stryMutAct_9fa48("5028")) {
        {}
      } else {
        stryCov_9fa48("5028");
        try {
          if (stryMutAct_9fa48("5029")) {
            {}
          } else {
            stryCov_9fa48("5029");
            const token = localStorage.getItem(stryMutAct_9fa48("5030") ? "" : (stryCov_9fa48("5030"), 'token'));
            const response = await fetch(stryMutAct_9fa48("5031") ? `` : (stryCov_9fa48("5031"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/base/${prompt.id}/set-default`), stryMutAct_9fa48("5032") ? {} : (stryCov_9fa48("5032"), {
              method: stryMutAct_9fa48("5033") ? "" : (stryCov_9fa48("5033"), 'POST'),
              headers: stryMutAct_9fa48("5034") ? {} : (stryCov_9fa48("5034"), {
                'Authorization': stryMutAct_9fa48("5035") ? `` : (stryCov_9fa48("5035"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("5037") ? false : stryMutAct_9fa48("5036") ? true : (stryCov_9fa48("5036", "5037"), response.ok)) {
              if (stryMutAct_9fa48("5038")) {
                {}
              } else {
                stryCov_9fa48("5038");
                showNotification(stryMutAct_9fa48("5039") ? `` : (stryCov_9fa48("5039"), `"${prompt.name}" set as default base prompt`));
                fetchPrompts();
              }
            } else {
              if (stryMutAct_9fa48("5040")) {
                {}
              } else {
                stryCov_9fa48("5040");
                const error = await response.json();
                throw new Error(stryMutAct_9fa48("5043") ? error.error && 'Failed to set default' : stryMutAct_9fa48("5042") ? false : stryMutAct_9fa48("5041") ? true : (stryCov_9fa48("5041", "5042", "5043"), error.error || (stryMutAct_9fa48("5044") ? "" : (stryCov_9fa48("5044"), 'Failed to set default'))));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5045")) {
            {}
          } else {
            stryCov_9fa48("5045");
            console.error(stryMutAct_9fa48("5046") ? "" : (stryCov_9fa48("5046"), 'Error setting default:'), error);
            showNotification(error.message, stryMutAct_9fa48("5047") ? "" : (stryCov_9fa48("5047"), 'error'));
          }
        }
      }
    };
    if (stryMutAct_9fa48("5049") ? false : stryMutAct_9fa48("5048") ? true : (stryCov_9fa48("5048", "5049"), loading)) {
      if (stryMutAct_9fa48("5050")) {
        {}
      } else {
        stryCov_9fa48("5050");
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>;
      }
    }
    return <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom>
            Base Prompts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Core system prompts that define the AI's fundamental behavior and context.
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Base Prompt
          </Button>
        </div>
      </div>

      {(stryMutAct_9fa48("5053") ? prompts.length !== 0 : stryMutAct_9fa48("5052") ? false : stryMutAct_9fa48("5051") ? true : (stryCov_9fa48("5051", "5052", "5053"), prompts.length === 0)) ? <div className="empty-state">
          <div className="empty-state__icon">📝</div>
          <Typography variant="h6" gutterBottom>
            No base prompts found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create your first base prompt to get started.
          </Typography>
        </div> : <div className="prompt-list">
          {prompts.map(stryMutAct_9fa48("5054") ? () => undefined : (stryCov_9fa48("5054"), prompt => <div key={prompt.id} className="prompt-item">
              <div className="prompt-item__header">
                <div className="prompt-item__title">
                  <Typography variant="h6" component="h3">
                    {prompt.name}
                    {stryMutAct_9fa48("5057") ? prompt.is_default || <Chip label="Default" size="small" color="primary" sx={{
                  ml: 1
                }} /> : stryMutAct_9fa48("5056") ? false : stryMutAct_9fa48("5055") ? true : (stryCov_9fa48("5055", "5056", "5057"), prompt.is_default && <Chip label="Default" size="small" color="primary" sx={stryMutAct_9fa48("5058") ? {} : (stryCov_9fa48("5058"), {
                  ml: 1
                })} />)}
                  </Typography>
                  {stryMutAct_9fa48("5061") ? prompt.description || <Typography variant="body2" color="textSecondary">
                      {prompt.description}
                    </Typography> : stryMutAct_9fa48("5060") ? false : stryMutAct_9fa48("5059") ? true : (stryCov_9fa48("5059", "5060", "5061"), prompt.description && <Typography variant="body2" color="textSecondary">
                      {prompt.description}
                    </Typography>)}
                </div>
                <div className="prompt-item__actions">
                  <IconButton size="small" onClick={stryMutAct_9fa48("5062") ? () => undefined : (stryCov_9fa48("5062"), () => handleSetDefault(prompt))} disabled={prompt.is_default} title={prompt.is_default ? stryMutAct_9fa48("5063") ? "" : (stryCov_9fa48("5063"), 'This is the default') : stryMutAct_9fa48("5064") ? "" : (stryCov_9fa48("5064"), 'Set as default')}>
                    {prompt.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton size="small" onClick={stryMutAct_9fa48("5065") ? () => undefined : (stryCov_9fa48("5065"), () => handleEdit(prompt))} title="Edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={stryMutAct_9fa48("5066") ? () => undefined : (stryCov_9fa48("5066"), () => handleDelete(prompt))} disabled={prompt.is_default} title={prompt.is_default ? stryMutAct_9fa48("5067") ? "" : (stryCov_9fa48("5067"), 'Cannot delete default prompt') : stryMutAct_9fa48("5068") ? "" : (stryCov_9fa48("5068"), 'Delete')} color="error">
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
              
              <div className="prompt-item__content">
                {prompt.content}
              </div>
              
              <div className="prompt-item__meta">
                <span>Last updated: {new Date(prompt.updated_at).toLocaleString()}</span>
              </div>
            </div>))}
        </div>}
    </div>;
  }
};
export default BasePromptsTab;