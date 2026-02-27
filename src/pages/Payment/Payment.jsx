import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getContractVersion, calculateTieredPercentage } from '../../utils/contractVersions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, FileText, Calculator, Calendar, Upload } from 'lucide-react';

const Payment = () => {
  const { token } = useAuth();
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isGjaModalOpen, setIsGjaModalOpen] = useState(false);
  const [gjaText, setGjaText] = useState('');
  const [gjaFileType, setGjaFileType] = useState(''); // 'pdf', 'image', 'text'
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

  // Employment Contract modal states
  const [isEmploymentContractModalOpen, setIsEmploymentContractModalOpen] = useState(false);
  const [employmentContractText, setEmploymentContractText] = useState('');
  const [employmentContractFileType, setEmploymentContractFileType] = useState('');
  const [isEmploymentContractLoading, setIsEmploymentContractLoading] = useState(false);
  const [employmentContractError, setEmploymentContractError] = useState('');

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

  // Invoice Calculator states
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Get user's contract version from uploaded Good Job Agreement
  const contractVersion = uploadedFiles.goodJobAgreement?.contractVersion || null;
  const versionConfig = getContractVersion(contractVersion);

  // Calculated values based on contract version
  const annualizedIncome = monthlyIncome ? parseFloat(monthlyIncome) * 12 : 0;
  
  // Calculate income share percentage (handles tiered and flat rates)
  let incomeSharePercentage = 0;
  if (monthlyIncome && versionConfig) {
    if (versionConfig.isTiered) {
      incomeSharePercentage = calculateTieredPercentage(versionConfig, annualizedIncome);
    } else {
      // Check threshold for flat rate contracts
      const threshold = versionConfig.monthlyThreshold || versionConfig.annualThreshold / 12;
      if (parseFloat(monthlyIncome) >= threshold) {
        incomeSharePercentage = versionConfig.incomeSharePercentage || 0;
      }
    }
  }
  
  const monthlyPayment = monthlyIncome && incomeSharePercentage > 0 
    ? parseFloat(monthlyIncome) * (incomeSharePercentage / 100) 
    : 0;

  // File input refs
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
    if (type === 'employmentContract') {
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
      
      // Check file type based on filename, not URL
      const fileName = uploadedFiles?.goodJobAgreement?.name || 'Good_Job_Agreement.pdf';
      const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      const isPdf = fileName.toLowerCase().match(/\.pdf$/);
      
      if (isImage) {
        // For images, just set the URL directly
        setGjaFileType('image');
        setGjaText(url);
      } else if (isPdf) {
        // For PDFs, set the URL for embedding
        setGjaFileType('pdf');
        setGjaText(url);
      } else {
        // For text files, fetch the content
        setGjaFileType('text');
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

  const openEmploymentContractModal = async () => {
    if (!uploadedFiles.employmentContract) return;
    
    try {
      setIsEmploymentContractLoading(true);
      setEmploymentContractError('');
      setIsEmploymentContractModalOpen(true);
      const toAbsolute = (p) => {
        if (!p) return '';
        return p.startsWith('http') ? p : `${import.meta.env.VITE_API_URL}${p}`;
      };
      const url = toAbsolute(uploadedFiles.employmentContract.url);
      
      // Check file type based on filename, not URL
      const fileName = uploadedFiles.employmentContract.name;
      const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      const isPdf = fileName.toLowerCase().match(/\.pdf$/);
      const isDoc = fileName.toLowerCase().match(/\.(doc|docx)$/);
      
      if (isImage) {
        setEmploymentContractFileType('image');
        setEmploymentContractText(url);
      } else if (isPdf) {
        setEmploymentContractFileType('pdf');
        setEmploymentContractText(url);
      } else if (isDoc) {
        setEmploymentContractFileType('unsupported');
        setEmploymentContractError('Preview not available for Word documents. Please use "Open in new tab" to download.');
      } else {
        setEmploymentContractFileType('text');
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load Employment Contract');
        }
        const text = await response.text();
        setEmploymentContractText(text);
      }
    } catch (e) {
      setEmploymentContractError(e.message || 'Unable to load Employment Contract');
    } finally {
      setIsEmploymentContractLoading(false);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4242EA] to-[#8b5cf6] bg-clip-text text-transparent mb-2">
          Financial Planning
        </h1>
        <p className="text-lg text-gray-600">
          Manage your payment and employment information.
        </p>
      </div>

      {message && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{message}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

        {/* Documents Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6 text-[#4242EA]" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Good Job Agreement */}
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Good Job Agreement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {uploadedFiles.goodJobAgreement ? (
                    <>
                      <Button
                        onClick={openGjaModal}
                        className="w-full bg-[#4242EA] hover:bg-[#3535C7] text-white"
                      >
                        View Your Signed Agreement
                      </Button>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Your signed agreement is on file
                        </div>
                        {uploadedFiles.goodJobAgreement.uploadedAt && (
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(uploadedFiles.goodJobAgreement.uploadedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={openGjaModal}
                        variant="outline"
                        className="w-full border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
                      >
                        View Template Agreement
                      </Button>
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertDescription className="text-amber-800 text-sm">
                          Your signed agreement will appear here once it's been uploaded.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                  <p className="text-xs text-gray-500 italic">
                    Please note that your Good Job Agreement does not take effect until you start L2.
                  </p>
                </CardContent>
              </Card>

              {/* Good Job Agreement FAQs */}
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Good Job Agreement FAQs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={openFaqsModal}
                    className="w-full bg-[#4242EA] hover:bg-[#3535C7] text-white"
                  >
                    View FAQs
                  </Button>
                </CardContent>
              </Card>

              {/* Bill.com Guide */}
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Bill.com Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={openBillComModal}
                    className="w-full bg-[#4242EA] hover:bg-[#3535C7] text-white"
                  >
                    View Bill.com Guide
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Personal Financial Planning Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="h-6 w-6 text-[#4242EA]" />
              Personal Financial Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Card className="bg-gradient-to-br from-[#4242EA]/5 to-[#8b5cf6]/5 border-[#4242EA]/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">Take control of your finances</h3>
                    <p className="text-gray-600">
                      Whether you're looking to budget smarter, manage debt, or start saving for what's next, the Pursuit team is here to help you plan for financial stability.
                    </p>
                  </div>
                  <Button
                    onClick={openSchedulingLink}
                    size="lg"
                    className="bg-[#4242EA] hover:bg-[#3535C7] text-white px-8 py-3 text-lg whitespace-nowrap"
                  >
                    Schedule session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Invoice Calculator Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="h-6 w-6 text-[#4242EA]" />
              Invoice Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome" className="text-sm font-medium uppercase tracking-wide text-gray-600">
                    Monthly Income
                  </Label>
                  <Input
                    type="number"
                    id="monthlyIncome"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="Enter monthly income"
                    className="text-lg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#4242EA]/10 to-[#8b5cf6]/10 rounded-lg border border-[#4242EA]/20">
                    <span className="text-sm font-medium text-gray-600">Annualized Income:</span>
                    <span className="text-lg font-semibold text-[#4242EA]">${annualizedIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#4242EA]/10 to-[#8b5cf6]/10 rounded-lg border border-[#4242EA]/20">
                    <span className="text-sm font-medium text-gray-600">Percentage Owed:</span>
                    <span className="text-lg font-semibold text-[#4242EA]">{incomeSharePercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#4242EA]/10 to-[#8b5cf6]/10 rounded-lg border border-[#4242EA]/20">
                    <span className="text-sm font-medium text-gray-600">Monthly Payment:</span>
                    <span className="text-lg font-semibold text-[#4242EA]">${monthlyPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-[#4242EA] mb-4 border-b-2 border-[#4242EA] pb-2">
                  Payment Percentage
                </h4>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    {versionConfig?.isTiered ? (
                      <div className="space-y-3">
                        <p className="text-gray-700">Your contract uses a <strong>tiered income share percentage</strong>:</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-white rounded border">
                            <span className="font-medium">$50,000 - $60,000:</span>
                            <Badge variant="secondary">{versionConfig.tiers.find(t => t.min === 50000)?.percentage}%</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded border">
                            <span className="font-medium">$60,000 - $70,000:</span>
                            <Badge variant="secondary">{versionConfig.tiers.find(t => t.min === 60000)?.percentage}%</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded border">
                            <span className="font-medium">$70,000+:</span>
                            <Badge variant="secondary">{versionConfig.tiers.find(t => t.min === 70000)?.percentage}%</Badge>
                          </div>
                        </div>
                      </div>
                    ) : versionConfig?.monthlyThreshold || versionConfig?.annualThreshold ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <p className="text-blue-800">
                            If your income in one calendar month is <strong>less than ${versionConfig.monthlyThreshold ? `$${versionConfig.monthlyThreshold.toLocaleString()}` : `$${(versionConfig.annualThreshold / 12).toLocaleString()}`}</strong>, representing an annualized income of <strong>less than ${versionConfig.annualThreshold ? `$${versionConfig.annualThreshold.toLocaleString()}` : `$${(versionConfig.monthlyThreshold * 12).toLocaleString()}`}</strong>, then you owe <strong className="text-blue-600">0%</strong>.
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                          <p className="text-green-800">
                            If your income is <strong>equal to or greater than ${versionConfig.monthlyThreshold ? `$${versionConfig.monthlyThreshold.toLocaleString()}` : `$${(versionConfig.annualThreshold / 12).toLocaleString()}`}</strong>, representing an annualized income of <strong>equal to or greater than ${versionConfig.annualThreshold ? `$${versionConfig.annualThreshold.toLocaleString()}` : `$${(versionConfig.monthlyThreshold * 12).toLocaleString()}`}</strong>, then your income percentage owed is <strong className="text-green-600">{versionConfig.incomeSharePercentage}%</strong>.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700">
                        Based on your contract version ({versionConfig?.name || 'Unknown'}), your income share percentage is <strong className="text-[#4242EA]">{versionConfig?.incomeSharePercentage || 0}%</strong>.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-[#4242EA] mb-4 border-b-2 border-[#4242EA] pb-2">
                  When Payments End
                </h4>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="text-gray-700 mb-4 italic">
                      Once the first of these events occurs, you will no longer owe any more payments:
                    </p>

                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-5 bg-[#4242EA] text-white font-semibold text-center py-3">
                        <div className="py-2">Payment Term</div>
                        <div className="py-2 bg-[#3535C7]">OR</div>
                        <div className="py-2">Payment Cap</div>
                        {versionConfig?.coveredPeriod && (
                          <>
                            <div className="py-2 bg-[#3535C7]">OR</div>
                            <div className="py-2">Payment Period</div>
                          </>
                        )}
                      </div>
                      <div className="grid grid-cols-5 text-center py-4 border-b">
                        <div className="py-2 font-medium">{versionConfig?.maxPayments || 36} Payments</div>
                        <div className="py-2"></div>
                        <div className="py-2 font-medium">${versionConfig?.maxPaymentAmount ? versionConfig.maxPaymentAmount.toLocaleString() : '55,000'}</div>
                        {versionConfig?.coveredPeriod && (
                          <>
                            <div className="py-2"></div>
                            <div className="py-2 font-medium">{Math.round(versionConfig.coveredPeriod / 12)} Years</div>
                          </>
                        )}
                      </div>
                      <div className="grid grid-cols-5 text-center py-3 text-sm text-gray-600 bg-gray-50">
                        <div className="py-2 px-2">Payments end after you have made this many monthly payments,</div>
                        <div className="py-2"></div>
                        <div className="py-2 px-2">Payments end when you have paid this amount in total,</div>
                        {versionConfig?.coveredPeriod && (
                          <>
                            <div className="py-2"></div>
                            <div className="py-2 px-2">Payments end this many years after the Program Launch Date even if you've made no payments.</div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Upload className="h-6 w-6 text-[#4242EA]" />
              Employment Information
            </CardTitle>
            <CardDescription>
              Keep your employment information up to date for invoice processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmploymentUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium uppercase tracking-wide text-gray-600">
                    Company Name
                  </Label>
                  <Input
                    type="text"
                    id="companyName"
                    value={employmentInfo.companyName}
                    onChange={(e) => setEmploymentInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium uppercase tracking-wide text-gray-600">
                    Role
                  </Label>
                  <Input
                    type="text"
                    id="position"
                    value={employmentInfo.position}
                    onChange={(e) => setEmploymentInfo(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Enter your position"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium uppercase tracking-wide text-gray-600">
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    id="startDate"
                    value={employmentInfo.startDate}
                    onChange={(e) => setEmploymentInfo(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-sm font-medium uppercase tracking-wide text-gray-600">
                    Salary (Annual)
                  </Label>
                  <Input
                    type="number"
                    id="salary"
                    value={employmentInfo.salary}
                    onChange={(e) => setEmploymentInfo(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="Enter annual salary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType" className="text-sm font-medium uppercase tracking-wide text-gray-600">
                    Employment Type
                  </Label>
                  <Select
                    value={employmentInfo.employmentType}
                    onValueChange={(value) => setEmploymentInfo(prev => ({ ...prev, employmentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium uppercase tracking-wide text-gray-600">
                    Employment Contract
                  </Label>
                  <div className="space-y-3">
                    <Input
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
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => openFileDialog('employmentContract')}
                      variant="outline"
                      className="w-full border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
                    >
                      {uploadedFiles.employmentContract ? 'Replace Contract' : 'Upload Contract'}
                    </Button>
                    {uploadedFiles.employmentContract && (
                      <>
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          {uploadedFiles.employmentContract.name}
                        </div>
                        <Button
                          type="button"
                          onClick={openEmploymentContractModal}
                          variant="outline"
                          size="sm"
                          className="w-full border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
                        >
                          Preview Contract
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#4242EA] hover:bg-[#3535C7] text-white px-8 py-3"
                >
                  {isLoading ? 'Updating...' : 'Update Employment Information'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      {/* Good Job Agreement Modal */}
      <Dialog open={isGjaModalOpen} onOpenChange={setIsGjaModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {uploadedFiles.goodJobAgreement ? 'Your Signed Good Job Agreement' : 'Good Job Agreement Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {isGjaLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">Loading...</div>
              </div>
            ) : gjaError ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{gjaError}</AlertDescription>
              </Alert>
            ) : (
              <>
                {gjaFileType === 'image' && gjaText ? (
                  <div className="flex justify-center">
                    <img src={gjaText} alt="Good Job Agreement" className="max-w-full max-h-96 object-contain" />
                  </div>
                ) : gjaFileType === 'pdf' && gjaText ? (
                  <div className="flex justify-center">
                    <iframe src={gjaText} className="w-full h-96" title="Good Job Agreement" />
                  </div>
                ) : gjaFileType === 'text' && gjaText ? (
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">{gjaText}</pre>
                ) : null}
              </>
            )}
          </div>
          <div className="flex justify-center pt-4">
            <Button
              asChild
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
            >
              <a
                href={(() => {
                  const url = uploadedFiles?.goodJobAgreement?.url || '/uploads/payment-documents/Good_Job_Agreement.pdf';
                  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill.com Guide Modal */}
      <Dialog open={isBillComModalOpen} onOpenChange={setIsBillComModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Bill.com Guide</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {isBillComLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">Loading...</div>
              </div>
            ) : billComError ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{billComError}</AlertDescription>
              </Alert>
            ) : (
              <>
                {billComText && billComText.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                  <div className="flex justify-center">
                    <img src={billComText} alt="Bill.com Guide" className="max-w-full max-h-96 object-contain" />
                  </div>
                ) : billComText && billComText.match(/\.pdf$/i) ? (
                  <div className="flex justify-center">
                    <iframe src={billComText} className="w-full h-96" title="Bill.com Guide" />
                  </div>
                ) : (
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">{billComText}</pre>
                )}
              </>
            )}
          </div>
          <div className="flex justify-center pt-4">
            <Button
              asChild
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
            >
              <a
                href={`${import.meta.env.VITE_API_URL}/uploads/payment-documents/Bill.Com%20Set%20Up%20Instructions.pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQs Modal */}
      <Dialog open={isFaqsModalOpen} onOpenChange={setIsFaqsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Good Job Agreement FAQs</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {isFaqsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">Loading...</div>
              </div>
            ) : faqsError ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{faqsError}</AlertDescription>
              </Alert>
            ) : (
              <>
                {faqsText && faqsText.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                  <div className="flex justify-center">
                    <img src={faqsText} alt="Good Job Agreement FAQs" className="max-w-full max-h-96 object-contain" />
                  </div>
                ) : faqsText && faqsText.match(/\.pdf$/i) ? (
                  <div className="flex justify-center">
                    <iframe src={faqsText} className="w-full h-96" title="Good Job Agreement FAQs" />
                  </div>
                ) : (
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">{faqsText}</pre>
                )}
              </>
            )}
          </div>
          <div className="flex justify-center pt-4">
            <Button
              asChild
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
            >
              <a
                href={`${import.meta.env.VITE_API_URL}/uploads/payment-documents/Good%20Job%20Agreement%20FAQs.pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employment Contract Modal */}
      <Dialog open={isEmploymentContractModalOpen} onOpenChange={setIsEmploymentContractModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Employment Contract</DialogTitle>
            <DialogDescription>
              Preview of your uploaded employment contract
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {isEmploymentContractLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">Loading...</div>
              </div>
            ) : employmentContractError ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{employmentContractError}</AlertDescription>
              </Alert>
            ) : (
              <>
                {employmentContractFileType === 'image' && employmentContractText ? (
                  <div className="flex justify-center">
                    <img src={employmentContractText} alt="Employment Contract" className="max-w-full max-h-96 object-contain" />
                  </div>
                ) : employmentContractFileType === 'pdf' && employmentContractText ? (
                  <div className="flex justify-center">
                    <iframe src={employmentContractText} className="w-full h-96" title="Employment Contract" />
                  </div>
                ) : employmentContractFileType === 'text' && employmentContractText ? (
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">{employmentContractText}</pre>
                ) : null}
              </>
            )}
          </div>
          <div className="flex justify-center pt-4">
            <Button
              asChild
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
            >
              <a
                href={(() => {
                  const url = uploadedFiles?.employmentContract?.url || '#';
                  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payment;

