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
import { useAuth } from '../../context/AuthContext';
import './Account.css';
function Account() {
  if (stryMutAct_9fa48("4543")) {
    {}
  } else {
    stryCov_9fa48("4543");
    const {
      user,
      token,
      updateUser
    } = useAuth();
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("4544") ? true : (stryCov_9fa48("4544"), false));
    const [isSaving, setIsSaving] = useState(stryMutAct_9fa48("4545") ? true : (stryCov_9fa48("4545"), false));
    const [message, setMessage] = useState(stryMutAct_9fa48("4546") ? "Stryker was here!" : (stryCov_9fa48("4546"), ''));
    const [error, setError] = useState(stryMutAct_9fa48("4547") ? "Stryker was here!" : (stryCov_9fa48("4547"), ''));

    // User info state
    const [firstName, setFirstName] = useState(stryMutAct_9fa48("4548") ? "Stryker was here!" : (stryCov_9fa48("4548"), ''));
    const [lastName, setLastName] = useState(stryMutAct_9fa48("4549") ? "Stryker was here!" : (stryCov_9fa48("4549"), ''));

    // GitHub integration state
    const [githubConnected, setGithubConnected] = useState(stryMutAct_9fa48("4550") ? true : (stryCov_9fa48("4550"), false));
    const [githubUser, setGithubUser] = useState(null);
    const [isConnecting, setIsConnecting] = useState(stryMutAct_9fa48("4551") ? true : (stryCov_9fa48("4551"), false));
    const [githubRepos, setGithubRepos] = useState(stryMutAct_9fa48("4552") ? ["Stryker was here"] : (stryCov_9fa48("4552"), []));
    const [isLoadingRepos, setIsLoadingRepos] = useState(stryMutAct_9fa48("4553") ? true : (stryCov_9fa48("4553"), false));
    const [showRepos, setShowRepos] = useState(stryMutAct_9fa48("4554") ? true : (stryCov_9fa48("4554"), false));
    useEffect(() => {
      if (stryMutAct_9fa48("4555")) {
        {}
      } else {
        stryCov_9fa48("4555");
        if (stryMutAct_9fa48("4557") ? false : stryMutAct_9fa48("4556") ? true : (stryCov_9fa48("4556", "4557"), user)) {
          if (stryMutAct_9fa48("4558")) {
            {}
          } else {
            stryCov_9fa48("4558");
            // Handle both camelCase and snake_case field names
            setFirstName(stryMutAct_9fa48("4561") ? (user.firstName || user.first_name) && '' : stryMutAct_9fa48("4560") ? false : stryMutAct_9fa48("4559") ? true : (stryCov_9fa48("4559", "4560", "4561"), (stryMutAct_9fa48("4563") ? user.firstName && user.first_name : stryMutAct_9fa48("4562") ? false : (stryCov_9fa48("4562", "4563"), user.firstName || user.first_name)) || (stryMutAct_9fa48("4564") ? "Stryker was here!" : (stryCov_9fa48("4564"), ''))));
            setLastName(stryMutAct_9fa48("4567") ? (user.lastName || user.last_name) && '' : stryMutAct_9fa48("4566") ? false : stryMutAct_9fa48("4565") ? true : (stryCov_9fa48("4565", "4566", "4567"), (stryMutAct_9fa48("4569") ? user.lastName && user.last_name : stryMutAct_9fa48("4568") ? false : (stryCov_9fa48("4568", "4569"), user.lastName || user.last_name)) || (stryMutAct_9fa48("4570") ? "Stryker was here!" : (stryCov_9fa48("4570"), ''))));
            checkGitHubConnection();
          }
        }
      }
    }, stryMutAct_9fa48("4571") ? [] : (stryCov_9fa48("4571"), [user]));

    // Handle GitHub OAuth callback
    useEffect(() => {
      if (stryMutAct_9fa48("4572")) {
        {}
      } else {
        stryCov_9fa48("4572");
        const urlParams = new URLSearchParams(window.location.search);
        const githubStatus = urlParams.get(stryMutAct_9fa48("4573") ? "" : (stryCov_9fa48("4573"), 'github'));
        if (stryMutAct_9fa48("4576") ? githubStatus !== 'success' : stryMutAct_9fa48("4575") ? false : stryMutAct_9fa48("4574") ? true : (stryCov_9fa48("4574", "4575", "4576"), githubStatus === (stryMutAct_9fa48("4577") ? "" : (stryCov_9fa48("4577"), 'success')))) {
          if (stryMutAct_9fa48("4578")) {
            {}
          } else {
            stryCov_9fa48("4578");
            setMessage(stryMutAct_9fa48("4579") ? "" : (stryCov_9fa48("4579"), 'GitHub account connected successfully!'));
            setTimeout(stryMutAct_9fa48("4580") ? () => undefined : (stryCov_9fa48("4580"), () => setMessage(stryMutAct_9fa48("4581") ? "Stryker was here!" : (stryCov_9fa48("4581"), ''))), 3000);
            checkGitHubConnection(); // Refresh connection status
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else if (stryMutAct_9fa48("4584") ? githubStatus !== 'error' : stryMutAct_9fa48("4583") ? false : stryMutAct_9fa48("4582") ? true : (stryCov_9fa48("4582", "4583", "4584"), githubStatus === (stryMutAct_9fa48("4585") ? "" : (stryCov_9fa48("4585"), 'error')))) {
          if (stryMutAct_9fa48("4586")) {
            {}
          } else {
            stryCov_9fa48("4586");
            setError(stryMutAct_9fa48("4587") ? "" : (stryCov_9fa48("4587"), 'Failed to connect GitHub account. Please try again.'));
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    }, stryMutAct_9fa48("4588") ? ["Stryker was here"] : (stryCov_9fa48("4588"), []));
    const checkGitHubConnection = async () => {
      if (stryMutAct_9fa48("4589")) {
        {}
      } else {
        stryCov_9fa48("4589");
        try {
          if (stryMutAct_9fa48("4590")) {
            {}
          } else {
            stryCov_9fa48("4590");
            const response = await fetch(stryMutAct_9fa48("4591") ? `` : (stryCov_9fa48("4591"), `${import.meta.env.VITE_API_URL}/api/github/status`), stryMutAct_9fa48("4592") ? {} : (stryCov_9fa48("4592"), {
              headers: stryMutAct_9fa48("4593") ? {} : (stryCov_9fa48("4593"), {
                'Authorization': stryMutAct_9fa48("4594") ? `` : (stryCov_9fa48("4594"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("4596") ? false : stryMutAct_9fa48("4595") ? true : (stryCov_9fa48("4595", "4596"), response.ok)) {
              if (stryMutAct_9fa48("4597")) {
                {}
              } else {
                stryCov_9fa48("4597");
                const data = await response.json();
                setGithubConnected(data.connected);
                if (stryMutAct_9fa48("4599") ? false : stryMutAct_9fa48("4598") ? true : (stryCov_9fa48("4598", "4599"), data.connected)) {
                  if (stryMutAct_9fa48("4600")) {
                    {}
                  } else {
                    stryCov_9fa48("4600");
                    setGithubUser(stryMutAct_9fa48("4601") ? {} : (stryCov_9fa48("4601"), {
                      username: data.username,
                      avatar_url: data.avatar_url
                    }));
                  }
                } else {
                  if (stryMutAct_9fa48("4602")) {
                    {}
                  } else {
                    stryCov_9fa48("4602");
                    setGithubRepos(stryMutAct_9fa48("4603") ? ["Stryker was here"] : (stryCov_9fa48("4603"), []));
                    setShowRepos(stryMutAct_9fa48("4604") ? true : (stryCov_9fa48("4604"), false));
                  }
                }
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("4605")) {
            {}
          } else {
            stryCov_9fa48("4605");
            console.error(stryMutAct_9fa48("4606") ? "" : (stryCov_9fa48("4606"), 'Error checking GitHub connection:'), err);
          }
        }
      }
    };
    const handleSaveUserInfo = async e => {
      if (stryMutAct_9fa48("4607")) {
        {}
      } else {
        stryCov_9fa48("4607");
        e.preventDefault();
        setIsSaving(stryMutAct_9fa48("4608") ? false : (stryCov_9fa48("4608"), true));
        setError(stryMutAct_9fa48("4609") ? "Stryker was here!" : (stryCov_9fa48("4609"), ''));
        setMessage(stryMutAct_9fa48("4610") ? "Stryker was here!" : (stryCov_9fa48("4610"), ''));
        try {
          if (stryMutAct_9fa48("4611")) {
            {}
          } else {
            stryCov_9fa48("4611");
            const response = await fetch(stryMutAct_9fa48("4612") ? `` : (stryCov_9fa48("4612"), `${import.meta.env.VITE_API_URL}/api/users/update`), stryMutAct_9fa48("4613") ? {} : (stryCov_9fa48("4613"), {
              method: stryMutAct_9fa48("4614") ? "" : (stryCov_9fa48("4614"), 'PUT'),
              headers: stryMutAct_9fa48("4615") ? {} : (stryCov_9fa48("4615"), {
                'Content-Type': stryMutAct_9fa48("4616") ? "" : (stryCov_9fa48("4616"), 'application/json'),
                'Authorization': stryMutAct_9fa48("4617") ? `` : (stryCov_9fa48("4617"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("4618") ? {} : (stryCov_9fa48("4618"), {
                first_name: stryMutAct_9fa48("4619") ? firstName : (stryCov_9fa48("4619"), firstName.trim()),
                last_name: stryMutAct_9fa48("4620") ? lastName : (stryCov_9fa48("4620"), lastName.trim())
              }))
            }));
            if (stryMutAct_9fa48("4623") ? false : stryMutAct_9fa48("4622") ? true : stryMutAct_9fa48("4621") ? response.ok : (stryCov_9fa48("4621", "4622", "4623"), !response.ok)) {
              if (stryMutAct_9fa48("4624")) {
                {}
              } else {
                stryCov_9fa48("4624");
                throw new Error(stryMutAct_9fa48("4625") ? "" : (stryCov_9fa48("4625"), 'Failed to update user information'));
              }
            }
            const data = await response.json();

            // Update the user state with the new information
            updateUser(stryMutAct_9fa48("4626") ? {} : (stryCov_9fa48("4626"), {
              first_name: stryMutAct_9fa48("4627") ? firstName : (stryCov_9fa48("4627"), firstName.trim()),
              last_name: stryMutAct_9fa48("4628") ? lastName : (stryCov_9fa48("4628"), lastName.trim()),
              firstName: stryMutAct_9fa48("4629") ? firstName : (stryCov_9fa48("4629"), firstName.trim()),
              // Also update camelCase version if it exists
              lastName: stryMutAct_9fa48("4630") ? lastName : (stryCov_9fa48("4630"), lastName.trim())
            }));
            setMessage(stryMutAct_9fa48("4631") ? "" : (stryCov_9fa48("4631"), 'Profile updated successfully!'));
            setTimeout(stryMutAct_9fa48("4632") ? () => undefined : (stryCov_9fa48("4632"), () => setMessage(stryMutAct_9fa48("4633") ? "Stryker was here!" : (stryCov_9fa48("4633"), ''))), 3000);
          }
        } catch (err) {
          if (stryMutAct_9fa48("4634")) {
            {}
          } else {
            stryCov_9fa48("4634");
            console.error(stryMutAct_9fa48("4635") ? "" : (stryCov_9fa48("4635"), 'Error updating user info:'), err);
            setError(stryMutAct_9fa48("4636") ? "" : (stryCov_9fa48("4636"), 'Failed to update profile. Please try again.'));
          }
        } finally {
          if (stryMutAct_9fa48("4637")) {
            {}
          } else {
            stryCov_9fa48("4637");
            setIsSaving(stryMutAct_9fa48("4638") ? true : (stryCov_9fa48("4638"), false));
          }
        }
      }
    };
    const handleConnectGitHub = async () => {
      if (stryMutAct_9fa48("4639")) {
        {}
      } else {
        stryCov_9fa48("4639");
        setIsConnecting(stryMutAct_9fa48("4640") ? false : (stryCov_9fa48("4640"), true));
        try {
          if (stryMutAct_9fa48("4641")) {
            {}
          } else {
            stryCov_9fa48("4641");
            const response = await fetch(stryMutAct_9fa48("4642") ? `` : (stryCov_9fa48("4642"), `${import.meta.env.VITE_API_URL}/api/github/auth`), stryMutAct_9fa48("4643") ? {} : (stryCov_9fa48("4643"), {
              headers: stryMutAct_9fa48("4644") ? {} : (stryCov_9fa48("4644"), {
                'Authorization': stryMutAct_9fa48("4645") ? `` : (stryCov_9fa48("4645"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("4647") ? false : stryMutAct_9fa48("4646") ? true : (stryCov_9fa48("4646", "4647"), response.ok)) {
              if (stryMutAct_9fa48("4648")) {
                {}
              } else {
                stryCov_9fa48("4648");
                const data = await response.json();
                // Redirect to GitHub OAuth URL
                window.location.href = data.authUrl;
              }
            } else {
              if (stryMutAct_9fa48("4649")) {
                {}
              } else {
                stryCov_9fa48("4649");
                throw new Error(stryMutAct_9fa48("4650") ? "" : (stryCov_9fa48("4650"), 'Failed to initiate GitHub OAuth'));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("4651")) {
            {}
          } else {
            stryCov_9fa48("4651");
            console.error(stryMutAct_9fa48("4652") ? "" : (stryCov_9fa48("4652"), 'Error connecting to GitHub:'), err);
            setError(stryMutAct_9fa48("4653") ? "" : (stryCov_9fa48("4653"), 'Failed to connect to GitHub. Please try again.'));
            setIsConnecting(stryMutAct_9fa48("4654") ? true : (stryCov_9fa48("4654"), false));
          }
        }
      }
    };
    const handleDisconnectGitHub = async () => {
      if (stryMutAct_9fa48("4655")) {
        {}
      } else {
        stryCov_9fa48("4655");
        try {
          if (stryMutAct_9fa48("4656")) {
            {}
          } else {
            stryCov_9fa48("4656");
            const response = await fetch(stryMutAct_9fa48("4657") ? `` : (stryCov_9fa48("4657"), `${import.meta.env.VITE_API_URL}/api/github/disconnect`), stryMutAct_9fa48("4658") ? {} : (stryCov_9fa48("4658"), {
              method: stryMutAct_9fa48("4659") ? "" : (stryCov_9fa48("4659"), 'DELETE'),
              headers: stryMutAct_9fa48("4660") ? {} : (stryCov_9fa48("4660"), {
                'Authorization': stryMutAct_9fa48("4661") ? `` : (stryCov_9fa48("4661"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("4663") ? false : stryMutAct_9fa48("4662") ? true : (stryCov_9fa48("4662", "4663"), response.ok)) {
              if (stryMutAct_9fa48("4664")) {
                {}
              } else {
                stryCov_9fa48("4664");
                setGithubConnected(stryMutAct_9fa48("4665") ? true : (stryCov_9fa48("4665"), false));
                setGithubUser(null);
                setGithubRepos(stryMutAct_9fa48("4666") ? ["Stryker was here"] : (stryCov_9fa48("4666"), []));
                setShowRepos(stryMutAct_9fa48("4667") ? true : (stryCov_9fa48("4667"), false));
                setMessage(stryMutAct_9fa48("4668") ? "" : (stryCov_9fa48("4668"), 'GitHub account disconnected successfully!'));
                setTimeout(stryMutAct_9fa48("4669") ? () => undefined : (stryCov_9fa48("4669"), () => setMessage(stryMutAct_9fa48("4670") ? "Stryker was here!" : (stryCov_9fa48("4670"), ''))), 3000);
              }
            } else {
              if (stryMutAct_9fa48("4671")) {
                {}
              } else {
                stryCov_9fa48("4671");
                throw new Error(stryMutAct_9fa48("4672") ? "" : (stryCov_9fa48("4672"), 'Failed to disconnect GitHub account'));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("4673")) {
            {}
          } else {
            stryCov_9fa48("4673");
            console.error(stryMutAct_9fa48("4674") ? "" : (stryCov_9fa48("4674"), 'Error disconnecting from GitHub:'), err);
            setError(stryMutAct_9fa48("4675") ? "" : (stryCov_9fa48("4675"), 'Failed to disconnect from GitHub. Please try again.'));
          }
        }
      }
    };
    const handleViewRepos = async () => {
      if (stryMutAct_9fa48("4676")) {
        {}
      } else {
        stryCov_9fa48("4676");
        if (stryMutAct_9fa48("4678") ? false : stryMutAct_9fa48("4677") ? true : (stryCov_9fa48("4677", "4678"), showRepos)) {
          if (stryMutAct_9fa48("4679")) {
            {}
          } else {
            stryCov_9fa48("4679");
            setShowRepos(stryMutAct_9fa48("4680") ? true : (stryCov_9fa48("4680"), false));
            return;
          }
        }
        setIsLoadingRepos(stryMutAct_9fa48("4681") ? false : (stryCov_9fa48("4681"), true));
        try {
          if (stryMutAct_9fa48("4682")) {
            {}
          } else {
            stryCov_9fa48("4682");
            const response = await fetch(stryMutAct_9fa48("4683") ? `` : (stryCov_9fa48("4683"), `${import.meta.env.VITE_API_URL}/api/github/repos`), stryMutAct_9fa48("4684") ? {} : (stryCov_9fa48("4684"), {
              headers: stryMutAct_9fa48("4685") ? {} : (stryCov_9fa48("4685"), {
                'Authorization': stryMutAct_9fa48("4686") ? `` : (stryCov_9fa48("4686"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("4688") ? false : stryMutAct_9fa48("4687") ? true : (stryCov_9fa48("4687", "4688"), response.ok)) {
              if (stryMutAct_9fa48("4689")) {
                {}
              } else {
                stryCov_9fa48("4689");
                const data = await response.json();
                setGithubRepos(data.repos);
                setShowRepos(stryMutAct_9fa48("4690") ? false : (stryCov_9fa48("4690"), true));
              }
            } else {
              if (stryMutAct_9fa48("4691")) {
                {}
              } else {
                stryCov_9fa48("4691");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("4694") ? errorData.error && 'Failed to fetch repositories' : stryMutAct_9fa48("4693") ? false : stryMutAct_9fa48("4692") ? true : (stryCov_9fa48("4692", "4693", "4694"), errorData.error || (stryMutAct_9fa48("4695") ? "" : (stryCov_9fa48("4695"), 'Failed to fetch repositories'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("4696")) {
            {}
          } else {
            stryCov_9fa48("4696");
            console.error(stryMutAct_9fa48("4697") ? "" : (stryCov_9fa48("4697"), 'Error fetching GitHub repos:'), err);
            setError(stryMutAct_9fa48("4700") ? err.message && 'Failed to fetch repositories. Please try again.' : stryMutAct_9fa48("4699") ? false : stryMutAct_9fa48("4698") ? true : (stryCov_9fa48("4698", "4699", "4700"), err.message || (stryMutAct_9fa48("4701") ? "" : (stryCov_9fa48("4701"), 'Failed to fetch repositories. Please try again.'))));
          }
        } finally {
          if (stryMutAct_9fa48("4702")) {
            {}
          } else {
            stryCov_9fa48("4702");
            setIsLoadingRepos(stryMutAct_9fa48("4703") ? true : (stryCov_9fa48("4703"), false));
          }
        }
      }
    };
    return <div className="account">
      <div className="account__container">
        {/* Messages */}
        {stryMutAct_9fa48("4706") ? message || <div className="account__message account__message--success">{message}</div> : stryMutAct_9fa48("4705") ? false : stryMutAct_9fa48("4704") ? true : (stryCov_9fa48("4704", "4705", "4706"), message && <div className="account__message account__message--success">{message}</div>)}
        {stryMutAct_9fa48("4709") ? error || <div className="account__message account__message--error">{error}</div> : stryMutAct_9fa48("4708") ? false : stryMutAct_9fa48("4707") ? true : (stryCov_9fa48("4707", "4708", "4709"), error && <div className="account__message account__message--error">{error}</div>)}

        {/* Account Information Section */}
        <div className="account__section">
          <h2 className="account__section-title">Account Information</h2>
          <div className="account__info-grid">
            <div className="account__info-item">
              <label className="account__info-label">Email Address</label>
              <div className="account__info-value">
                {stryMutAct_9fa48("4712") ? user?.email && 'Not specified' : stryMutAct_9fa48("4711") ? false : stryMutAct_9fa48("4710") ? true : (stryCov_9fa48("4710", "4711", "4712"), (stryMutAct_9fa48("4713") ? user.email : (stryCov_9fa48("4713"), user?.email)) || (stryMutAct_9fa48("4714") ? "" : (stryCov_9fa48("4714"), 'Not specified')))}
              </div>
            </div>
            <div className="account__info-item">
              <label className="account__info-label">Cohort</label>
              <div className="account__info-value">
                {stryMutAct_9fa48("4717") ? user?.cohort && 'Not specified' : stryMutAct_9fa48("4716") ? false : stryMutAct_9fa48("4715") ? true : (stryCov_9fa48("4715", "4716", "4717"), (stryMutAct_9fa48("4718") ? user.cohort : (stryCov_9fa48("4718"), user?.cohort)) || (stryMutAct_9fa48("4719") ? "" : (stryCov_9fa48("4719"), 'Not specified')))}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="account__section">
          <h2 className="account__section-title">Personal Information</h2>
          <form onSubmit={handleSaveUserInfo} className="account__form">
            <div className="account__form-row">
              <div className="account__form-group">
                <label htmlFor="firstName" className="account__label">First Name</label>
                <input type="text" id="firstName" value={firstName} onChange={stryMutAct_9fa48("4720") ? () => undefined : (stryCov_9fa48("4720"), e => setFirstName(e.target.value))} className="account__input" placeholder="Enter your first name" />
              </div>
              <div className="account__form-group">
                <label htmlFor="lastName" className="account__label">Last Name</label>
                <input type="text" id="lastName" value={lastName} onChange={stryMutAct_9fa48("4721") ? () => undefined : (stryCov_9fa48("4721"), e => setLastName(e.target.value))} className="account__input" placeholder="Enter your last name" />
              </div>
            </div>

            <button type="submit" className="account__button account__button--primary" disabled={isSaving}>
              {isSaving ? stryMutAct_9fa48("4722") ? "" : (stryCov_9fa48("4722"), 'Saving...') : stryMutAct_9fa48("4723") ? "" : (stryCov_9fa48("4723"), 'Save Changes')}
            </button>
          </form>
        </div>

        {/* GitHub Integration Section */}
        <div className="account__section">
          <h2 className="account__section-title">GitHub Integration</h2>
          <div className="account__github">
            {githubConnected ? <div className="account__github-connected">
                <div className="account__github-info">
                  <div className="account__github-avatar">
                    {(stryMutAct_9fa48("4724") ? githubUser.avatar_url : (stryCov_9fa48("4724"), githubUser?.avatar_url)) ? <img src={githubUser.avatar_url} alt="GitHub Avatar" /> : <div className="account__github-avatar-placeholder">GH</div>}
                  </div>
                  <div className="account__github-details">
                    <h3>Connected to GitHub</h3>
                    <p>@{stryMutAct_9fa48("4727") ? githubUser?.username && 'username' : stryMutAct_9fa48("4726") ? false : stryMutAct_9fa48("4725") ? true : (stryCov_9fa48("4725", "4726", "4727"), (stryMutAct_9fa48("4728") ? githubUser.username : (stryCov_9fa48("4728"), githubUser?.username)) || (stryMutAct_9fa48("4729") ? "" : (stryCov_9fa48("4729"), 'username')))}</p>
                    <small>Your repositories are accessible for course projects</small>
                  </div>
                </div>
                <div className="account__github-actions">
                  <button onClick={handleViewRepos} className="account__button account__button--primary" disabled={isLoadingRepos}>
                    {isLoadingRepos ? stryMutAct_9fa48("4730") ? "" : (stryCov_9fa48("4730"), 'Loading...') : showRepos ? stryMutAct_9fa48("4731") ? "" : (stryCov_9fa48("4731"), 'Hide Repos') : stryMutAct_9fa48("4732") ? "" : (stryCov_9fa48("4732"), 'View Repos')}
                  </button>
                  <button onClick={handleDisconnectGitHub} className="account__button account__button--secondary">
                    Disconnect
                  </button>
                </div>
              </div> : <div className="account__github-disconnected">
                <div className="account__github-prompt">
                  <h3>Connect Your GitHub Account</h3>
                  <p>Connect your GitHub account to access your repositories for course projects and assignments.</p>
                  <ul className="account__github-benefits">
                    <li>Access to all your public and private repositories</li>
                    <li>Seamless project submission workflow</li>
                    <li>Enhanced learning experience with your actual code</li>
                  </ul>
                </div>
                <button onClick={handleConnectGitHub} className="account__button account__button--primary" disabled={isConnecting}>
                  {isConnecting ? stryMutAct_9fa48("4733") ? "" : (stryCov_9fa48("4733"), 'Connecting...') : stryMutAct_9fa48("4734") ? "" : (stryCov_9fa48("4734"), 'Connect GitHub')}
                </button>
              </div>}
          </div>

          {/* GitHub Repositories Section */}
          {stryMutAct_9fa48("4737") ? githubConnected && showRepos || <div className="account__repos-section">
              <h3 className="account__repos-title">Your GitHub Repositories ({githubRepos.length})</h3>
              {githubRepos.length > 0 ? <div className="account__repos-grid">
                  {githubRepos.map(repo => <div key={repo.id} className="account__repo-card">
                      <div className="account__repo-header">
                        <h4 className="account__repo-name">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                          </a>
                        </h4>
                        <div className="account__repo-badges">
                          {repo.private && <span className="account__repo-badge account__repo-badge--private">Private</span>}
                          {repo.language && <span className="account__repo-badge account__repo-badge--language">{repo.language}</span>}
                        </div>
                      </div>
                      {repo.description && <p className="account__repo-description">{repo.description}</p>}
                      <div className="account__repo-meta">
                        <span className="account__repo-date">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>)}
                </div> : <p className="account__repos-empty">No repositories found.</p>}
            </div> : stryMutAct_9fa48("4736") ? false : stryMutAct_9fa48("4735") ? true : (stryCov_9fa48("4735", "4736", "4737"), (stryMutAct_9fa48("4739") ? githubConnected || showRepos : stryMutAct_9fa48("4738") ? true : (stryCov_9fa48("4738", "4739"), githubConnected && showRepos)) && <div className="account__repos-section">
              <h3 className="account__repos-title">Your GitHub Repositories ({githubRepos.length})</h3>
              {(stryMutAct_9fa48("4743") ? githubRepos.length <= 0 : stryMutAct_9fa48("4742") ? githubRepos.length >= 0 : stryMutAct_9fa48("4741") ? false : stryMutAct_9fa48("4740") ? true : (stryCov_9fa48("4740", "4741", "4742", "4743"), githubRepos.length > 0)) ? <div className="account__repos-grid">
                  {githubRepos.map(stryMutAct_9fa48("4744") ? () => undefined : (stryCov_9fa48("4744"), repo => <div key={repo.id} className="account__repo-card">
                      <div className="account__repo-header">
                        <h4 className="account__repo-name">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                          </a>
                        </h4>
                        <div className="account__repo-badges">
                          {stryMutAct_9fa48("4747") ? repo.private || <span className="account__repo-badge account__repo-badge--private">Private</span> : stryMutAct_9fa48("4746") ? false : stryMutAct_9fa48("4745") ? true : (stryCov_9fa48("4745", "4746", "4747"), repo.private && <span className="account__repo-badge account__repo-badge--private">Private</span>)}
                          {stryMutAct_9fa48("4750") ? repo.language || <span className="account__repo-badge account__repo-badge--language">{repo.language}</span> : stryMutAct_9fa48("4749") ? false : stryMutAct_9fa48("4748") ? true : (stryCov_9fa48("4748", "4749", "4750"), repo.language && <span className="account__repo-badge account__repo-badge--language">{repo.language}</span>)}
                        </div>
                      </div>
                      {stryMutAct_9fa48("4753") ? repo.description || <p className="account__repo-description">{repo.description}</p> : stryMutAct_9fa48("4752") ? false : stryMutAct_9fa48("4751") ? true : (stryCov_9fa48("4751", "4752", "4753"), repo.description && <p className="account__repo-description">{repo.description}</p>)}
                      <div className="account__repo-meta">
                        <span className="account__repo-date">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>))}
                </div> : <p className="account__repos-empty">No repositories found.</p>}
            </div>)}
        </div>
      </div>
    </div>;
  }
}
export default Account;