import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Payment.css';

const Payment = () => {
  const { token } = useAuth();
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isGjaModalOpen, setIsGjaModalOpen] = useState(false);
  const [gjaText, setGjaText] = useState('');
  const [isGjaLoading, setIsGjaLoading] = useState(false);
  const [gjaError, setGjaError] = useState('');

  // Bill.com Guide modal states
  const [isBillComModalOpen, setIsBillComModalOpen] = useState(false);
  const [billComText, setBillComText] = useState('');
  const [isBillComLoading, setIsBillComLoading] = useState(false);
  const [billComError, setBillComError] = useState('');

  // FAQs modal states
  const [isFaqsModalOpen, setIsFaqsModalOpen] = useState(false);
  const [faqsText, setFaqsText] = useState('');
  const [isFaqsLoading, setIsFaqsLoading] = useState(false);
  const [faqsError, setFaqsError] = useState('');

  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState({
    goodJobAgreement: null,
    billComGuide: null,
    bondFaqs: null,
    employmentContract: null
  });

  // Employment information states
  const [employmentInfo, setEmploymentInfo] = useState({
    companyName: '',
    position: '',
    startDate: '',
    salary: '',
    employmentType: 'full-time'
  });

  // Bond Invoice Calculator states
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Calculated values
  const annualizedIncome = monthlyIncome ? parseFloat(monthlyIncome) * 12 : 0;
  const paymentPercentage = monthlyIncome && parseFloat(monthlyIncome) >= 7083 ? 15 : 0;
  const monthlyPayment = monthlyIncome && parseFloat(monthlyIncome) >= 7083 ? parseFloat(monthlyIncome) * 0.15 : 0;

  // File input refs
  const goodJobAgreementRef = useRef(null);
  const employmentContractRef = useRef(null);

  // Load existing data on component mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setIsLoading(true);
      
      // Load documents
      const documentsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setUploadedFiles(documentsData.documents || {});
      }

      // Load employment info
      const employmentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/employment-info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (employmentResponse.ok) {
        const employmentData = await employmentResponse.json();
        if (employmentData.employmentInfo) {
          setEmploymentInfo(employmentData.employmentInfo);
        }
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload only PDF, DOC, DOCX, or TXT files.');
      return;
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      setError('File size too large. Please upload files smaller than 10MB.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const result = await response.json();
      
      // Update the uploaded files state
      setUploadedFiles(prev => ({
        ...prev,
        [type]: {
          name: file.name,
          url: result.url,
          uploadedAt: result.document.uploaded_at
        }
      }));

      setMessage('Document uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setError(error.message || 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const openFileDialog = (type) => {
    if (type === 'goodJobAgreement') {
      goodJobAgreementRef?.current?.click();
    } else if (type === 'employmentContract') {
      employmentContractRef?.current?.click();
    }
  };

  const openSchedulingLink = () => {
    // Open scheduling link for financial planning sessions
    window.open('https://calendly.com/kirstie-pursuit/30minmeeting?month=2025-01', '_blank');
  };

  const openGjaModal = async () => {
    try {
      setIsGjaLoading(true);
      setGjaError('');
      setIsGjaModalOpen(true);
      const toAbsolute = (p) => {
        if (!p) return '';
        return p.startsWith('http') ? p : `${import.meta.env.VITE_API_URL}${p}`;
      };
      const url = toAbsolute(uploadedFiles?.goodJobAgreement?.url || '/uploads/payment-documents/Good_Job_Agreement.pdf');
      
      // Check file type
      const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      const isPdf = url.toLowerCase().match(/\.pdf$/);
      
      if (isImage) {
        // For images, just set the URL directly
        setGjaText(url);
      } else if (isPdf) {
        // For PDFs, set the URL for embedding
        setGjaText(url);
      } else {
        // For text files, fetch the content
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load Good Job Agreement');
        }
        const text = await response.text();
        setGjaText(text);
      }
    } catch (e) {
      setGjaError(e.message || 'Unable to load Good Job Agreement');
    } finally {
      setIsGjaLoading(false);
    }
  };

  const openBillComModal = async () => {
    try {
      setIsBillComLoading(true);
      setBillComError('');
      setIsBillComModalOpen(true);
      const toAbsolute = (p) => {
        if (!p) return '';
        return p.startsWith('http') ? p : `${import.meta.env.VITE_API_URL}${p}`;
      };
      const url = toAbsolute('/uploads/payment-documents/Bill.Com Set Up Instructions.pdf');
      
      // Check file type
      const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      const isPdf = url.toLowerCase().match(/\.pdf$/);
      
      if (isImage) {
        setBillComText(url);
      } else if (isPdf) {
        setBillComText(url);
      } else {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load Bill.com Guide');
        }
        const text = await response.text();
        setBillComText(text);
      }
    } catch (e) {
      setBillComError(e.message || 'Unable to load Bill.com Guide');
    } finally {
      setIsBillComLoading(false);
    }
  };

  const openFaqsModal = async () => {
    try {
      setIsFaqsLoading(true);
      setFaqsError('');
      setIsFaqsModalOpen(true);
      const toAbsolute = (p) => {
        if (!p) return '';
        return p.startsWith('http') ? p : `${import.meta.env.VITE_API_URL}${p}`;
      };
      const url = toAbsolute('/uploads/payment-documents/Good Job Agreement FAQs.pdf');
      
      // Check file type
      const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      const isPdf = url.toLowerCase().match(/\.pdf$/);
      
      if (isImage) {
        setFaqsText(url);
      } else if (isPdf) {
        setFaqsText(url);
      } else {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load FAQs');
        }
        const text = await response.text();
        setFaqsText(text);
      }
    } catch (e) {
      setFaqsError(e.message || 'Unable to load FAQs');
    } finally {
      setIsFaqsLoading(false);
    }
  };

  const handleEmploymentUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/employment-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employmentInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to update employment information');
      }

      setMessage('Employment information updated successfully!');
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setError(error.message || 'Failed to update employment information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment">
      <div className="payment__container">
        <div className="payment__header">
          <h1 className="payment__title">Good Job Agreement</h1>
          <p className="payment__subtitle">Manage your payment and employment information.</p>
        </div>

        {message && <div className="payment__message payment__message--success">{message}</div>}
        {error && <div className="payment__message payment__message--error">{error}</div>}

        {/* Documents Section */}
        <div className="payment__section">
          <h2 className="payment__section-title">Documents</h2>
          <div className="payment__documents-grid">
            {/* Good Job Agreement */}
            <div className="payment__document-card">
              <div className="payment__document-header">
                <h3 className="payment__document-title">Good Job Agreement</h3>
              </div>
              <div className="payment__document-actions">
                <button
                  onClick={openGjaModal}
                  className="payment__button payment__button--primary"
                >
                  View Good Job Agreement
                </button>
              </div>
            </div>

            {/* Good Job Agreement FAQs */}
            <div className="payment__document-card">
              <div className="payment__document-header">
                <h3 className="payment__document-title">Good Job Agreement FAQs</h3>
              </div>
              <div className="payment__document-actions">
                <button
                  onClick={openFaqsModal}
                  className="payment__button payment__button--primary"
                >
                  View FAQs
                </button>
              </div>
            </div>

            {/* Bill.com Guide */}
            <div className="payment__document-card">
              <div className="payment__document-header">
                <h3 className="payment__document-title">Bill.com Guide</h3>
              </div>
              <div className="payment__document-actions">
                <button
                  onClick={openBillComModal}
                  className="payment__button payment__button--primary"
                >
                  View Bill.com Guide
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Financial Planning Section */}
        <div className="payment__section">
          <h2 className="payment__section-title">Personal Financial Planning</h2>
          <div className="payment__scheduling-card">
            <div className="payment__scheduling-content">
              <p>Take control of your finances</p>
              <p>Whether you're looking to budget smarter, manage debt, or start saving for what's next, the Pursuit team is here to help you plan for financial stability.</p>
            </div>
            <div className="payment__scheduling-button-container">
              <button
                onClick={openSchedulingLink}
                className="payment__button payment__button--primary"
              >
                Schedule session
              </button>
            </div>
          </div>
        </div>

        {/* Bond Invoice Calculator Section */}
        <div className="payment__section">
          <h2 className="payment__section-title">Bond Invoice Calculator</h2>
          <div className="payment__calculator-card">
            <div className="payment__calculator-content">
              <div className="payment__calculator-input">
                <label htmlFor="monthlyIncome" className="payment__label">Monthly Income</label>
                <input
                  type="number"
                  id="monthlyIncome"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="payment__input"
                  placeholder="Enter monthly income"
                />
              </div>
              
              <div className="payment__calculator-results">
                <div className="payment__result-item">
                  <span className="payment__result-label">Annualized Income:</span>
                  <span className="payment__result-value">${annualizedIncome.toLocaleString()}</span>
                </div>
                <div className="payment__result-item">
                  <span className="payment__result-label">Percentage Owed:</span>
                  <span className="payment__result-value">{paymentPercentage}%</span>
                </div>
                <div className="payment__result-item">
                  <span className="payment__result-label">Monthly Payment:</span>
                  <span className="payment__result-value">${monthlyPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="payment__calculator-info">
              <div className="payment__info-section">
                <h5>Payment Percentage</h5>
                <div className="payment__info-content">
                  <p>If your income in one calendar month is <strong>less than $7,083</strong>, representing an annualized income of <strong>less than $85,000</strong>, then you owe <strong>0%</strong>.</p>
                  <p>If your income is <strong>equal to or greater than $7,083</strong>, representing an annualized income of <strong>equal to or greater than $85,000</strong>, then your income percentage owed is <strong>15%</strong>.</p>
                </div>
              </div>

              <div className="payment__info-section">
                <h5>When Payments End</h5>
                <p className="payment__info-intro">Once the first of these events occurs, you will no longer owe any more payments:</p>
                
                <div className="payment__conditions-table">
                  <div className="payment__conditions-header">
                    <div className="payment__conditions-cell">Payment Term</div>
                    <div className="payment__conditions-or-cell">OR</div>
                    <div className="payment__conditions-cell">Payment Cap</div>
                    <div className="payment__conditions-or-cell">OR</div>
                    <div className="payment__conditions-cell">Payment Period</div>
                  </div>
                  <div className="payment__conditions-row">
                    <div className="payment__conditions-cell">36 Payments</div>
                    <div className="payment__conditions-cell">$55,000</div>
                    <div className="payment__conditions-cell">5 Years</div>
                  </div>
                  <div className="payment__conditions-explanations-row">
                    <div className="payment__conditions-cell">Payments end after you have made this many monthly payments,</div>
                    <div className="payment__conditions-cell">Payments end when you have paid this amount in total,</div>
                    <div className="payment__conditions-cell">Payments end this many years after the Program Launch Date even if you've made no payments.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information Section */}
        <div className="payment__section">
          <h2 className="payment__section-title">Employment Information</h2>
          <p className="payment__message">Keep your employment information up to date for invoice processing.</p>
          
          <form onSubmit={handleEmploymentUpdate} className="payment__form">
            <div className="payment__form-grid">
              <div className="payment__form-group">
                <label htmlFor="companyName" className="payment__label">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  value={employmentInfo.companyName}
                  onChange={(e) => setEmploymentInfo(prev => ({ ...prev, companyName: e.target.value }))}
                  className="payment__input"
                  placeholder="Enter company name"
                />
              </div>

              <div className="payment__form-group">
                <label htmlFor="position" className="payment__label">Role</label>
                <input
                  type="text"
                  id="position"
                  value={employmentInfo.position}
                  onChange={(e) => setEmploymentInfo(prev => ({ ...prev, position: e.target.value }))}
                  className="payment__input"
                  placeholder="Enter your position"
                />
              </div>

              <div className="payment__form-group">
                <label htmlFor="startDate" className="payment__label">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={employmentInfo.startDate}
                  onChange={(e) => setEmploymentInfo(prev => ({ ...prev, startDate: e.target.value }))}
                  className="payment__input"
                />
              </div>

              <div className="payment__form-group">
                <label htmlFor="employmentContract" className="payment__label">Employment Contract</label>
                <div className="payment__file-upload">
                  <input
                    type="file"
                    id="employmentContract"
                    ref={employmentContractRef}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleFileUpload(file, 'employmentContract');
                      }
                    }}
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => openFileDialog('employmentContract')}
                    className="payment__button payment__button--secondary"
                  >
                    {uploadedFiles.employmentContract ? 'Replace Contract' : 'Upload Contract'}
                  </button>
                  {uploadedFiles.employmentContract && (
                    <div className="payment__file-info">
                      <span className="payment__file-name">✓ {uploadedFiles.employmentContract.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="payment__form-group">
                <label htmlFor="salary" className="payment__label">Salary (Annual)</label>
                <input
                  type="number"
                  id="salary"
                  value={employmentInfo.salary}
                  onChange={(e) => setEmploymentInfo(prev => ({ ...prev, salary: e.target.value }))}
                  className="payment__input"
                  placeholder="Enter annual salary"
                />
              </div>

              <div className="payment__form-group">
                <label htmlFor="employmentType" className="payment__label">Employment Type</label>
                <select
                  id="employmentType"
                  value={employmentInfo.employmentType}
                  onChange={(e) => setEmploymentInfo(prev => ({ ...prev, employmentType: e.target.value }))}
                  className="payment__input"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>
            </div>

            <div className="payment__form-submit">
              <button
                type="submit"
                disabled={isLoading}
                className="payment__button payment__button--primary"
              >
                {isLoading ? 'Updating...' : 'Update Employment Information'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Good Job Agreement Modal */}
      {isGjaModalOpen && (
        <div className="payment__modal-overlay" onClick={() => setIsGjaModalOpen(false)}>
          <div className="payment__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="payment__modal-header">
              <h3>Good Job Agreement</h3>
              <button
                className="payment__modal-close"
                onClick={() => setIsGjaModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="payment__modal-body">
              {isGjaLoading ? (
                <div className="payment__modal-loading">Loading...</div>
              ) : gjaError ? (
                <div className="payment__modal-error">{gjaError}</div>
              ) : (
                <>
                  {gjaText && gjaText.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                    <div className="payment__modal-image-container">
                      <img src={gjaText} alt="Good Job Agreement" className="payment__modal-image" />
                    </div>
                  ) : gjaText && gjaText.match(/\.pdf$/i) ? (
                    <div className="payment__modal-pdf-container">
                      <iframe src={gjaText} className="payment__modal-pdf" title="Good Job Agreement" />
                    </div>
                  ) : (
                    <pre className="payment__modal-text">{gjaText}</pre>
                  )}
                </>
              )}
            </div>
            <div className="payment__modal-footer">
              <a
                href={(() => {
                  const url = uploadedFiles?.goodJobAgreement?.url || '/uploads/payment-documents/Good_Job_Agreement.pdf';
                  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="payment__button payment__button--secondary"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bill.com Guide Modal */}
      {isBillComModalOpen && (
        <div className="payment__modal-overlay" onClick={() => setIsBillComModalOpen(false)}>
          <div className="payment__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="payment__modal-header">
              <h3>Bill.com Guide</h3>
              <button
                className="payment__modal-close"
                onClick={() => setIsBillComModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="payment__modal-body">
              {isBillComLoading ? (
                <div className="payment__modal-loading">Loading...</div>
              ) : billComError ? (
                <div className="payment__modal-error">{billComError}</div>
              ) : (
                <>
                  {billComText && billComText.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                    <div className="payment__modal-image-container">
                      <img src={billComText} alt="Bill.com Guide" className="payment__modal-image" />
                    </div>
                  ) : billComText && billComText.match(/\.pdf$/i) ? (
                    <div className="payment__modal-pdf-container">
                      <iframe src={billComText} className="payment__modal-pdf" title="Bill.com Guide" />
                    </div>
                  ) : (
                    <pre className="payment__modal-text">{billComText}</pre>
                  )}
                </>
              )}
            </div>
            <div className="payment__modal-footer">
              <a
                href={`${import.meta.env.VITE_API_URL}/uploads/payment-documents/Bill.Com%20Set%20Up%20Instructions.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="payment__button payment__button--secondary"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FAQs Modal */}
      {isFaqsModalOpen && (
        <div className="payment__modal-overlay" onClick={() => setIsFaqsModalOpen(false)}>
          <div className="payment__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="payment__modal-header">
              <h3>Good Job Agreement FAQs</h3>
              <button
                className="payment__modal-close"
                onClick={() => setIsFaqsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="payment__modal-body">
              {isFaqsLoading ? (
                <div className="payment__modal-loading">Loading...</div>
              ) : faqsError ? (
                <div className="payment__modal-error">{faqsError}</div>
              ) : (
                <>
                  {faqsText && faqsText.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                    <div className="payment__modal-image-container">
                      <img src={faqsText} alt="Good Job Agreement FAQs" className="payment__modal-image" />
                    </div>
                  ) : faqsText && faqsText.match(/\.pdf$/i) ? (
                    <div className="payment__modal-pdf-container">
                      <iframe src={faqsText} className="payment__modal-pdf" title="Good Job Agreement FAQs" />
                    </div>
                  ) : (
                    <pre className="payment__modal-text">{faqsText}</pre>
                  )}
                </>
              )}
            </div>
            <div className="payment__modal-footer">
              <a
                href={`${import.meta.env.VITE_API_URL}/uploads/payment-documents/Good%20Job%20Agreement%20FAQs.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="payment__button payment__button--secondary"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;

