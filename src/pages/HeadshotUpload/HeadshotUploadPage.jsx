import { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import useAuthStore from '../../stores/authStore';
import { checkHeadshotMatches, bulkUploadHeadshots } from '../../services/headshotApi';

// phases: 'select' → 'checking' → 'preview' → 'uploading' → 'results'

export default function HeadshotUploadPage() {
  const token = useAuthStore((s) => s.token);
  const [phase, setPhase] = useState('select');
  const [files, setFiles] = useState([]);
  const [checkResult, setCheckResult] = useState(null); // { matches, unmatched }
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilesSelected = async (selectedFiles) => {
    const fileArr = Array.from(selectedFiles).filter(f =>
      ['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
    );
    if (fileArr.length === 0) {
      toast.error('No valid image files. Only JPEG and PNG are accepted.');
      return;
    }
    setFiles(fileArr);
    setPhase('checking');

    try {
      const result = await checkHeadshotMatches(fileArr.map(f => f.name), token);
      setCheckResult(result);
      setPhase('preview');
    } catch (error) {
      toast.error(`Could not check matches: ${error.message}`);
      setPhase('select');
      setFiles([]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    setPhase('uploading');
    try {
      // Only upload files that matched a builder
      const matchedFilenames = new Set(checkResult.matches.map(m => m.filename));
      const filesToUpload = files.filter(f => matchedFilenames.has(f.name));
      const data = await bulkUploadHeadshots(filesToUpload, token);
      setUploadResult(data);
      setPhase('results');
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
      setPhase('preview');
    }
  };

  const reset = () => {
    setPhase('select');
    setFiles([]);
    setCheckResult(null);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Camera className="h-6 w-6 text-[#4242EA]" />
        <h1 className="text-2xl font-semibold text-[#1E1E1E]">Headshot Upload</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Bulk-upload photographer headshots and automatically map them to builder profiles.
        Filenames must follow: <code className="bg-gray-100 px-1 rounded">firstname_lastname_monthyear.jpg</code>
      </p>

      {/* PHASE: select */}
      {phase === 'select' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-16 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#4242EA] bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-[#4242EA] hover:bg-blue-50'
          }`}
        >
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-base font-medium text-gray-700">Drop headshot files here</p>
          <p className="text-sm text-gray-400 mt-1">or click to select files</p>
          <p className="text-xs text-gray-400 mt-3">JPEG and PNG only · up to 200 files at once</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
        </div>
      )}

      {/* PHASE: checking */}
      {phase === 'checking' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#4242EA]" />
          <p className="text-sm">Checking {files.length} files against builder records…</p>
        </div>
      )}

      {/* PHASE: uploading */}
      {phase === 'uploading' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#4242EA]" />
          <p className="text-sm">Uploading headshots to builder profiles…</p>
        </div>
      )}

      {/* PHASE: preview — DB-verified matches, staff confirms before anything is written */}
      {phase === 'preview' && checkResult && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-700">{files.length} files checked</span>
            {checkResult.matches.length > 0 && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {checkResult.matches.length} matched
              </Badge>
            )}
            {checkResult.unmatched.length > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                {checkResult.unmatched.length} no match
              </Badge>
            )}
          </div>

          {checkResult.matches.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Will upload
              </h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Builder</TableHead>
                      <TableHead>Cohort</TableHead>
                      <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkResult.matches.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs text-gray-600">{m.filename}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          {m.name}
                        </TableCell>
                        <TableCell>{m.cohort}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 border-green-200">Upload</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {checkResult.unmatched.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">
                Will skip
              </h2>
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkResult.unmatched.map((m, i) => (
                      <TableRow key={i} className="bg-red-50">
                        <TableCell className="font-mono text-xs text-gray-600">{m.filename}</TableCell>
                        <TableCell className="text-red-600 text-sm">{m.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={checkResult.matches.length === 0}
            >
              Confirm &amp; Upload {checkResult.matches.length} headshot{checkResult.matches.length !== 1 ? 's' : ''}
            </Button>
          </div>
          {checkResult.matches.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No matched files to upload. Fix filenames and try again.</p>
          )}
        </div>
      )}

      {/* PHASE: results */}
      {phase === 'results' && uploadResult && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">{uploadResult.matched.length} uploaded</span>
            </div>
            {uploadResult.unmatched.length > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">{uploadResult.unmatched.length} failed</span>
              </div>
            )}
          </div>

          {uploadResult.matched.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Uploaded
              </h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Builder</TableHead>
                      <TableHead>Cohort</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadResult.matched.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs text-gray-600">{item.filename}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {item.name}
                        </TableCell>
                        <TableCell>{item.cohort}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {uploadResult.unmatched.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">
                Failed
              </h2>
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadResult.unmatched.map((item, i) => (
                      <TableRow key={i} className="bg-red-50">
                        <TableCell className="font-mono text-xs text-gray-600">{item.filename}</TableCell>
                        <TableCell className="text-red-600 text-sm">{item.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={reset} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Upload More
          </Button>
        </div>
      )}
    </div>
  );
}
