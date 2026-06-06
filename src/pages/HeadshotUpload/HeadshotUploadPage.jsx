import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, CheckCircle2, XCircle, RotateCcw, Loader2, HardDrive, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import useAuthStore from '../../stores/authStore';
import { checkHeadshotMatches, bulkUploadHeadshots, searchBuilders } from '../../services/headshotApi';

// Inline builder search for manually matching unmatched files
function BuilderSearchInput({ token, onSelect, currentPick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await searchBuilders(val.trim(), token);
      setResults(res);
      setSearching(false);
    }, 300);
  };

  const handlePick = (builder) => {
    onSelect(builder);
    setQuery(`${builder.name} — ${builder.cohort}`);
    setOpen(false);
    setResults([]);
  };

  return (
    <div className="relative w-64">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input
          value={currentPick ? `${currentPick.name} — ${currentPick.cohort}` : query}
          onChange={currentPick ? undefined : handleChange}
          onFocus={() => { if (currentPick) { onSelect(null); setQuery(''); } }}
          placeholder="Search builder name…"
          className="pl-7 h-8 text-sm"
        />
      </div>
      {open && (results.length > 0 || searching) && (
        <div className="absolute z-50 bottom-full mb-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {searching && (
            <div className="px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Searching…
            </div>
          )}
          {results.map((b) => (
            <button
              key={b.userId}
              onMouseDown={() => handlePick(b)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex flex-col"
            >
              <span className="font-medium">{b.name}</span>
              <span className="text-xs text-gray-400">{b.cohort}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PICKER_API_KEY = import.meta.env.VITE_GOOGLE_PICKER_API_KEY;
const PICKER_CLIENT_ID = import.meta.env.VITE_GOOGLE_PICKER_CLIENT_ID;
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

// phases: 'select' → 'checking' → 'preview' → 'uploading' → 'results'

export default function HeadshotUploadPage() {
  const token = useAuthStore((s) => s.token);
  const [phase, setPhase] = useState('select');
  const [files, setFiles] = useState([]);
  const [checkResult, setCheckResult] = useState(null); // { matches, ambiguous, unmatched }
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  // Manual picks: { [filename]: { userId, name, cohort } } — covers ambiguous + unmatched rows
  const [manualPicks, setManualPicks] = useState({});
  const [driveReady, setDriveReady] = useState(false);
  const fileInputRef = useRef(null);
  const tokenClientRef = useRef(null);
  const gapiLoadedRef = useRef(false);

  // Load Google API scripts on mount
  useEffect(() => {
    if (!PICKER_API_KEY || !PICKER_CLIENT_ID) return;

    const loadScript = (src) => new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      document.head.appendChild(s);
    });

    Promise.all([
      loadScript('https://apis.google.com/js/api.js'),
      loadScript('https://accounts.google.com/gsi/client'),
    ]).then(() => {
      window.gapi.load('picker', () => {
        gapiLoadedRef.current = true;
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: PICKER_CLIENT_ID,
          scope: DRIVE_SCOPE,
          callback: (resp) => {
            if (resp.access_token) {
              openGooglePicker(resp.access_token);
            }
          },
        });
        setDriveReady(true);
      });
    });
  }, []);

  // Fetch all image files inside a Drive folder (handles pagination)
  const fetchImagesFromFolder = useCallback(async (folderId, accessToken) => {
    const IMAGE_MIMES = "mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/jpg'";
    const q = encodeURIComponent(`'${folderId}' in parents and (${IMAGE_MIMES}) and trashed=false`);
    const fields = encodeURIComponent('nextPageToken,files(id,name,mimeType)');
    let files = [];
    let pageToken = '';

    do {
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=200&includeItemsFromAllDrives=true&supportsAllDrives=true${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!resp.ok) throw new Error('Failed to list folder contents');
      const data = await resp.json();
      files = files.concat(data.files || []);
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    return files;
  }, []);

  const openGooglePicker = useCallback((accessToken) => {
    if (!gapiLoadedRef.current) return;

    // My Drive — browse folders + images
    const myDriveView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes('application/vnd.google-apps.folder,image/jpeg,image/jpg,image/png');

    // Shared Drives — same capabilities
    const sharedDriveView = new window.google.picker.DocsView()
      .setEnableDrives(true)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes('application/vnd.google-apps.folder,image/jpeg,image/jpg,image/png');

    new window.google.picker.PickerBuilder()
      .setOAuthToken(accessToken)
      .setDeveloperKey(PICKER_API_KEY)
      .addView(myDriveView)
      .addView(sharedDriveView)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
      .setCallback(async (data) => {
        if (data.action !== window.google.picker.Action.PICKED) return;

        // Expand any selected folders into their image files
        const FOLDER_MIME = 'application/vnd.google-apps.folder';
        let fileMetas = [];
        for (const doc of data.docs) {
          if (doc.mimeType === FOLDER_MIME) {
            toast.info(`Reading folder "${doc.name}"…`);
            try {
              const folderFiles = await fetchImagesFromFolder(doc.id, accessToken);
              if (folderFiles.length === 0) toast.warning(`No images found in "${doc.name}"`);
              fileMetas = fileMetas.concat(folderFiles);
            } catch {
              toast.error(`Could not read folder "${doc.name}"`);
            }
          } else {
            fileMetas.push({ id: doc.id, name: doc.name, mimeType: doc.mimeType });
          }
        }

        if (fileMetas.length === 0) return;
        toast.info(`Downloading ${fileMetas.length} image${fileMetas.length !== 1 ? 's' : ''} from Drive…`);

        try {
          const downloadedFiles = await Promise.all(
            fileMetas.map(async (f) => {
              const resp = await fetch(
                `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              if (!resp.ok) throw new Error(`Failed to download ${f.name}`);
              const blob = await resp.blob();
              return new File([blob], f.name, { type: blob.type || 'image/jpeg' });
            })
          );
          handleFilesSelected(downloadedFiles);
        } catch (err) {
          toast.error(`Drive download failed: ${err.message}`);
        }
      })
      .build()
      .setVisible(true);
  }, [fetchImagesFromFolder]);

  const handlePickFromDrive = () => {
    if (!driveReady) { toast.error('Google Drive not ready yet.'); return; }
    // Always request a fresh token — Google access tokens expire after 1 hour.
    // GIS returns silently if the user is already authenticated and token is fresh.
    tokenClientRef.current.requestAccessToken();
  };

  const handleFilesSelected = async (selectedFiles) => {
    const fileArr = Array.from(selectedFiles).filter(f =>
      ['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
    );
    if (fileArr.length === 0) {
      toast.error('No valid image files. Only JPEG and PNG are accepted.');
      return;
    }
    setFiles(fileArr);
    setManualPicks({});
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
      // Build assignment list from all manually resolved files (ambiguous + unmatched)
      const assignments = Object.entries(manualPicks)
        .filter(([, pick]) => pick)
        .map(([filename, pick]) => ({ filename, userId: pick.userId }));

      // Upload: confirmed matches + resolved ambiguous files
      const resolvedFilenames = new Set([
        ...(checkResult.matches ?? []).map(m => m.filename),
        ...assignments.map(a => a.filename),
      ]);
      const filesToUpload = files.filter(f => resolvedFilenames.has(f.name));

      const data = await bulkUploadHeadshots(filesToUpload, token, assignments);
      if (data.warnings?.length) {
        data.warnings.forEach(w => toast.warning(w));
      }
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
    setManualPicks({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const manuallyResolvedCount = Object.values(manualPicks).filter(Boolean).length;
  const uploadableCount = (checkResult?.matches?.length ?? 0) + manuallyResolvedCount;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Camera className="h-6 w-6 text-[#4242EA]" />
        <h1 className="text-2xl font-semibold text-[#1E1E1E]">Headshot Upload</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Bulk-upload photographer headshots and automatically map them to builder profiles.
        Accepted formats:{' '}
        <code className="bg-gray-100 px-1 rounded">firstname_lastname_monthyear.jpg</code>
        {' '}or{' '}
        <code className="bg-gray-100 px-1 rounded">firstname_lastname.jpg</code>
      </p>

      {/* PHASE: select */}
      {phase === 'select' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-14 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[#4242EA] bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-[#4242EA] hover:bg-blue-50'
            }`}
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-base font-medium text-gray-700">Drop headshot files here</p>
            <p className="text-sm text-gray-400 mt-1">or click to select from your computer</p>
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

          {PICKER_CLIENT_ID && (
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
          )}

          {PICKER_CLIENT_ID && (
            <Button
              variant="outline"
              onClick={handlePickFromDrive}
              disabled={!driveReady}
              className="w-full flex items-center justify-center gap-2 h-12"
            >
              <HardDrive className="h-4 w-4" />
              {driveReady ? 'Pick from Google Drive' : 'Loading Drive…'}
            </Button>
          )}
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

      {/* PHASE: preview */}
      {phase === 'preview' && checkResult && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm font-medium text-gray-700">{files.length} files checked</span>
            {(checkResult.matches?.length ?? 0) > 0 && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {checkResult.matches.length} matched
              </Badge>
            )}
            {(checkResult.ambiguous?.length ?? 0) > 0 && (
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                {checkResult.ambiguous.length} needs selection
              </Badge>
            )}
            {(checkResult.unmatched?.length ?? 0) > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                {checkResult.unmatched.length} no match
              </Badge>
            )}
          </div>

          {/* Confirmed matches */}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Ambiguous — multiple builders share the name, pick from known options */}
          {(checkResult.ambiguous?.length ?? 0) > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-1">
                Needs selection
              </h2>
              <p className="text-xs text-gray-500 mb-2">
                Multiple builders share this name. Pick the right one or leave blank to skip.
              </p>
              <div className="border border-yellow-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Parsed name</TableHead>
                      <TableHead>Select builder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkResult.ambiguous.map((a, i) => (
                      <TableRow key={i} className="bg-yellow-50">
                        <TableCell className="font-mono text-xs text-gray-600">{a.filename}</TableCell>
                        <TableCell className="text-gray-700">{a.parsedName}</TableCell>
                        <TableCell>
                          <Select
                            value={manualPicks[a.filename] ? String(manualPicks[a.filename].userId) : ''}
                            onValueChange={(val) => {
                              const opt = a.options.find(o => String(o.userId) === val);
                              setManualPicks(prev => ({ ...prev, [a.filename]: opt || null }));
                            }}
                          >
                            <SelectTrigger className="w-56 h-8 text-sm">
                              <SelectValue placeholder="Skip this file" />
                            </SelectTrigger>
                            <SelectContent>
                              {a.options.map((opt) => (
                                <SelectItem key={opt.userId} value={String(opt.userId)}>
                                  {opt.name} — {opt.cohort}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Unmatched — search and manually assign, or leave to skip */}
          {(checkResult.unmatched?.length ?? 0) > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-1">
                No match found
              </h2>
              <p className="text-xs text-gray-500 mb-2">
                Search for the right builder to manually assign, or leave blank to skip.
              </p>
              <div className="border border-red-200 rounded-lg overflow-visible">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Assign to builder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkResult.unmatched.map((m, i) => (
                      <TableRow key={i} className={manualPicks[m.filename] ? 'bg-green-50' : 'bg-red-50'}>
                        <TableCell className="font-mono text-xs text-gray-600">{m.filename}</TableCell>
                        <TableCell className="text-red-600 text-sm">
                          {manualPicks[m.filename]
                            ? <span className="text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Manually assigned</span>
                            : m.reason}
                        </TableCell>
                        <TableCell>
                          <BuilderSearchInput
                            token={token}
                            currentPick={manualPicks[m.filename] || null}
                            onSelect={(builder) =>
                              setManualPicks(prev => ({ ...prev, [m.filename]: builder }))
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4 items-center">
            <Button variant="outline" onClick={reset}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploadableCount === 0}>
              Confirm &amp; Upload {uploadableCount} headshot{uploadableCount !== 1 ? 's' : ''}
            </Button>
            {uploadableCount === 0 && (
              <span className="text-sm text-gray-500">No files to upload — fix filenames and try again.</span>
            )}
          </div>
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
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Uploaded</h2>
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
              <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">Failed</h2>
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
