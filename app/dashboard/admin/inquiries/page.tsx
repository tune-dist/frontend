'use client';

import { useEffect, useMemo, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, MessageSquare, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import { contactApi, ContactInquiry } from '@/lib/api/contact';
import { PageSearchBar, PageSearchSection } from '@/components/dashboard/page-search-bar';

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function matchesInquirySearch(inquiry: ContactInquiry, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return [
    inquiry.name,
    inquiry.email,
    inquiry.subject,
    inquiry.message,
    inquiry.plan ?? '',
  ].some((field) => field.toLowerCase().includes(q));
}

export default function InquiriesPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  const canView = hasPermission(user, 'VIEW_CONTACT_INQUIRIES');

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const data = await contactApi.getInquiries();
      setInquiries(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load inquiries'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!canView) {
      router.replace('/dashboard');
      return;
    }
    fetchInquiries();
  }, [user, canView, router]);

  const filteredInquiries = useMemo(
    () => inquiries.filter((item) => matchesInquirySearch(item, searchQuery)),
    [inquiries, searchQuery],
  );

  if (!user || !canView) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font_heading">Contact Inquiries</h1>
        <p className="text-muted-foreground mt-1">
          Messages submitted from the public contact form.
        </p>
      </div>

      <PageSearchSection>
        <PageSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, subject, or message..."
        />
      </PageSearchSection>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All Inquiries
          </CardTitle>
          <CardDescription>
            {total} total {total === 1 ? 'inquiry' : 'inquiries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {searchQuery ? 'No inquiries match your search.' : 'No inquiries yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{inquiry.subject}</TableCell>
                      <TableCell>{inquiry.plan || '—'}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(inquiry.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedInquiry?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedInquiry?.name} · {selectedInquiry && formatDate(selectedInquiry.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedInquiry.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
                {selectedInquiry.plan && (
                  <div>
                    <p className="text-muted-foreground">Plan</p>
                    <p className="font-medium">{selectedInquiry.plan}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
