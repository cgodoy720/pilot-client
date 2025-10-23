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
import React, { useState } from 'react';
import { FaTimes, FaClock, FaCheck, FaComments } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SummaryModal.css';
function SummaryModal({
  isOpen,
  onClose,
  summary,
  title,
  url,
  cached,
  loading,
  error,
  sourceInfo,
  contentType,
  isAnalysis = stryMutAct_9fa48("2618") ? true : (stryCov_9fa48("2618"), false)
}) {
  if (stryMutAct_9fa48("2619")) {
    {}
  } else {
    stryCov_9fa48("2619");
    const navigate = useNavigate();
    const location = useLocation();
    const {
      token,
      user
    } = useAuth();
    const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(stryMutAct_9fa48("2620") ? true : (stryCov_9fa48("2620"), false));
    if (stryMutAct_9fa48("2623") ? false : stryMutAct_9fa48("2622") ? true : stryMutAct_9fa48("2621") ? isOpen : (stryCov_9fa48("2621", "2622", "2623"), !isOpen)) return null;

    // Check if user has active status
    const isActive = stryMutAct_9fa48("2626") ? user?.active === false : stryMutAct_9fa48("2625") ? false : stryMutAct_9fa48("2624") ? true : (stryCov_9fa48("2624", "2625", "2626"), (stryMutAct_9fa48("2627") ? user.active : (stryCov_9fa48("2627"), user?.active)) !== (stryMutAct_9fa48("2628") ? true : (stryCov_9fa48("2628"), false)));

    // Check if we're currently on the GPT page
    const isOnGPTPage = stryMutAct_9fa48("2631") ? location.pathname !== '/gpt' : stryMutAct_9fa48("2630") ? false : stryMutAct_9fa48("2629") ? true : (stryCov_9fa48("2629", "2630", "2631"), location.pathname === (stryMutAct_9fa48("2632") ? "" : (stryCov_9fa48("2632"), '/gpt')));

    // Helper function to check if URL is a YouTube video
    const isYouTubeVideo = url => {
      if (stryMutAct_9fa48("2633")) {
        {}
      } else {
        stryCov_9fa48("2633");
        if (stryMutAct_9fa48("2636") ? false : stryMutAct_9fa48("2635") ? true : stryMutAct_9fa48("2634") ? url : (stryCov_9fa48("2634", "2635", "2636"), !url)) return stryMutAct_9fa48("2637") ? true : (stryCov_9fa48("2637"), false);
        return stryMutAct_9fa48("2640") ? (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/embed')) && url.includes('youtube.com/v/') : stryMutAct_9fa48("2639") ? false : stryMutAct_9fa48("2638") ? true : (stryCov_9fa48("2638", "2639", "2640"), (stryMutAct_9fa48("2642") ? (url.includes('youtube.com/watch') || url.includes('youtu.be/')) && url.includes('youtube.com/embed') : stryMutAct_9fa48("2641") ? false : (stryCov_9fa48("2641", "2642"), (stryMutAct_9fa48("2644") ? url.includes('youtube.com/watch') && url.includes('youtu.be/') : stryMutAct_9fa48("2643") ? false : (stryCov_9fa48("2643", "2644"), url.includes(stryMutAct_9fa48("2645") ? "" : (stryCov_9fa48("2645"), 'youtube.com/watch')) || url.includes(stryMutAct_9fa48("2646") ? "" : (stryCov_9fa48("2646"), 'youtu.be/')))) || url.includes(stryMutAct_9fa48("2647") ? "" : (stryCov_9fa48("2647"), 'youtube.com/embed')))) || url.includes(stryMutAct_9fa48("2648") ? "" : (stryCov_9fa48("2648"), 'youtube.com/v/')));
      }
    };
    const isVideo = isYouTubeVideo(url);

    // Handle creating a discussion thread
    const handleDiscussWithAI = async () => {
      if (stryMutAct_9fa48("2649")) {
        {}
      } else {
        stryCov_9fa48("2649");
        // Only allow discussion creation for summaries, not analysis
        if (stryMutAct_9fa48("2651") ? false : stryMutAct_9fa48("2650") ? true : (stryCov_9fa48("2650", "2651"), isAnalysis)) {
          if (stryMutAct_9fa48("2652")) {
            {}
          } else {
            stryCov_9fa48("2652");
            alert(stryMutAct_9fa48("2653") ? "" : (stryCov_9fa48("2653"), 'Discussion creation is only available for article/video summaries.'));
            return;
          }
        }
        if (stryMutAct_9fa48("2656") ? false : stryMutAct_9fa48("2655") ? true : stryMutAct_9fa48("2654") ? isActive : (stryCov_9fa48("2654", "2655", "2656"), !isActive)) {
          if (stryMutAct_9fa48("2657")) {
            {}
          } else {
            stryCov_9fa48("2657");
            alert(stryMutAct_9fa48("2658") ? "" : (stryCov_9fa48("2658"), 'You have historical access only and cannot create new discussions.'));
            return;
          }
        }
        if (stryMutAct_9fa48("2661") ? !url && !title : stryMutAct_9fa48("2660") ? false : stryMutAct_9fa48("2659") ? true : (stryCov_9fa48("2659", "2660", "2661"), (stryMutAct_9fa48("2662") ? url : (stryCov_9fa48("2662"), !url)) || (stryMutAct_9fa48("2663") ? title : (stryCov_9fa48("2663"), !title)))) {
          if (stryMutAct_9fa48("2664")) {
            {}
          } else {
            stryCov_9fa48("2664");
            alert(stryMutAct_9fa48("2665") ? "" : (stryCov_9fa48("2665"), 'Missing article information for discussion.'));
            return;
          }
        }
        setIsCreatingDiscussion(stryMutAct_9fa48("2666") ? false : (stryCov_9fa48("2666"), true));
        try {
          if (stryMutAct_9fa48("2667")) {
            {}
          } else {
            stryCov_9fa48("2667");
            const response = await fetch(stryMutAct_9fa48("2668") ? `` : (stryCov_9fa48("2668"), `${import.meta.env.VITE_API_URL}/api/chat/articles/discuss`), stryMutAct_9fa48("2669") ? {} : (stryCov_9fa48("2669"), {
              method: stryMutAct_9fa48("2670") ? "" : (stryCov_9fa48("2670"), 'POST'),
              headers: stryMutAct_9fa48("2671") ? {} : (stryCov_9fa48("2671"), {
                'Content-Type': stryMutAct_9fa48("2672") ? "" : (stryCov_9fa48("2672"), 'application/json'),
                'Authorization': stryMutAct_9fa48("2673") ? `` : (stryCov_9fa48("2673"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("2674") ? {} : (stryCov_9fa48("2674"), {
                url: url,
                title: title,
                summary: summary // Include the summary for better AI context
              }))
            }));
            if (stryMutAct_9fa48("2677") ? false : stryMutAct_9fa48("2676") ? true : stryMutAct_9fa48("2675") ? response.ok : (stryCov_9fa48("2675", "2676", "2677"), !response.ok)) {
              if (stryMutAct_9fa48("2678")) {
                {}
              } else {
                stryCov_9fa48("2678");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("2681") ? (errorData.details || errorData.error) && 'Failed to create discussion' : stryMutAct_9fa48("2680") ? false : stryMutAct_9fa48("2679") ? true : (stryCov_9fa48("2679", "2680", "2681"), (stryMutAct_9fa48("2683") ? errorData.details && errorData.error : stryMutAct_9fa48("2682") ? false : (stryCov_9fa48("2682", "2683"), errorData.details || errorData.error)) || (stryMutAct_9fa48("2684") ? "" : (stryCov_9fa48("2684"), 'Failed to create discussion'))));
              }
            }
            const data = await response.json();

            // Close the modal
            onClose();

            // Prepare summary data to pass to GPT page
            const summaryDataForUrl = stryMutAct_9fa48("2685") ? {} : (stryCov_9fa48("2685"), {
              summary: summary,
              cached: cached
            });

            // Navigate to GPT page with the new thread and summary data
            const params = new URLSearchParams(stryMutAct_9fa48("2686") ? {} : (stryCov_9fa48("2686"), {
              threadId: data.threadId,
              summaryUrl: url,
              summaryTitle: title,
              summaryData: encodeURIComponent(JSON.stringify(summaryDataForUrl))
            }));
            navigate(stryMutAct_9fa48("2687") ? `` : (stryCov_9fa48("2687"), `/gpt?${params.toString()}`));
          }
        } catch (error) {
          if (stryMutAct_9fa48("2688")) {
            {}
          } else {
            stryCov_9fa48("2688");
            console.error(stryMutAct_9fa48("2689") ? "" : (stryCov_9fa48("2689"), 'Error creating article discussion:'), error);
            alert(stryMutAct_9fa48("2690") ? `` : (stryCov_9fa48("2690"), `Failed to create discussion: ${error.message}`));
          }
        } finally {
          if (stryMutAct_9fa48("2691")) {
            {}
          } else {
            stryCov_9fa48("2691");
            setIsCreatingDiscussion(stryMutAct_9fa48("2692") ? true : (stryCov_9fa48("2692"), false));
          }
        }
      }
    };
    const handleOverlayClick = e => {
      if (stryMutAct_9fa48("2693")) {
        {}
      } else {
        stryCov_9fa48("2693");
        if (stryMutAct_9fa48("2696") ? e.target !== e.currentTarget : stryMutAct_9fa48("2695") ? false : stryMutAct_9fa48("2694") ? true : (stryCov_9fa48("2694", "2695", "2696"), e.target === e.currentTarget)) {
          if (stryMutAct_9fa48("2697")) {
            {}
          } else {
            stryCov_9fa48("2697");
            onClose();
          }
        }
      }
    };
    return <div className={stryMutAct_9fa48("2698") ? `` : (stryCov_9fa48("2698"), `summary-modal__overlay ${isOpen ? stryMutAct_9fa48("2699") ? "" : (stryCov_9fa48("2699"), 'open') : stryMutAct_9fa48("2700") ? "Stryker was here!" : (stryCov_9fa48("2700"), '')}`)} onClick={handleOverlayClick}>
      <div className="summary-modal__container">
        <div className="summary-modal__header">
          <div className="summary-modal__title-section">
            <h3 className="summary-modal__title">
              {isAnalysis ? stryMutAct_9fa48("2701") ? "" : (stryCov_9fa48("2701"), 'Content Analysis') : isVideo ? stryMutAct_9fa48("2702") ? "" : (stryCov_9fa48("2702"), 'Video Summary') : stryMutAct_9fa48("2703") ? "" : (stryCov_9fa48("2703"), 'Article Summary')}
            </h3>
            {stryMutAct_9fa48("2706") ? cached && !isAnalysis || <span className="summary-modal__cached-badge">
                <FaCheck /> Cached
              </span> : stryMutAct_9fa48("2705") ? false : stryMutAct_9fa48("2704") ? true : (stryCov_9fa48("2704", "2705", "2706"), (stryMutAct_9fa48("2708") ? cached || !isAnalysis : stryMutAct_9fa48("2707") ? true : (stryCov_9fa48("2707", "2708"), cached && (stryMutAct_9fa48("2709") ? isAnalysis : (stryCov_9fa48("2709"), !isAnalysis)))) && <span className="summary-modal__cached-badge">
                <FaCheck /> Cached
              </span>)}
          </div>
          <button className={stryMutAct_9fa48("2710") ? `` : (stryCov_9fa48("2710"), `summary-modal__close-btn ${error ? stryMutAct_9fa48("2711") ? "" : (stryCov_9fa48("2711"), 'summary-modal__close-btn--error') : stryMutAct_9fa48("2712") ? "Stryker was here!" : (stryCov_9fa48("2712"), '')}`)} onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        
        <div className="summary-modal__body">
          {loading ? <div className="summary-modal__loading">
              <div className="summary-modal__loading-spinner"></div>
              <p>Generating summary...</p>
              <small>This may take a few moments while we analyze the {isVideo ? stryMutAct_9fa48("2713") ? "" : (stryCov_9fa48("2713"), 'video transcript') : stryMutAct_9fa48("2714") ? "" : (stryCov_9fa48("2714"), 'article')}.</small>
            </div> : error ? <div className="summary-modal__error">
              <h4>Summary Not Available</h4>
              <p>{error}</p>
              <small>
                {(stryMutAct_9fa48("2717") ? error.includes('paywall') && error.includes('subscription') : stryMutAct_9fa48("2716") ? false : stryMutAct_9fa48("2715") ? true : (stryCov_9fa48("2715", "2716", "2717"), error.includes(stryMutAct_9fa48("2718") ? "" : (stryCov_9fa48("2718"), 'paywall')) || error.includes(stryMutAct_9fa48("2719") ? "" : (stryCov_9fa48("2719"), 'subscription')))) ? <>
                    Try these alternatives:
                    <br />• Look for a free version of the article or similar content
                    <br />• Copy the article text and discuss it directly in the AI chat
                    <br />• Search for open-access articles on the same topic
                  </> : isVideo ? stryMutAct_9fa48("2720") ? "" : (stryCov_9fa48("2720"), 'This might happen if the video does not have captions/transcripts enabled, or if the video is private/restricted.') : stryMutAct_9fa48("2721") ? "" : (stryCov_9fa48("2721"), 'This might happen if the article is behind a paywall, requires authentication, or is not accessible.')}
              </small>
              <div className="summary-modal__error-actions">
                <button className="summary-modal__error-close-btn" onClick={onClose}>
                  Got it, close
                </button>
              </div>
            </div> : summary ? <>
              <div className="summary-modal__article-info">
                <h4 className="summary-modal__article-title">{title}</h4>
                {stryMutAct_9fa48("2724") ? sourceInfo && isAnalysis || <p className="summary-modal__source-info">{sourceInfo}</p> : stryMutAct_9fa48("2723") ? false : stryMutAct_9fa48("2722") ? true : (stryCov_9fa48("2722", "2723", "2724"), (stryMutAct_9fa48("2726") ? sourceInfo || isAnalysis : stryMutAct_9fa48("2725") ? true : (stryCov_9fa48("2725", "2726"), sourceInfo && isAnalysis)) && <p className="summary-modal__source-info">{sourceInfo}</p>)}
                <div className="summary-modal__article-actions">
                  {stryMutAct_9fa48("2729") ? url || <a href={url} target="_blank" rel="noopener noreferrer" className="summary-modal__article-link">
                      {isVideo ? 'Watch full video →' : 'View original content →'}
                    </a> : stryMutAct_9fa48("2728") ? false : stryMutAct_9fa48("2727") ? true : (stryCov_9fa48("2727", "2728", "2729"), url && <a href={url} target="_blank" rel="noopener noreferrer" className="summary-modal__article-link">
                      {isVideo ? stryMutAct_9fa48("2730") ? "" : (stryCov_9fa48("2730"), 'Watch full video →') : stryMutAct_9fa48("2731") ? "" : (stryCov_9fa48("2731"), 'View original content →')}
                    </a>)}
                  {/* Only show Discuss with AI button for summaries and if we're NOT on the GPT page */}
                  {stryMutAct_9fa48("2734") ? !isAnalysis && !isOnGPTPage || <button onClick={handleDiscussWithAI} disabled={isCreatingDiscussion || !isActive} className="summary-modal__discuss-btn" title={!isActive ? "Historical access only - cannot create discussions" : "Start an AI discussion about this content"}>
                      <FaComments />
                      {isCreatingDiscussion ? 'Creating Discussion...' : 'Discuss with AI'}
                    </button> : stryMutAct_9fa48("2733") ? false : stryMutAct_9fa48("2732") ? true : (stryCov_9fa48("2732", "2733", "2734"), (stryMutAct_9fa48("2736") ? !isAnalysis || !isOnGPTPage : stryMutAct_9fa48("2735") ? true : (stryCov_9fa48("2735", "2736"), (stryMutAct_9fa48("2737") ? isAnalysis : (stryCov_9fa48("2737"), !isAnalysis)) && (stryMutAct_9fa48("2738") ? isOnGPTPage : (stryCov_9fa48("2738"), !isOnGPTPage)))) && <button onClick={handleDiscussWithAI} disabled={stryMutAct_9fa48("2741") ? isCreatingDiscussion && !isActive : stryMutAct_9fa48("2740") ? false : stryMutAct_9fa48("2739") ? true : (stryCov_9fa48("2739", "2740", "2741"), isCreatingDiscussion || (stryMutAct_9fa48("2742") ? isActive : (stryCov_9fa48("2742"), !isActive)))} className="summary-modal__discuss-btn" title={(stryMutAct_9fa48("2743") ? isActive : (stryCov_9fa48("2743"), !isActive)) ? stryMutAct_9fa48("2744") ? "" : (stryCov_9fa48("2744"), "Historical access only - cannot create discussions") : stryMutAct_9fa48("2745") ? "" : (stryCov_9fa48("2745"), "Start an AI discussion about this content")}>
                      <FaComments />
                      {isCreatingDiscussion ? stryMutAct_9fa48("2746") ? "" : (stryCov_9fa48("2746"), 'Creating Discussion...') : stryMutAct_9fa48("2747") ? "" : (stryCov_9fa48("2747"), 'Discuss with AI')}
                    </button>)}
                </div>
              </div>
              
              <div className="summary-modal__content">
                <ReactMarkdown components={stryMutAct_9fa48("2748") ? {} : (stryCov_9fa48("2748"), {
                h1: stryMutAct_9fa48("2749") ? () => undefined : (stryCov_9fa48("2749"), ({
                  node,
                  children,
                  ...props
                }) => <h2 className="summary-modal__heading" {...props}>{children}</h2>),
                h2: stryMutAct_9fa48("2750") ? () => undefined : (stryCov_9fa48("2750"), ({
                  node,
                  children,
                  ...props
                }) => <h3 className="summary-modal__heading" {...props}>{children}</h3>),
                h3: stryMutAct_9fa48("2751") ? () => undefined : (stryCov_9fa48("2751"), ({
                  node,
                  children,
                  ...props
                }) => <h4 className="summary-modal__heading" {...props}>{children}</h4>),
                p: stryMutAct_9fa48("2752") ? () => undefined : (stryCov_9fa48("2752"), ({
                  node,
                  children,
                  ...props
                }) => <p className="summary-modal__paragraph" {...props}>{children}</p>),
                ul: stryMutAct_9fa48("2753") ? () => undefined : (stryCov_9fa48("2753"), ({
                  node,
                  children,
                  ...props
                }) => <ul className="summary-modal__list" {...props}>{children}</ul>),
                ol: stryMutAct_9fa48("2754") ? () => undefined : (stryCov_9fa48("2754"), ({
                  node,
                  children,
                  ...props
                }) => <ol className="summary-modal__list" {...props}>{children}</ol>),
                li: ({
                  node,
                  children,
                  ...props
                }) => {
                  if (stryMutAct_9fa48("2755")) {
                    {}
                  } else {
                    stryCov_9fa48("2755");
                    // Check if this list item only contains bold text (section title)
                    const isOnlyBold = stryMutAct_9fa48("2758") ? node.children && node.children.length === 1 || node.children[0].tagName === 'strong' : stryMutAct_9fa48("2757") ? false : stryMutAct_9fa48("2756") ? true : (stryCov_9fa48("2756", "2757", "2758"), (stryMutAct_9fa48("2760") ? node.children || node.children.length === 1 : stryMutAct_9fa48("2759") ? true : (stryCov_9fa48("2759", "2760"), node.children && (stryMutAct_9fa48("2762") ? node.children.length !== 1 : stryMutAct_9fa48("2761") ? true : (stryCov_9fa48("2761", "2762"), node.children.length === 1)))) && (stryMutAct_9fa48("2764") ? node.children[0].tagName !== 'strong' : stryMutAct_9fa48("2763") ? true : (stryCov_9fa48("2763", "2764"), node.children[0].tagName === (stryMutAct_9fa48("2765") ? "" : (stryCov_9fa48("2765"), 'strong')))));
                    return <li className={stryMutAct_9fa48("2766") ? `` : (stryCov_9fa48("2766"), `summary-modal__list-item ${isOnlyBold ? stryMutAct_9fa48("2767") ? "" : (stryCov_9fa48("2767"), 'summary-modal__list-item--section-title') : stryMutAct_9fa48("2768") ? "Stryker was here!" : (stryCov_9fa48("2768"), '')}`)} {...props}>
                          {children}
                        </li>;
                  }
                },
                strong: stryMutAct_9fa48("2769") ? () => undefined : (stryCov_9fa48("2769"), ({
                  node,
                  children,
                  ...props
                }) => <strong className="summary-modal__bold" {...props}>{children}</strong>),
                em: stryMutAct_9fa48("2770") ? () => undefined : (stryCov_9fa48("2770"), ({
                  node,
                  children,
                  ...props
                }) => <em className="summary-modal__italic" {...props}>{children}</em>),
                code: stryMutAct_9fa48("2771") ? () => undefined : (stryCov_9fa48("2771"), ({
                  node,
                  inline,
                  children,
                  ...props
                }) => inline ? <code className="summary-modal__inline-code" {...props}>{children}</code> : <code className="summary-modal__code-block" {...props}>{children}</code>)
              })}>
                  {summary}
                </ReactMarkdown>
              </div>
            </> : null}
        </div>
        
        <div className="summary-modal__footer">
          <small className="summary-modal__disclaimer">
            {isAnalysis ? stryMutAct_9fa48("2772") ? "" : (stryCov_9fa48("2772"), 'Analysis generated by AI. Use this feedback as guidance for improving your content.') : stryMutAct_9fa48("2773") ? `` : (stryCov_9fa48("2773"), `Summary generated by AI. Please verify important details in the original ${isVideo ? stryMutAct_9fa48("2774") ? "" : (stryCov_9fa48("2774"), 'video') : stryMutAct_9fa48("2775") ? "" : (stryCov_9fa48("2775"), 'article')}.`)}
          </small>
        </div>
      </div>
    </div>;
  }
}
export default SummaryModal;