'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/get-error-message';
import PageLoading from '@/components/dashboard/page-loading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Loader2, RotateCcw, Upload, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canManageStreamImports } from '@/lib/permissions';
import {
  PAGE_SIZE,
  streamImportsApi,
  StreamImportRecord,
} from '@/lib/api/stream-imports';
import { PageSearchBar, PageSearchSection } from '@/components/dashboard/page-search-bar';

export default function StreamImportsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<StreamImportRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [importFormat, setImportFormat] = useState<'long' | 'wide'>('long');
  const [dayLabels, setDayLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const canManage = canManageStreamImports(user);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await streamImportsApi.list(page, PAGE_SIZE, debouncedSearch);
      setRecords(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setImportFormat(data.importFormat);
      setDayLabels(data.dayLabels);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load imported records'));
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (!user) return;
    if (!canManage) {
      router.replace('/dashboard');
      return;
    }
    void fetchRecords();
  }, [user, canManage, router, fetchRecords]);

  const handleDownloadSample = async () => {
    try {
      setIsDownloadingSample(true);
      const blob = await streamImportsApi.downloadSample();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'stream-import-sample.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to download sample file'));
    } finally {
      setIsDownloadingSample(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const result = await streamImportsApi.upload(file);
      toast.success(
        `Imported ${result.importedRows} play rows from ${result.totalRows} CSV records`,
      );
      setPage(1);
      await fetchRecords();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to upload stream import'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRevertLatest = async () => {
    if (!window.confirm('Revert the most recent import and roll back stream counts?')) {
      return;
    }

    try {
      setIsReverting(true);
      const result = await streamImportsApi.revertLatest();
      toast.success(
        `Reverted ${result.originalFilename} (${result.removedRecords} records removed)`,
      );
      setPage(1);
      await fetchRecords();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to revert latest import'));
    } finally {
      setIsReverting(false);
    }
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  if (!user || !canManage) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font_heading">Stream Imports</h1>
        <p className="text-muted-foreground mt-1">
          Upload CSV and view imported data exactly like your Excel sheet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Consolidated format: isrc, dsp, song_name, album_name, singer, language, genre, date,
            play_count. Platform monthly Excel exports are also supported.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Choose CSV File'}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleDownloadSample()}
            disabled={isDownloadingSample}
          >
            {isDownloadingSample ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Sample
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleRevertLatest()}
            disabled={isReverting || total === 0}
          >
            {isReverting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Revert Latest
          </Button>
        </CardContent>
      </Card>

      <PageSearchSection>
        <PageSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ISRC, song, artist, platform..."
        />
      </PageSearchSection>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Upload History
          </CardTitle>
          <CardDescription>
            {total} {total === 1 ? 'record' : 'records'} — same columns as your CSV / Excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {debouncedSearch
                ? 'No records match your search.'
                : 'No imported records yet. Upload a CSV or download the sample file to get started.'}
            </div>
          ) : importFormat === 'wide' && dayLabels.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ISRC</TableHead>
                    <TableHead>Song Name</TableHead>
                    <TableHead>Album Name</TableHead>
                    <TableHead>Singer</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Platform</TableHead>
                    {dayLabels.map((label) => (
                      <TableHead key={label} className="text-center whitespace-nowrap">
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">{record.isrc}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{record.songName || '—'}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{record.albumName || '—'}</TableCell>
                      <TableCell className="max-w-[140px] truncate">{record.singer || '—'}</TableCell>
                      <TableCell>{record.language || '—'}</TableCell>
                      <TableCell className="max-w-[140px] truncate">{record.genre || '—'}</TableCell>
                      <TableCell className="capitalize">{record.dsp}</TableCell>
                      {dayLabels.map((label) => (
                        <TableCell key={`${record.id}-${label}`} className="text-center">
                          {record.dailyPlays?.[label] ?? 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ISRC</TableHead>
                    <TableHead>DSP</TableHead>
                    <TableHead>Song Name</TableHead>
                    <TableHead>Album Name</TableHead>
                    <TableHead>Singer</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Play Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">{record.isrc}</TableCell>
                      <TableCell className="capitalize">{record.dsp}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{record.songName || '—'}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{record.albumName || '—'}</TableCell>
                      <TableCell className="max-w-[140px] truncate">{record.singer || '—'}</TableCell>
                      <TableCell>{record.language || '—'}</TableCell>
                      <TableCell className="max-w-[140px] truncate">{record.genre || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.dataDate || '—'}</TableCell>
                      <TableCell>{record.playCount?.toLocaleString() ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && total > 0 && (
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {rangeStart} to {rangeEnd} of {total} records
                {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
